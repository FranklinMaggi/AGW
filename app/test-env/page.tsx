
"use client";
import { useEffect } from "react";

export default function TestEnv() {
  useEffect(() => {
    console.log("NEXT_PUBLIC_API_URL =", process.env.NEXT_PUBLIC_API_URL);
  }, []);

  return <p>Controlla la console del browser</p>;
}
