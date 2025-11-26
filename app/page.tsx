"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main
      className="w-full min-h-screen bg-cover bg-center flex flex-col items-center justify-center text-white"
      style={{
        backgroundImage: "url('/wellness-bg.jpg')",
      }}
    >
      <div className="bg-black/40 backdrop-blur-md px-10 py-12 rounded-2xl text-center shadow-xl max-w-md">
        <h1 className="text-4xl font-bold mb-4">Benvenuto in AGW</h1>
        <p className="text-lg mb-8 opacity-90">
          Il tuo percorso di crescita, benessere e disciplina inizia qui.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-white text-black text-lg rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Accedi
          </button>

          <button
            onClick={() => router.push("/register")}
            className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Registrati
          </button>
        </div>
      </div>
    </main>
  );
}
