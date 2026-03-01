import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, sessions, InsertSession, userSettings, InsertUserSettings } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Session Queries ────────────────────────────────────────────────

export async function createSession(session: InsertSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(sessions).values(session);
  return { id: result[0].insertId };
}

export async function getUserSessions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.createdAt));
}

export async function getSessionById(sessionId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (result.length === 0 || result[0].userId !== userId) return null;
  return result[0];
}

export async function deleteSession(sessionId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verify ownership first
  const session = await getSessionById(sessionId, userId);
  if (!session) return false;

  await db.delete(sessions).where(eq(sessions.id, sessionId));
  return true;
}

export async function updateSessionVideo(sessionId: number, videoUrl: string, videoKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(sessions)
    .set({ videoUrl, videoKey })
    .where(eq(sessions.id, sessionId));
}

// ─── User Settings Queries ──────────────────────────────────────────

export async function getUserSettings(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function upsertUserSettings(userId: number, data: Partial<InsertUserSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getUserSettings(userId);
  if (existing) {
    const updateSet: Record<string, unknown> = {};
    if (data.totalPoints !== undefined) updateSet.totalPoints = data.totalPoints;
    if (data.audioEnabled !== undefined) updateSet.audioEnabled = data.audioEnabled;
    if (data.preferences !== undefined) updateSet.preferences = data.preferences;

    if (Object.keys(updateSet).length > 0) {
      await db.update(userSettings).set(updateSet).where(eq(userSettings.userId, userId));
    }
    return existing;
  } else {
    await db.insert(userSettings).values({
      userId,
      totalPoints: data.totalPoints ?? 0,
      audioEnabled: data.audioEnabled ?? 1,
      preferences: data.preferences ?? null,
    });
    return getUserSettings(userId);
  }
}

export async function addPoints(userId: number, points: number) {
  const settings = await getUserSettings(userId);
  const currentPoints = settings?.totalPoints ?? 0;
  const newTotal = currentPoints + points;
  await upsertUserSettings(userId, { totalPoints: newTotal });
  return newTotal;
}
