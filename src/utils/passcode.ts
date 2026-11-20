const PASSCODE_SHA256 =
  '11819a6b9cdfe432764940fba65c7c833ea154a85f5b91571a93d1d9dd394e21';

export const PASSCODE_STORAGE_KEY = 'heights_arcade_teacher_unlocked';

export async function verifyTeacherPasscode(input: string): Promise<boolean> {
  const normalized = input.trim();
  if (!normalized) return false;

  const data = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexDigest = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return hexDigest === PASSCODE_SHA256;
}
