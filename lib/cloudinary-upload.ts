import 'server-only';

/**
 * Uploads a file to Cloudinary from the Worker.
 *
 * This goes through the account's unsigned upload preset, so no API secret is involved. The
 * preset name stays server-side on purpose: an unsigned preset is a write credential of sorts —
 * anyone holding it can upload into the account — so it must never reach the browser bundle.
 * That's why the admin posts the file to our route handler instead of straight to Cloudinary.
 */
const CLOUD_NAME = 'dvskwrapm';
const UPLOAD_PRESET = 'littlesmileflower';
const FOLDER = 'kazumi-clinic';

export type UploadResult = { publicId: string; width: number; height: number; bytes: number };

export async function uploadToCloudinary(file: File, publicId: string): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);
  form.append('folder', FOLDER);
  // Unsigned uploads can't overwrite, so each save writes a new public ID rather than replacing
  // one — the caller passes a version-suffixed id and D1 records which one is live.
  form.append('public_id', publicId);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  });

  const data = (await res.json()) as {
    public_id?: string;
    width?: number;
    height?: number;
    bytes?: number;
    error?: { message: string };
  };

  if (!res.ok || data.error || !data.public_id) {
    throw new Error(data.error?.message ?? `Cloudinary upload failed with ${res.status}`);
  }

  return {
    publicId: data.public_id,
    width: data.width ?? 0,
    height: data.height ?? 0,
    bytes: data.bytes ?? 0,
  };
}
