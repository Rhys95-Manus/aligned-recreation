import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module
vi.mock("./db", () => {
  const sessionsStore: any[] = [];
  let nextId = 1;
  const settingsStore: Record<number, any> = {};

  return {
    getDb: vi.fn().mockResolvedValue({}),
    upsertUser: vi.fn(),
    getUserByOpenId: vi.fn(),
    createSession: vi.fn(async (data: any) => {
      const id = nextId++;
      sessionsStore.push({ id, ...data, createdAt: new Date() });
      return { id };
    }),
    getUserSessions: vi.fn(async (userId: number) => {
      return sessionsStore.filter((s) => s.userId === userId);
    }),
    getSessionById: vi.fn(async (sessionId: number, userId: number) => {
      return sessionsStore.find((s) => s.id === sessionId && s.userId === userId) || null;
    }),
    deleteSession: vi.fn(async (sessionId: number, userId: number) => {
      const idx = sessionsStore.findIndex((s) => s.id === sessionId && s.userId === userId);
      if (idx === -1) return false;
      sessionsStore.splice(idx, 1);
      return true;
    }),
    updateSessionVideo: vi.fn(async () => {}),
    getUserSettings: vi.fn(async (userId: number) => {
      return settingsStore[userId] || null;
    }),
    upsertUserSettings: vi.fn(async (userId: number, data: any) => {
      settingsStore[userId] = { userId, totalPoints: data.totalPoints ?? 0, audioEnabled: data.audioEnabled ?? 1, preferences: data.preferences ?? null };
      return settingsStore[userId];
    }),
    addPoints: vi.fn(async (userId: number, points: number) => {
      if (!settingsStore[userId]) {
        settingsStore[userId] = { userId, totalPoints: 0, audioEnabled: 1, preferences: null };
      }
      settingsStore[userId].totalPoints += points;
      return settingsStore[userId].totalPoints;
    }),
  };
});

// Mock the storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn(async (key: string, _buffer: Buffer, _mime: string) => ({
    url: `https://s3.example.com/${key}`,
    key,
  })),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 42,
    openId: "test-user-openid",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("sessions router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    const ctx = createAuthContext();
    caller = appRouter.createCaller(ctx);
  });

  it("saves a new session and returns its id", async () => {
    const result = await caller.sessions.save({
      clientId: "test-client-1",
      motionName: "Football Throw",
      duration: "2.5",
      frameCount: 75,
      overallScore: 82,
      detailedAnalysis: { overallScore: 82, strengths: [] },
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("lists sessions for the authenticated user", async () => {
    // Save a session first
    await caller.sessions.save({
      clientId: "test-client-2",
      motionName: "Golf Swing",
      duration: "3.1",
      frameCount: 93,
      overallScore: 75,
    });

    const sessions = await caller.sessions.list();
    expect(Array.isArray(sessions)).toBe(true);
    expect(sessions.length).toBeGreaterThan(0);
  });

  it("gets a specific session by id", async () => {
    const saved = await caller.sessions.save({
      clientId: "test-client-3",
      motionName: "Kettlebell Snatch",
      duration: "1.8",
      frameCount: 54,
      overallScore: 90,
    });

    const session = await caller.sessions.get({ id: saved.id });
    expect(session).not.toBeNull();
    expect(session?.motionName).toBe("Kettlebell Snatch");
  });

  it("deletes a session", async () => {
    const saved = await caller.sessions.save({
      clientId: "test-client-4",
      motionName: "Kettlebell Swing",
      duration: "2.0",
      frameCount: 60,
      overallScore: 70,
    });

    const result = await caller.sessions.delete({ id: saved.id });
    expect(result.success).toBe(true);

    const deleted = await caller.sessions.get({ id: saved.id });
    expect(deleted).toBeNull();
  });

  it("rejects unauthenticated access to sessions.list", async () => {
    const unauthCaller = appRouter.createCaller(createUnauthContext());
    await expect(unauthCaller.sessions.list()).rejects.toThrow();
  });

  it("rejects unauthenticated access to sessions.save", async () => {
    const unauthCaller = appRouter.createCaller(createUnauthContext());
    await expect(
      unauthCaller.sessions.save({
        clientId: "x",
        motionName: "Test",
        duration: "1.0",
        frameCount: 30,
      })
    ).rejects.toThrow();
  });
});

describe("settings router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    const ctx = createAuthContext();
    caller = appRouter.createCaller(ctx);
  });

  it("returns default settings when none exist", async () => {
    const settings = await caller.settings.get();
    expect(settings).toHaveProperty("totalPoints");
  });

  it("adds points to user total", async () => {
    const result = await caller.settings.addPoints({ points: 50 });
    expect(result.totalPoints).toBeGreaterThanOrEqual(50);
  });

  it("updates user settings", async () => {
    const result = await caller.settings.update({
      totalPoints: 100,
      audioEnabled: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects unauthenticated access to settings.get", async () => {
    const unauthCaller = appRouter.createCaller(createUnauthContext());
    await expect(unauthCaller.settings.get()).rejects.toThrow();
  });
});
