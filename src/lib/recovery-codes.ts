/**
 * Recovery code utilities
 *
 * Recovery codes are stored as SHA-256 hashes in the database.
 * The plaintext is shown ONCE to the user and never stored.
 *
 * Why SHA-256 instead of bcrypt?
 * - Recovery codes are long random strings (cryptographically strong)
 * - bcrypt is designed for low-entropy passwords; SHA-256 is fine for
 *   high-entropy random tokens
 * - WebCrypto (SHA-256) is available in browsers and Vercel Edge without
 *   any extra packages
 */

/** Generate a random recovery code like XXXX-XXXX-XXXX */
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I confusion
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${segment()}-${segment()}-${segment()}`;
}

/** SHA-256 hash a string using WebCrypto */
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Generate 10 recovery codes and return both plaintext and hashes */
export async function generateRecoveryCodes(): Promise<{ plaintext: string[]; hashes: string[] }> {
  const plaintext = Array.from({ length: 10 }, generateCode);
  const hashes = await Promise.all(plaintext.map(sha256));
  return { plaintext, hashes };
}

/** Hash a single code for verification */
export async function hashRecoveryCode(code: string): Promise<string> {
  return sha256(code.toUpperCase().replace(/\s/g, ""));
}
