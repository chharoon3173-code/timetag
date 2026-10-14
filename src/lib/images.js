/**
 * Shrinks a photo in the browser before uploading it, so pages load fast and storage lasts.
 * Keeps transparency (WebP), falls back to JPEG where WebP isn't supported.
 * The result is a "data:" address (the picture as text), shown as a preview until it's uploaded.
 */
export const MAX_PHOTOS = 6;
const MAX_SIDE = 1100;
const QUALITY = 0.82;
const MAX_INPUT_MB = 15;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`“${file.name}” isn’t an image this browser can read.`));
    };
    img.src = url;
  });
}

/** `maxSide`: longest side in pixels after resizing (logos can be smaller than watch photos). */
export async function compressImage(file, maxSide = MAX_SIDE) {
  if (!file.type.startsWith('image/')) throw new Error(`“${file.name}” is not an image.`);
  if (file.size > MAX_INPUT_MB * 1024 * 1024) throw new Error(`“${file.name}” is larger than ${MAX_INPUT_MB} MB.`);

  const img = await loadImage(file);
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);

  let data = canvas.toDataURL('image/webp', QUALITY);
  if (!data.startsWith('data:image/webp')) data = canvas.toDataURL('image/jpeg', QUALITY);
  return data;
}

export const dataUrlKB = (d) => Math.round((d.length * 3) / 4 / 1024);

/** Turns a "data:" address back into a file (Blob) so it can be uploaded. */
export function dataUrlToBlob(dataUrl) {
  const [head, base64] = dataUrl.split(',');
  const type = head.match(/data:([^;]+)/)?.[1] || 'application/octet-stream';
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type });
}
