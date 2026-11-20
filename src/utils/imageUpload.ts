import { GAME_LIMITS, THUMBNAIL_PATTERN } from '../types/arcade';

const MAX_DIMENSION = 800;
const TARGET_MAX_CHARS = 360000;

/**
 * Reads a user-selected image file from disk, resizes it onto an offscreen canvas,
 * and encodes a compact WebP/JPEG Data URL suitable for persistent Firestore storage.
 * External internet URLs are never accepted.
 */
export async function processUploadedThumbnail(file: File): Promise<{
  dataUrl: string;
  sizeKb: number;
  width: number;
  height: number;
}> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose a valid image file (PNG, JPG, WebP, or GIF).');
  }

  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read the selected image file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error('The selected file could not be decoded as an image.'));
    image.src = rawDataUrl;
  });

  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(img.width, img.height, 1)
  );
  const targetWidth = Math.max(1, Math.round(img.width * scale));
  const targetHeight = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas image processing is unavailable in this browser.');
  }

  ctx.fillStyle = '#0A0A0C';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const formats: Array<'image/webp' | 'image/jpeg'> = [
    'image/webp',
    'image/jpeg',
  ];
  const qualities = [0.84, 0.72, 0.58, 0.45];

  let bestDataUrl = '';
  for (const format of formats) {
    for (const quality of qualities) {
      const candidate = canvas.toDataURL(format, quality);
      if (
        THUMBNAIL_PATTERN.test(candidate) &&
        candidate.length <= TARGET_MAX_CHARS
      ) {
        bestDataUrl = candidate;
        break;
      }
    }
    if (bestDataUrl) break;
  }

  if (!bestDataUrl) {
    const fallback = canvas.toDataURL('image/jpeg', 0.4);
    if (
      !THUMBNAIL_PATTERN.test(fallback) ||
      fallback.length > GAME_LIMITS.MAX_THUMB_CHARS
    ) {
      throw new Error(
        'This image is too large even after compression. Please upload a smaller image file.'
      );
    }
    bestDataUrl = fallback;
  }

  return {
    dataUrl: bestDataUrl,
    sizeKb: Math.round((bestDataUrl.length * 0.75) / 1024),
    width: targetWidth,
    height: targetHeight,
  };
}
