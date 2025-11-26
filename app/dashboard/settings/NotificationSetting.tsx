"use client";

import { useState } from "react";

export default function NotificationSettings() {
  const [pushEnabled, setPushEnabled] = useState(false);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Notifiche</h2>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={pushEnabled}
          onChange={(e) => setPushEnabled(e.target.checked)}
        />
        Attiva notifiche push (coming soon)
      </label>
    </div>
  );
}
