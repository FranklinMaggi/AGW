// PBKDF2 password hashing compatible with Cloudflare Workers

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
      {
          name: "PBKDF2",
          salt,
          iterations: 100000,      // Cloudflare MAX
          hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
  );

  const rawKey = new Uint8Array(await crypto.subtle.exportKey("raw", key));

  return {
      hash: btoa(String.fromCharCode(...rawKey)),
      salt: btoa(String.fromCharCode(...salt)),
  };
}

export async function verifyPassword(password, hash, salt) {
  const encoder = new TextEncoder();
  const saltBytes = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
  const hashBytes = Uint8Array.from(atob(hash), c => c.charCodeAt(0));

  const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
      {
          name: "PBKDF2",
          salt: saltBytes,
          iterations: 100000,      // Cloudflare MAX
          hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
  );

  const rawKey = new Uint8Array(await crypto.subtle.exportKey("raw", key));

  return rawKey.every((b, i) => b === hashBytes[i]);
}
