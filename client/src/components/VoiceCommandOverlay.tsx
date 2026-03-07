import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Completely standalone voice command overlay.
 * 
 * This component has ZERO coupling to Analysis.tsx internals.
 * It works by programmatically clicking the existing Start/Stop button
 * via a CSS selector. No hooks, state, or refs are injected into Analysis.tsx.
 */

// Minimal inline Speech Recognition hook — self-contained, no external dependencies
function useSimpleVoiceRecognition(options: {
  enabled: boolean;
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
}) {
  const { enabled, onTranscript, onError } = options;
  const recognitionRef = useRef<any>(null);
  const isRunningRef = useRef(false);
  const [isListening, setIsListening] = useState(false);
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);
  onTranscriptRef.current = onTranscript;
  onErrorRef.current = onError;

  const SpeechRecognition =
    typeof window !== "undefined"
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognition;

  useEffect(() => {
    if (!isSupported || !enabled) {
      // Stop if running
      if (recognitionRef.current && isRunningRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        isRunningRef.current = false;
        setIsListening(false);
      }
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 3;
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim().toLowerCase();
          onTranscriptRef.current(transcript);
        }
      }
    };

    recognition.onerror = (event: any) => {
      const err = event.error;
      if (err === "no-speech" || err === "aborted") return; // benign
      onErrorRef.current?.(err);
      if (err === "not-allowed") {
        isRunningRef.current = false;
        setIsListening(false);
        return;
      }
    };

    recognition.onend = () => {
      // Auto-restart if still enabled
      if (enabled && isRunningRef.current) {
        try { recognition.start(); } catch {}
      } else {
        isRunningRef.current = false;
        setIsListening(false);
      }
    };

    // Start
    try {
      recognition.start();
      isRunningRef.current = true;
      setIsListening(true);
    } catch {
      isRunningRef.current = false;
      setIsListening(false);
    }

    return () => {
      isRunningRef.current = false;
      try { recognition.abort(); } catch {}
      setIsListening(false);
    };
  }, [enabled, isSupported]);

  return { isListening, isSupported };
}

// Trigger words that mean "start"
const START_WORDS = ["start", "go", "capture"];

interface VoiceCommandOverlayProps {
  /** CSS selector for the main action button to click */
  buttonSelector: string;
  /** Current session state — used to auto-disable during capture */
  sessionState: string;
  /** Whether camera is active */
  cameraActive: boolean;
  /** CSS selector for the video container to render the overlay inside */
  videoContainerSelector?: string;
}

export default function VoiceCommandOverlay({
  buttonSelector,
  sessionState,
  cameraActive,
  videoContainerSelector,
}: VoiceCommandOverlayProps) {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTriggerTime = useRef(0);
  const mutedUntil = useRef(0);

  // Auto-disable during capture and countdown to avoid any interference
  const shouldListen = voiceEnabled && sessionState !== "capturing" && sessionState !== "countdown" && sessionState !== "complete";

  const showFeedback = useCallback((msg: string) => {
    setFeedback(msg);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 2500);
  }, []);

  const handleTranscript = useCallback(
    (transcript: string) => {
      // Debounce — 800ms cooldown
      if (Date.now() - lastTriggerTime.current < 800) return;

      // MUTE CHECK: Ignore ALL transcripts while app is speaking.
      // The speech recognition can pick up the app's own speech output
      // (e.g., "Get ready, starting in 5 seconds" contains "start").
      // This prevents false triggers from the app's own voice.
      if (Date.now() < mutedUntil.current) {
        console.log('[Voice] Ignoring transcript during mute period:', transcript);
        return;
      }

      // Exact word match only — "starting" should NOT match "start"
      const words = transcript.split(/\s+/);
      const hasStartWord = words.some((w) => START_WORDS.includes(w));

      if (hasStartWord) {
        lastTriggerTime.current = Date.now();
        // Find and click the button via DOM
        const btn = document.querySelector(buttonSelector) as HTMLButtonElement | null;
        if (btn && !btn.disabled) {
          showFeedback("Voice: Start!");
          btn.click();
        } else {
          showFeedback("Not ready yet...");
        }
      }
    },
    [buttonSelector, showFeedback]
  );

  const { isListening, isSupported } = useSimpleVoiceRecognition({
    enabled: shouldListen,
    onTranscript: handleTranscript,
    onError: (err) => {
      if (err === "not-allowed") {
        showFeedback("Mic access denied");
        setVoiceEnabled(false);
      }
    },
  });

  // Mute when the app speaks (listen for speechSynthesis events)
  useEffect(() => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    // Poll for speaking state since events aren't reliable across browsers.
    // Mute for 2s after app stops speaking to prevent the mic from picking up
    // the tail end of app speech as a voice command.
    const interval = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        mutedUntil.current = Math.max(mutedUntil.current, Date.now() + 2000);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [voiceEnabled]);

  if (!isSupported) return null;

  return (
    <>
      {/* Voice Toggle Button — renders inline in the toggle row */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
          voiceEnabled
            ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-400"
            : "bg-slate-800/80 border-slate-700 text-slate-400"
        }`}
        onClick={() => setVoiceEnabled(!voiceEnabled)}
        title='Toggle voice commands (say "Start" to begin capture)'
      >
        {isListening ? (
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
        ) : (
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              voiceEnabled ? "bg-emerald-400" : "bg-slate-500"
            }`}
          />
        )}
        <span className="text-xs font-bold uppercase tracking-wider">
          {isListening ? "Listening..." : `Voice: ${voiceEnabled ? "ON" : "OFF"}`}
        </span>
      </div>

      {/* Voice overlay rendered inside the video container */}
      {(() => {
        const videoContainer = videoContainerSelector
          ? document.querySelector(videoContainerSelector)
          : null;
        
        const showOverlay = voiceEnabled && cameraActive && sessionState !== "capturing" && sessionState !== "countdown";
        
        if (!showOverlay && !feedback) return null;
        
        const overlayContent = (
          <>
            {/* Feedback overlay — inside video frame */}
            {feedback && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-emerald-600/90 backdrop-blur-sm rounded-lg px-4 py-2 text-white font-bold text-sm shadow-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  {feedback}
                </div>
              </div>
            )}

            {/* Centered voice hint — inside video frame */}
            {voiceEnabled && isListening && !feedback && cameraActive && sessionState !== "capturing" && sessionState !== "countdown" && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="bg-black/50 backdrop-blur-sm rounded-xl px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="relative">
                      <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </svg>
                      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                    </div>
                  </div>
                  <p className="text-emerald-400 text-lg font-semibold tracking-wide">
                    Say &quot;Start&quot; or &quot;Go&quot; to begin
                  </p>
                </div>
              </div>
            )}
          </>
        );
        
        // Render inside the video container if available, otherwise inline
        return videoContainer ? createPortal(overlayContent, videoContainer) : overlayContent;
      })()}
    </>
  );
}
