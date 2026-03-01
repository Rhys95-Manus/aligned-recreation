import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCallback, useMemo } from "react";

/**
 * Hook that provides cloud-backed storage for sessions and settings.
 * Falls back to localStorage when user is not authenticated.
 */
export function useCloudStorage() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  // ─── Sessions ───────────────────────────────────────────────────

  const sessionsQuery = trpc.sessions.list.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const saveMutation = trpc.sessions.save.useMutation({
    onSuccess: () => {
      utils.sessions.list.invalidate();
    },
  });

  const deleteMutation = trpc.sessions.delete.useMutation({
    onSuccess: () => {
      utils.sessions.list.invalidate();
    },
  });

  const uploadVideoMutation = trpc.sessions.uploadVideo.useMutation();

  // ─── Settings ───────────────────────────────────────────────────

  const settingsQuery = trpc.settings.get.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const updateSettingsMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
    },
  });

  const addPointsMutation = trpc.settings.addPoints.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
    },
  });

  // ─── Unified API ────────────────────────────────────────────────

  const getSessions = useCallback(() => {
    if (isAuthenticated && sessionsQuery.data) {
      return sessionsQuery.data.map((s: any) => ({
        id: String(s.id),
        timestamp: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
        motionName: s.motionName,
        duration: s.duration,
        frameCount: s.frameCount,
        detailedAnalysis: s.detailedAnalysis,
        videoUrl: s.videoUrl,
        cloudId: s.id,
      }));
    }
    // Fallback to localStorage
    try {
      return JSON.parse(localStorage.getItem("alignedSessions") || "[]");
    } catch {
      return [];
    }
  }, [isAuthenticated, sessionsQuery.data]);

  const saveSession = useCallback(
    async (sessionData: {
      motionName: string;
      duration: string;
      frameCount: number;
      detailedAnalysis?: any;
    }) => {
      if (isAuthenticated) {
        const result = await saveMutation.mutateAsync({
          clientId: Date.now().toString(),
          motionName: sessionData.motionName,
          duration: sessionData.duration,
          frameCount: sessionData.frameCount,
          overallScore: sessionData.detailedAnalysis?.overallScore ?? 0,
          detailedAnalysis: sessionData.detailedAnalysis ?? null,
        });
        return { id: result.id, cloud: true };
      }
      // Fallback to localStorage
      const data = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...sessionData,
      };
      const existing = JSON.parse(localStorage.getItem("alignedSessions") || "[]");
      existing.push(data);
      localStorage.setItem("alignedSessions", JSON.stringify(existing));
      return { id: data.id, cloud: false };
    },
    [isAuthenticated, saveMutation]
  );

  const deleteSession = useCallback(
    async (id: string) => {
      if (isAuthenticated) {
        await deleteMutation.mutateAsync({ id: Number(id) });
        return true;
      }
      // Fallback to localStorage
      const sessions = JSON.parse(localStorage.getItem("alignedSessions") || "[]");
      const updated = sessions.filter((s: any) => s.id !== id);
      localStorage.setItem("alignedSessions", JSON.stringify(updated));
      return true;
    },
    [isAuthenticated, deleteMutation]
  );

  const uploadVideo = useCallback(
    async (sessionId: number, videoBlob: Blob) => {
      if (!isAuthenticated) return null;

      // Convert blob to base64
      const buffer = await videoBlob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const result = await uploadVideoMutation.mutateAsync({
        sessionId,
        videoBase64: base64,
        mimeType: videoBlob.type || "video/mp4",
      });

      return result;
    },
    [isAuthenticated, uploadVideoMutation]
  );

  // ─── Points / Settings ─────────────────────────────────────────

  const getTotalPoints = useCallback(() => {
    if (isAuthenticated && settingsQuery.data) {
      return (settingsQuery.data as any).totalPoints ?? 0;
    }
    return parseInt(localStorage.getItem("totalPoints") || "0", 10);
  }, [isAuthenticated, settingsQuery.data]);

  const addPoints = useCallback(
    async (points: number) => {
      if (isAuthenticated) {
        const result = await addPointsMutation.mutateAsync({ points });
        return result.totalPoints;
      }
      const current = parseInt(localStorage.getItem("totalPoints") || "0", 10);
      const newTotal = current + points;
      localStorage.setItem("totalPoints", newTotal.toString());
      return newTotal;
    },
    [isAuthenticated, addPointsMutation]
  );

  return {
    // Auth state
    isAuthenticated,
    user,
    // Sessions
    sessions: getSessions(),
    sessionsLoading: sessionsQuery.isLoading,
    saveSession,
    deleteSession,
    uploadVideo,
    // Settings
    totalPoints: getTotalPoints(),
    addPoints,
    // Raw queries for advanced usage
    settingsQuery,
    sessionsQuery,
  };
}
