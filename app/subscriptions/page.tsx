//app/subscription/
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type BonusResponse = {
  dailyCount: number;
  award: "BASIC" | "COMFORT" | "ADVANCED" | null;
  days: number;
  expiresAt: number | null;
};

export default function SubscriptionsPage() {
  const [dailyCount, setDailyCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BonusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleEvaluate() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
     `${process.env.NEXT_PUBLIC_API_URL}/api/bonus/evaluate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dailyCount }),
        }
      );

      if (!res.ok) {
        throw new Error("Errore nella risposta del server");
      }

      const data = (await res.json()) as BonusResponse;
      setResult(data);
    } catch (err: any) {
      setError(err.message ?? "Errore inatteso");
    } finally {
      setLoading(false);
    }
  }

  function readableAward(award: BonusResponse["award"]) {
    if (!award) return "Nessun abbonamento in omaggio";
    if (award === "BASIC") return "Basic 30 giorni";
    if (award === "COMFORT") return "Comfort 30 giorni";
    if (award === "ADVANCED") return "Advanced 30 giorni";
    return award;
  }

  return (
    <main className="min-h-screen bg-[hsl(var(--agw-black))] text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold text-[hsl(var(--agw-gold))]">
        Simulatore Abbonamenti AGW
      </h1>

      <Card className="p-4 bg-neutral-900 border border-neutral-800 space-y-4">
        <p className="text-sm text-neutral-300">
          Inserisci quanti <span className="font-semibold">Day</span> hai
          acquistato in questa settimana e calcoliamo automaticamente
          l&apos;abbonamento in omaggio.
        </p>

        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={0}
            className="w-32"
            value={dailyCount}
            onChange={(e) => setDailyCount(Number(e.target.value || 0))}
          />
          <span className="text-sm text-neutral-400">Day negli ultimi 7 giorni</span>
        </div>

        <Button
          onClick={handleEvaluate}
          disabled={loading}
          className="bg-[hsl(var(--agw-gold))] text-black hover:bg-[hsl(var(--agw-gold-soft))]"
        >
          {loading ? "Calcolo in corso..." : "Calcola abbonamento in omaggio"}
        </Button>

        {error && (
          <p className="text-sm text-red-400 mt-2">
            Errore: {error}
          </p>
        )}
      </Card>

      {result && (
        <Card className="p-4 bg-neutral-900 border border-neutral-800 space-y-3">
          <h2 className="text-xl font-semibold text-[hsl(var(--agw-gold))]">
            Risultato
          </h2>

          <p className="text-sm text-neutral-300">
            Day acquistati questa settimana:{" "}
            <span className="font-semibold">{result.dailyCount}</span>
          </p>

          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-300">
              Abbonamento in omaggio:
            </span>
            <Badge variant={result.award ? "default" : "outline"}>
              {readableAward(result.award)}
            </Badge>
          </div>

          {result.expiresAt && (
            <p className="text-xs text-neutral-500">
              Scadenza premio (timestamp): {result.expiresAt}
            </p>
          )}
        </Card>
      )}
    </main>
  );
}
