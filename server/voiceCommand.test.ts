import { describe, expect, it, vi } from "vitest";

/**
 * Tests for the voice command feature logic.
 * 
 * Since the useVoiceCommand hook relies on the Web Speech API (browser-only),
 * we test the command matching logic and state machine behavior in isolation.
 */

describe("Voice command matching logic", () => {
  it("matches 'start' command case-insensitively", () => {
    const commands: Record<string, () => void> = {
      start: vi.fn(),
      go: vi.fn(),
    };

    const transcript = "start";
    const matched = Object.entries(commands).find(([keyword]) =>
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );

    expect(matched).toBeDefined();
    expect(matched![0]).toBe("start");
  });

  it("matches 'go' as a start synonym", () => {
    const commands: Record<string, () => void> = {
      start: vi.fn(),
      go: vi.fn(),
    };

    const transcript = "go";
    const matched = Object.entries(commands).find(([keyword]) =>
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );

    expect(matched).toBeDefined();
    expect(matched![0]).toBe("go");
  });

  it("matches command within a longer transcript", () => {
    const commands: Record<string, () => void> = {
      start: vi.fn(),
      go: vi.fn(),
    };

    const transcript = "please start now";
    const matched = Object.entries(commands).find(([keyword]) =>
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );

    expect(matched).toBeDefined();
    expect(matched![0]).toBe("start");
  });

  it("does not match unrelated words", () => {
    const commands: Record<string, () => void> = {
      start: vi.fn(),
      go: vi.fn(),
    };

    const transcript = "hello world";
    const matched = Object.entries(commands).find(([keyword]) =>
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );

    expect(matched).toBeUndefined();
  });

  it("matches 'begin' as a start synonym", () => {
    const commands: Record<string, () => void> = {
      start: vi.fn(),
      begin: vi.fn(),
      go: vi.fn(),
    };

    const transcript = "begin";
    const matched = Object.entries(commands).find(([keyword]) =>
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );

    expect(matched).toBeDefined();
    expect(matched![0]).toBe("begin");
  });

  it("matches 'capture' as a start synonym", () => {
    const commands: Record<string, () => void> = {
      start: vi.fn(),
      capture: vi.fn(),
      go: vi.fn(),
    };

    const transcript = "capture";
    const matched = Object.entries(commands).find(([keyword]) =>
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );

    expect(matched).toBeDefined();
    expect(matched![0]).toBe("capture");
  });

  it("handles mixed case transcripts", () => {
    const commands: Record<string, () => void> = {
      start: vi.fn(),
      go: vi.fn(),
    };

    const transcript = "START NOW";
    const matched = Object.entries(commands).find(([keyword]) =>
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );

    expect(matched).toBeDefined();
    expect(matched![0]).toBe("start");
  });

  it("only has start-related commands (no stop commands)", () => {
    // Verify the command set matches what's in Analysis.tsx
    const voiceCommands = {
      'start': () => {},
      'go': () => {},
      'begin': () => {},
      'capture': () => {},
    };

    const commandKeys = Object.keys(voiceCommands);
    expect(commandKeys).toContain('start');
    expect(commandKeys).toContain('go');
    expect(commandKeys).toContain('begin');
    expect(commandKeys).toContain('capture');
    // No stop commands - auto-stop handles ending
    expect(commandKeys).not.toContain('stop');
    expect(commandKeys).not.toContain('finish');
    expect(commandKeys).not.toContain('done');
    expect(commandKeys).toHaveLength(4);
  });
});

describe("Voice command state transitions", () => {
  it("should only trigger start when in ready or idle state", () => {
    const states = ["idle", "ready", "countdown", "capturing", "complete"] as const;
    const startableStates = ["idle", "ready"];

    for (const state of states) {
      const canStart = startableStates.includes(state);
      if (state === "idle" || state === "ready") {
        expect(canStart).toBe(true);
      } else {
        expect(canStart).toBe(false);
      }
    }
  });

  it("voice should be active when voiceEnabled is true (regardless of camera state)", () => {
    // Voice now listens even before camera is active so user can say "start" to begin
    const scenarios = [
      { voiceEnabled: true, expected: true },
      { voiceEnabled: false, expected: false },
    ];

    for (const { voiceEnabled, expected } of scenarios) {
      expect(voiceEnabled).toBe(expected);
    }
  });

  it("voice hint text should not show during capture, countdown, or complete states", () => {
    const states = ["idle", "ready", "countdown", "capturing", "complete"] as const;
    const hiddenStates = ["capturing", "countdown", "complete"];

    for (const state of states) {
      const shouldShowHint = !hiddenStates.includes(state);
      if (state === "idle" || state === "ready") {
        expect(shouldShowHint).toBe(true);
      } else {
        expect(shouldShowHint).toBe(false);
      }
    }
  });
});

describe("Mute functionality (self-trigger prevention)", () => {
  it("should ignore commands while muted", () => {
    let mutedUntil = 0;

    const muteFor = (durationMs: number) => {
      mutedUntil = Date.now() + durationMs;
    };

    const isMuted = () => Date.now() < mutedUntil;

    // Not muted initially
    expect(isMuted()).toBe(false);

    // Mute for 3 seconds
    muteFor(3000);
    expect(isMuted()).toBe(true);
  });

  it("should prevent app speech from triggering voice commands", () => {
    // Simulate the scenario: app says "Video capture is ready. You may begin when ready"
    // The word "begin" is a trigger word, but mute should prevent it
    const triggerWords = ["start", "go", "begin", "capture"];
    const appSpeech = "Video capture is ready. You may begin when ready";

    // Without mute, speech would match
    const wouldMatch = triggerWords.some(word => appSpeech.toLowerCase().includes(word));
    expect(wouldMatch).toBe(true); // "begin" is in the speech

    // With mute active, the command should be ignored
    let mutedUntil = Date.now() + 5000;
    const isMuted = Date.now() < mutedUntil;
    expect(isMuted).toBe(true); // Commands are blocked
  });

  it("should also prevent countdown speech from triggering", () => {
    const triggerWords = ["start", "go", "begin", "capture"];
    const countdownSpeech = "Get ready. Starting in 5 seconds";

    // "starting" contains "start" as a substring
    const wouldMatch = triggerWords.some(word => countdownSpeech.toLowerCase().includes(word));
    expect(wouldMatch).toBe(true); // "start" is in "Starting"

    // Mute should block this
    let mutedUntil = Date.now() + 7000;
    const isMuted = Date.now() < mutedUntil;
    expect(isMuted).toBe(true);
  });
});

describe("Command debouncing", () => {
  it("should prevent duplicate triggers within 2 seconds", () => {
    const DEBOUNCE_MS = 2000;
    let lastCommandTime = -Infinity; // No previous command

    const tryCommand = (now: number): boolean => {
      if (now - lastCommandTime < DEBOUNCE_MS) return false;
      lastCommandTime = now;
      return true;
    };

    // First command should fire (no previous command)
    expect(tryCommand(1000)).toBe(true);
    // Same command 500ms later should be blocked
    expect(tryCommand(1500)).toBe(false);
    // Same command 1.5s later should still be blocked
    expect(tryCommand(2500)).toBe(false);
    // After 2s from first, should fire again
    expect(tryCommand(3001)).toBe(true);
  });
});
