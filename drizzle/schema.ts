import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Analysis sessions - stores each completed motion analysis.
 * Replaces localStorage 'alignedSessions' key.
 */
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to users table */
  userId: int("userId").notNull(),
  /** Unique client-generated ID (timestamp-based) for dedup */
  clientId: varchar("clientId", { length: 64 }).notNull(),
  /** Name of the motion analyzed (e.g. "Football Throw", "Golf Swing") */
  motionName: varchar("motionName", { length: 128 }).notNull(),
  /** Duration in seconds (stored as string like "2.3") */
  duration: varchar("duration", { length: 16 }).notNull(),
  /** Number of frames captured */
  frameCount: int("frameCount").notNull().default(0),
  /** Overall alignment score (0-100) */
  overallScore: int("overallScore").default(0),
  /** Full detailed analysis JSON blob */
  detailedAnalysis: json("detailedAnalysis"),
  /** S3 URL for the exported video (optional) */
  videoUrl: text("videoUrl"),
  /** S3 key for the exported video (optional) */
  videoKey: text("videoKey"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * User settings - stores per-user preferences.
 * Replaces localStorage 'totalPoints' and other settings.
 */
export const userSettings = mysqlTable("user_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  /** Accumulated total points across all sessions */
  totalPoints: int("totalPoints").notNull().default(0),
  /** Audio enabled preference */
  audioEnabled: int("audioEnabled").notNull().default(1),
  /** Additional settings as JSON */
  preferences: json("preferences"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;
