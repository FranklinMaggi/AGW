"use client";

import { useState } from "react";

export default function AvatarUploader({ user }: { user: any }) {
  const [preview, setPreview] = useState(user.profile_image);

  async function handleUpload(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    const base64 = await toBase64(file);
    setPreview(base64);

    await fetch("/api/user/upload-avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar: base64 }),
    });

    alert("Avatar aggiornato");
  }

  function toBase64(file: File) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md flex gap-4">
      <img
        src={preview || "/default-avatar.png"}
        className="w-24 h-24 rounded-full object-cover border"
      />

      <div>
        <h3 className="font-semibold mb-2">Avatar</h3>

        <input type="file" accept="image/*" onChange={handleUpload} />

        <p className="text-sm mt-2 text-gray-500">
          Carica un’immagine quadrata.
        </p>
      </div>
    </div>
  );
}
