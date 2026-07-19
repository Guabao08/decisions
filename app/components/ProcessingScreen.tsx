"use client";

import { useEffect, useRef, useState } from "react";
import type { Idea } from "@/app/api/generate-ideas/route";

const STATUS_MESSAGES = [
  "Reading your problem...",
  "Brainstorming angles...",
  "Weighing trade-offs...",
  "Generating solutions...",
  "Filtering out the weak ones...",
  "Almost ready...",
];

export default function ProcessingScreen({
  problem,
  onComplete,
  onError,
}: {
  problem: string;
  onComplete: (ideas: Idea[]) => void;
  onError: (message: string) => void;
}) {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const finished = useRef(false);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + (90 - p) * 0.08 + 0.5));
    }, 150);

    const statusTimer = setInterval(() => {
      setStatusIndex((i) => Math.min(i + 1, STATUS_MESSAGES.length - 1));
    }, 1400);

    async function run() {
      try {
        const res = await fetch("/api/generate-ideas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problem }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong generating ideas.");
        }
        finished.current = true;
        clearInterval(progressTimer);
        clearInterval(statusTimer);
        setProgress(100);
        setTimeout(() => onComplete(data.ideas as Idea[]), 500);
      } catch (err) {
        clearInterval(progressTimer);
        clearInterval(statusTimer);
        const message = err instanceof Error ? err.message : "Something went wrong.";
        onError(message);
      }
    }
    run();

    return () => {
      clearInterval(progressTimer);
      clearInterval(statusTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

  const displayProgress = Math.round(progress);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 text-7xl font-black tabular-nums text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text">
          {displayProgress}%
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-[width] duration-150 ease-out"
            style={{ width: `${displayProgress}%` }}
          />
        </div>
        <p className="mt-6 text-neutral-400">{STATUS_MESSAGES[statusIndex]}</p>
      </div>
    </div>
  );
}
