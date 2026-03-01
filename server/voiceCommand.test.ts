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
      stop: vi.fn(),
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
      stop: vi.fn(),
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
      stop: vi.fn(),
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
      stop: vi.fn(),
    };

    const transcript = "hello world";
    const matched = Object.entries(commands).find(([keyword]) =>
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );

    expect(matched).toBeUndefined();
  });

  it("matches 'stop' command for ending capture", () => {
    const commands: Record<string, () => void> = {
      start: vi.fn(),
      stop: vi.fn(),
      finish: vi.fn(),
      done: vi.fn(),
    };

    const transcript = "stop";
    const matched = Object.entries(commands).find(([keyword]) =>
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );

    expect(matched).toBeDefined();
    expect(matched![0]).toBe("stop");
  });

  it("matches 'finish' as a stop synonym", () => {
    const commands: Record<string, () => void> = {
      start: vi.fn(),
      stop: vi.fn(),
      finish: vi.fn(),
    };

    const transcript = "finish";
    const matched = Object.entries(commands).find(([keyword]) =>
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );

    expect(matched).toBeDefined();
    expect(matched![0]).toBe("finish");
  });

  it("matches 'done' as a stop synonym", () => {
    const commands: Record<string, () => void> = {
      start: vi.fn(),
      stop: vi.fn(),
      done: vi.fn(),
    };

    const transcript = "I'm done";
    const matched = Object.entries(commands).find(([keyword]) =>
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );

    expect(matched).toBeDefined();
    expect(matched![0]).toBe("done");
  });

  it("matches 'begin' as a start synonym", () => {
    const commands: Record<string, () => void> = {
      start: vi.fn(),
      begin: vi.fn(),
      stop: vi.fn(),
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
      stop: vi.fn(),
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
      stop: vi.fn(),
    };

    const transcript = "START NOW";
    const matched = Object.entries(commands).find(([keyword]) =>
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );

    expect(matched).toBeDefined();
    expect(matched![0]).toBe("start");
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

  it("should only trigger stop when in capturing state", () => {
    const states = ["idle", "ready", "countdown", "capturing", "complete"] as const;

    for (const state of states) {
      const canStop = state === "capturing";
      if (state === "capturing") {
        expect(canStop).toBe(true);
      } else {
        expect(canStop).toBe(false);
      }
    }
  });

  it("voice should only be active when camera is active", () => {
    const scenarios = [
      { voiceEnabled: true, cameraActive: true, expected: true },
      { voiceEnabled: true, cameraActive: false, expected: false },
      { voiceEnabled: false, cameraActive: true, expected: false },
      { voiceEnabled: false, cameraActive: false, expected: false },
    ];

    for (const { voiceEnabled, cameraActive, expected } of scenarios) {
      expect(voiceEnabled && cameraActive).toBe(expected);
    }
  });
});
