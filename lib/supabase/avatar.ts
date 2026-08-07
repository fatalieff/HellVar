"use client";

import { supabase } from "./client";

export const AVATARS_BUCKET = "avatars";
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
export const PENDING_AVATAR_KEY = "hellvar.pending-avatar";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export type PendingAvatar = {
  userId: string;
  dataUrl: string;
};

export function isAvatarFile(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function extensionFromType(type: string): string {
  switch (type) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

export function avatarObjectPath(userId: string, file: File): string {
  return `${userId}/avatar.${extensionFromType(file.type)}`;
}

/** Avatar-ın ictimai URL-sini qaytarır. */
export function getAvatarPublicUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Faylı yükləyir, köhnə fərqli uzantılı avatarları təmizləyir və ictimai URL qaytarır. */
export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<string> {
  if (!isAvatarFile(file)) {
    throw new Error("INVALID_TYPE");
  }
  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error("TOO_LARGE");
  }

  const path = avatarObjectPath(userId, file);

  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (error) throw error;

  // Köhnə uzantılı faylları sil (avatar.jpg -> avatar.png keçidində)
  await removeStaleAvatars(userId, path);

  return getAvatarPublicUrl(path) ?? "";
}

/** İstifadəçinin bütün avatar fayllarını silir. */
export async function removeAvatars(userId: string): Promise<void> {
  const { data: objects } = await supabase.storage
    .from(AVATARS_BUCKET)
    .list(userId);
  if (!objects || objects.length === 0) return;

  const paths = objects.map((o) => `${userId}/${o.name}`);
  await supabase.storage.from(AVATARS_BUCKET).remove(paths);
}

async function removeStaleAvatars(userId: string, keepPath: string): Promise<void> {
  const { data: objects } = await supabase.storage
    .from(AVATARS_BUCKET)
    .list(userId);
  if (!objects || objects.length === 0) return;

  const stale = objects
    .map((o) => `${userId}/${o.name}`)
    .filter((p) => p !== keepPath);

  if (stale.length > 0) {
    await supabase.storage.from(AVATARS_BUCKET).remove(stale);
  }
}

// ─── Gözləyən avatar (email təsdiqlənmədən qeydiyyatda seçilibsə) ───────────

export function savePendingAvatar(userId: string, dataUrl: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PENDING_AVATAR_KEY,
      JSON.stringify({ userId, dataUrl } satisfies PendingAvatar),
    );
  } catch {
    // localStorage doludur — avatardan imtina et
  }
}

export function getPendingAvatar(): PendingAvatar | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PENDING_AVATAR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingAvatar;
    if (!parsed?.userId || !parsed?.dataUrl) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingAvatar(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PENDING_AVATAR_KEY);
  } catch {
    // ignore
  }
}
