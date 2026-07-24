import 'server-only';

/**
 * Uploads a file to Cloudinary from the Worker.
 *
 * Each request is signed server-side with the Cloudinary API secret. This keeps the signing
 * capability out of the public repository and prevents direct, unsigned uploads to the account.
 * The admin still posts the file to our authenticated route handler rather than Cloudinary.
 */
const CLOUD_NAME = 'dvskwrapm';
const FOLDER = 'kazumi-clinic';

export type UploadResult = { publicId: string; width: number; height: number; bytes: number };

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function uploadToCloudinary(file: File, publicId: string): Promise<UploadResult> {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error('CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET is not set — cannot upload to Cloudinary');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signedParams = `folder=${FOLDER}&public_id=${publicId}&timestamp=${timestamp}`;
  const signature = toHex(
    await crypto.subtle.digest('SHA-1', new TextEncoder().encode(`${signedParams}${apiSecret}`)),
  );

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('folder', FOLDER);
  // Each save writes a new public ID rather than replacing one — the caller passes a
  // version-suffixed id and D1 records which one is live.
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
