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
        iterations: 200_000,
        hash: "SHA-256"
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
  