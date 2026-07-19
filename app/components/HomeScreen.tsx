"use client";

import { useState } from "react";

export default function HomeScreen({
  onSubmit,
}: {
  onSubmit: (problem: string) => void;
}) {
  const [problem, setProblem] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = problem.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">
        <div className="mb-10 text-center">
          <h1 className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
            Decision Maker
          </h1>
          <p className="mt-4 text-balance text-lg text-neutral-400">
            Stuck on something? Describe it once, then swipe your way to the
            three best solutions — no endless back-and-forth with chatbots.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-2xl shadow-black/40 backdrop-blur"
        >
          <label
            htmlFor="problem"
            className="mb-2 block text-sm font-medium text-neutral-300"
          >
            What&apos;s your problem?
          </label>
          <textarea
            id="problem"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="e.g. I can't decide whether to take a new job offer or stay where I am..."
            rows={5}
            className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            autoFocus
          />
          <button
            type="submit"
            disabled={!problem.trim()}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Find my solutions
          </button>
        </form>
      </div>
    </div>
  );
}
