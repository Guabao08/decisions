"use client";

import { useState } from "react";
import type { Idea } from "@/app/api/generate-ideas/route";

function FinalIdeaCard({ problem, idea }: { problem: string; idea: Idea }) {
  const [steps, setSteps] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExecute() {
    if (steps || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/execute-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem, idea }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate a plan.");
      setSteps(data.steps as string[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl shadow-black/30">
      <h3 className="text-xl font-bold text-white">{idea.title}</h3>
      <p className="mt-2 text-neutral-300">{idea.description}</p>

      {!steps && (
        <button
          onClick={handleExecute}
          disabled={loading}
          className="mt-4 rounded-lg border border-violet-500/50 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20 disabled:opacity-50"
        >
          {loading ? "Working out the steps..." : "Execute this idea"}
        </button>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {steps && (
        <ol className="mt-4 space-y-2 border-t border-neutral-800 pt-4">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-neutral-200">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-300">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function FinalScreen({
  problem,
  finalists,
  onRestart,
}: {
  problem: string;
  finalists: Idea[];
  onRestart: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-16">
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-violet-400">
            Your top {finalists.length}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
            Here&apos;s what to do
          </h1>
          <p className="mt-3 text-neutral-400">
            These are the ideas you kept. Pick one and execute.
          </p>
        </div>

        <div className="space-y-4">
          {finalists.map((idea) => (
            <FinalIdeaCard key={idea.id} problem={problem} idea={idea} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={onRestart}
            className="text-sm text-neutral-500 underline-offset-4 hover:text-neutral-300 hover:underline"
          >
            Start a new problem
          </button>
        </div>
      </div>
    </div>
  );
}
