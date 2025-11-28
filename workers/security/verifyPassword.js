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
        iterations: 200_000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  
    const rawKey = new Uint8Array(await crypto.subtle.exportKey("raw", key));
  
    return crypto.subtle.timingSafeEqual
      ? crypto.subtle.timingSafeEqual(rawKey, hashBytes)
      : rawKey.every((b, i) => b === hashBytes[i]); // fallback
  }
  