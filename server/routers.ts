import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createSession,
  getUserSessions,
  getSessionById,
  deleteSession,
  updateSessionVideo,
  getUserSettings,
  upsertUserSettings,
  addPoints,
} from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ─── Sessions ───────────────────────────────────────────────────
  sessions: router({
    /** List all sessions for the current user */
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserSessions(ctx.user.id);
    }),

    /** Get a single session by ID */
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return getSessionById(input.id, ctx.user.id);
      }),

    /** Save a new analysis session */
    save: protectedProcedure
      .input(
        z.object({
          clientId: z.string(),
          motionName: z.string(),
          duration: z.string(),
          frameCount: z.number(),
          overallScore: z.number().optional().default(0),
          detailedAnalysis: z.any().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const result = await createSession({
          userId: ctx.user.id,
          clientId: input.clientId,
          motionName: input.motionName,
          duration: input.duration,
          frameCount: input.frameCount,
          overallScore: input.overallScore,
          detailedAnalysis: input.detailedAnalysis ?? null,
        });
        return result;
      }),

    /** Delete a session */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const success = await deleteSession(input.id, ctx.user.id);
        return { success };
      }),

    /** Upload video for a session */
    uploadVideo: protectedProcedure
      .input(
        z.object({
          sessionId: z.number(),
          videoBase64: z.string(),
          mimeType: z.string().default("video/mp4"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const ext = input.mimeType.includes("webm") ? "webm" : "mp4";
        const fileKey = `sessions/${ctx.user.id}/${input.sessionId}-${nanoid(8)}.${ext}`;
        const buffer = Buffer.from(input.videoBase64, "base64");
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        await updateSessionVideo(input.sessionId, url, fileKey);
        return { url, key: fileKey };
      }),
  }),

  // ─── User Settings ─────────────────────────────────────────────
  settings: router({
    /** Get current user's settings */
    get: protectedProcedure.query(async ({ ctx }) => {
      const settings = await getUserSettings(ctx.user.id);
      return settings ?? { totalPoints: 0, audioEnabled: 1, preferences: null };
    }),

    /** Update user settings */
    update: protectedProcedure
      .input(
        z.object({
          totalPoints: z.number().optional(),
          audioEnabled: z.number().optional(),
          preferences: z.any().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await upsertUserSettings(ctx.user.id, input);
        return { success: true };
      }),

    /** Add points to user's total */
    addPoints: protectedProcedure
      .input(z.object({ points: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const newTotal = await addPoints(ctx.user.id, input.points);
        return { totalPoints: newTotal };
      }),
  }),
});

export type AppRouter = typeof appRouter;
