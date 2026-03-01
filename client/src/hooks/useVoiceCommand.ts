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
};

/**
 * Hook that provides voice command recognition using the Web Speech API.
 * Listens continuously for keyword commands and triggers callbacks.
 * 
 * Supported commands are matched case-insensitively against the transcript.
 * The recognizer restarts automatically after each result to maintain
 * continuous listening.
 */
export function useVoiceCommand(config: VoiceCommandConfig): VoiceCommandState {
  const { commands, enabled, lang = "en-US", onCommandRecognized, onError } = config;

  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const commandsRef = useRef(commands);
  const enabledRef = useRef(enabled);
  const shouldRestartRef = useRef(false);
  const isListeningRef = useRef(false);

  // Keep refs in sync
  useEffect(() => {
    commandsRef.current = commands;
  }, [commands]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const createRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false; // We restart manually for reliability
    recognition.interimResults = true; // Get partial results for faster response
    recognition.lang = lang;
    recognition.maxAlternatives = 3; // Check multiple interpretations

    recognition.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Check all results (including interim) for command matches
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        
        // Check all alternatives for a match
        for (let j = 0; j < result.length; j++) {
          const transcript = result[j].transcript.trim().toLowerCase();
          setLastTranscript(transcript);

          // Check each registered command
          for (const [keyword, callback] of Object.entries(commandsRef.current)) {
            if (transcript.includes(keyword.toLowerCase())) {
              setLastCommand(keyword);
              onCommandRecognized?.(keyword);
              callback();

              // Stop and restart to avoid duplicate triggers
              try {
                recognition.stop();
              } catch {
                // Ignore stop errors
              }
              return;
            }
          }
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "no-speech" and "aborted" are normal operational states, not real errors
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }

      // "not-allowed" means the user denied microphone permission
      if (event.error === "not-allowed") {
        onError?.("Microphone permission denied. Please allow microphone access for voice commands.");
        shouldRestartRef.current = false;
        isListeningRef.current = false;
        setIsListening(false);
        return;
      }

      onError?.(event.error);
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setIsListening(false);

      // Auto-restart if we should still be listening
      if (shouldRestartRef.current && enabledRef.current) {
        // Small delay to avoid rapid restart loops
        setTimeout(() => {
          if (shouldRestartRef.current && enabledRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {
              // Recognition might already be started
            }
          }
        }, 100);
      }
    };

    return recognition;
  }, [isSupported, lang, onCommandRecognized, onError]);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    shouldRestartRef.current = true;

    if (!recognitionRef.current) {
      recognitionRef.current = createRecognition();
    }

    if (recognitionRef.current && !isListeningRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // Already started
      }
    }
  }, [isSupported, createRecognition]);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Already stopped
      }
    }

    isListeningRef.current = false;
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current || shouldRestartRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

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
  };
}
