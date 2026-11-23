import type { Express } from "express";
import { ENV } from "./env";

/** Older scaffold compatibility: resolve managed media before Vite's HTML fallback. */
export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)["0"];
    if (!key || key.split("/").some((part) => part === "..") || key.includes("\\")) {
      res.status(400).json({ error: "Invalid managed-storage asset key" });
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).json({ error: "Managed storage is not configured" });
      return;
    }
    try {
      // downloadUrl in the old storage.ts returns an unsigned CDN URL. New uploads
      // are private, so use the current presign/get contract from the uploader CLI.
      const endpoint = new URL("v1/storage/presign/get", ENV.forgeApiUrl.replace(/\/+$/, "") + "/");
      endpoint.searchParams.set("path", key);
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });
      if (!response.ok) throw new Error(`Managed storage returned HTTP ${response.status}`);
      const asset = (await response.json()) as { url?: string };
      if (!asset.url) throw new Error("Managed storage did not return a signed download URL");
      const url = new URL(asset.url);
      if (url.protocol !== "https:") throw new Error("Managed storage returned an invalid download URL");
      res.setHeader("Cache-Control", "no-store");
      // FBXLoader's browser fetch cannot follow this signed cross-origin redirect
      // in the restored preview environment. Keep licensed FBX delivery same-origin.
      if (key.toLowerCase().endsWith(".fbx")) {
        const binary = await fetch(url, { signal: AbortSignal.timeout(30000) });
        if (!binary.ok) throw new Error(`Managed binary fetch returned HTTP ${binary.status}`);
        const bytes = Buffer.from(await binary.arrayBuffer());
        res.type("application/octet-stream").send(bytes);
        return;
      }
      res.redirect(307, url.toString());
    } catch (error) {
      console.error("[StorageProxy] Could not resolve asset", key, error);
      res.status(502).json({ error: "The managed-storage asset could not be resolved" });
    }
  });
}
