import { useCallback, useEffect, useRef, useState } from "react";

// Extend the window interface for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export type VoiceCommandConfig = {
  /** Map of command keywords to their callback functions */
  commands: Record<string, () => void>;
  /** Whether voice recognition should be active */
  enabled: boolean;
  /** Language for recognition (default: "en-US") */
  lang?: string;
  /** Callback when a command is recognized */
  onCommandRecognized?: (command: string) => void;
  /** Callback when recognition encounters an error */
  onError?: (error: string) => void;
};

export type VoiceCommandState = {
  /** Whether the browser supports speech recognition */
  isSupported: boolean;
  /** Whether the recognizer is actively listening */
  isListening: boolean;
  /** The last recognized transcript */
  lastTranscript: string;
  /** The last matched command */
  lastCommand: string | null;
  /** Start listening manually */
  startListening: () => void;
  /** Stop listening manually */
  stopListening: () => void;
  /** Toggle listening on/off */
  toggleListening: () => void;
  /** Temporarily mute command processing (e.g., while app is speaking) */
  mute: (durationMs?: number) => void;
};

/**
 * Hook that provides voice command recognition using the Web Speech API.
 * Listens continuously for keyword commands and triggers callbacks.
 *
 * Key design decisions:
 * - Uses `continuous = true` so the recognizer stays open longer
 * - `isListening` state does NOT flicker during auto-restarts (uses shouldBeListening ref)
 * - All callbacks are accessed via refs to avoid stale closure issues
 * - Debounces command triggers to prevent double-fires
 * - `mute()` temporarily ignores commands (prevents app speech from self-triggering)
 */
export function useVoiceCommand(config: VoiceCommandConfig): VoiceCommandState {
  const { commands, enabled, lang = "en-US", onCommandRecognized, onError } = config;

  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const commandsRef = useRef(commands);
  const enabledRef = useRef(enabled);
  const onCommandRecognizedRef = useRef(onCommandRecognized);
  const onErrorRef = useRef(onError);
  const shouldBeListeningRef = useRef(false);
  const isActuallyListeningRef = useRef(false);
  const lastCommandTimeRef = useRef(0);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mutedUntilRef = useRef(0); // Timestamp until which commands are ignored
  const muteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep ALL refs in sync every render - no stale closures
  useEffect(() => { commandsRef.current = commands; }, [commands]);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);
  useEffect(() => { onCommandRecognizedRef.current = onCommandRecognized; }, [onCommandRecognized]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const createRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true; // Stay open - more reliable than manual restart
    recognition.interimResults = true; // Get partial results for faster response
    recognition.lang = lang;
    recognition.maxAlternatives = 3; // Check multiple interpretations

    recognition.onstart = () => {
      isActuallyListeningRef.current = true;
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const now = Date.now();
      
      // Debounce: ignore commands within 2s of last trigger
      if (now - lastCommandTimeRef.current < 2000) return;
      
      // Mute check: ignore commands while the app is speaking
      if (now < mutedUntilRef.current) {
        console.log('🔇 Voice command ignored (muted - app is speaking)');
        return;
      }

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];

        for (let j = 0; j < result.length; j++) {
          const transcript = result[j].transcript.trim().toLowerCase();
          setLastTranscript(transcript);

          // Check each registered command via ref (always fresh)
          for (const [keyword, callback] of Object.entries(commandsRef.current)) {
            if (transcript.includes(keyword.toLowerCase())) {
              lastCommandTimeRef.current = now;
              setLastCommand(keyword);
              onCommandRecognizedRef.current?.(keyword);
              callback();
              return;
            }
          }
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "no-speech" and "aborted" are normal operational states
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }

      if (event.error === "not-allowed") {
        onErrorRef.current?.("Microphone permission denied. Please allow microphone access for voice commands.");
        shouldBeListeningRef.current = false;
        isActuallyListeningRef.current = false;
        setIsListening(false);
        return;
      }

      onErrorRef.current?.(event.error);
    };

    recognition.onend = () => {
      isActuallyListeningRef.current = false;

      // Auto-restart if we should still be listening
      // Do NOT set isListening to false during restart gap - prevents flicker
      if (shouldBeListeningRef.current && enabledRef.current) {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          if (shouldBeListeningRef.current && enabledRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {
              // Recognition might already be started
            }
          } else {
            // We actually stopped - now update the UI state
            setIsListening(false);
          }
        }, 150);
      } else {
        setIsListening(false);
      }
    };

    return recognition;
  }, [isSupported, lang]);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    shouldBeListeningRef.current = true;
    setIsListening(true); // Optimistically set to true

    if (!recognitionRef.current) {
      recognitionRef.current = createRecognition();
    }

    if (recognitionRef.current && !isActuallyListeningRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // Already started
      }
    }
  }, [isSupported, createRecognition]);

  const stopListening = useCallback(() => {
    shouldBeListeningRef.current = false;

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Already stopped
      }
    }

    isActuallyListeningRef.current = false;
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (shouldBeListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  /**
   * Temporarily mute command processing for the given duration.
   * The recognizer stays active (no restart flicker), but all results are ignored.
   * Default: 4000ms (enough for most TTS utterances)
   */
  const mute = useCallback((durationMs = 4000) => {
    mutedUntilRef.current = Date.now() + durationMs;
    console.log(`🔇 Voice commands muted for ${durationMs}ms`);
    
    // Clear any existing mute timer
    if (muteTimerRef.current) clearTimeout(muteTimerRef.current);
    muteTimerRef.current = setTimeout(() => {
      console.log('🔊 Voice commands unmuted');
    }, durationMs);
  }, []);

  // Start/stop based on enabled prop
  useEffect(() => {
    if (enabled && isSupported) {
      startListening();
    } else {
      stopListening();
    }

    return () => {
      stopListening();
      if (recognitionRef.current) {
        recognitionRef.current = null;
      }
      if (muteTimerRef.current) {
        clearTimeout(muteTimerRef.current);
      }
    };
  }, [enabled, isSupported, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    lastTranscript,
    lastCommand,
    startListening,
    stopListening,
    toggleListening,
    mute,
  };
}
