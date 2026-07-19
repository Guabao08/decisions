"use client";

import { useRef, useState } from "react";
import type { Idea } from "@/app/api/generate-ideas/route";
import SwipeCard, { type SwipeCardHandle, type SwipeDirection } from "./SwipeCard";

export default function SwipeScreen({
  ideas,
  onFinish,
  onRestart,
}: {
  ideas: Idea[];
  onFinish: (finalists: Idea[]) => void;
  onRestart: () => void;
}) {
  const [round, setRound] = useState(1);
  const [deck, setDeck] = useState<Idea[]>(ideas);
  const [kept, setKept] = useState<Idea[]>([]);
  const [roundSize, setRoundSize] = useState(ideas.length);
  const [noneKept, setNoneKept] = useState(false);
  const topCardRef = useRef<SwipeCardHandle>(null);

  function handleExited(direction: SwipeDirection) {
    const [current, ...rest] = deck;
    const newKept = direction === "right" ? [...kept, current] : kept;

    if (rest.length === 0) {
      if (newKept.length === 0) {
        setNoneKept(true);
        return;
      }
      if (newKept.length <= 3) {
        onFinish(newKept);
        return;
      }
      setDeck(newKept);
      setKept([]);
      setRoundSize(newKept.length);
      setRound((r) => r + 1);
      return;
    }

    setDeck(rest);
    setKept(newKept);
  }

  if (noneKept) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="mb-6 max-w-sm text-lg text-neutral-300">
          You passed on every option. Let&apos;s try describing your problem
          a little differently.
        </p>
        <button
          onClick={onRestart}
          className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Start over
        </button>
      </div>
    );
  }

  const visible = deck.slice(0, 3);
  const seen = roundSize - deck.length;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
      <div className="mb-6 text-center">
        {round > 1 && (
          <p className="mb-1 text-sm font-medium uppercase tracking-wide text-violet-400">
            Round {round} — narrowing down your top picks
          </p>
        )}
        <p className="text-sm text-neutral-500">
          {seen} / {roundSize} reviewed
        </p>
      </div>

      <div className="relative h-[440px] w-full max-w-sm">
        {visible.map((idea, i) => (
          <SwipeCard
            key={idea.id}
            ref={i === 0 ? topCardRef : undefined}
            idea={idea}
            index={i}
            isTop={i === 0}
            onExited={handleExited}
          />
        ))}
      </div>

      <p className="mt-6 max-w-xs text-center text-xs text-neutral-600">
        Drag a card, or use the buttons below
      </p>

      <div className="mt-4 flex gap-6">
        <button
          onClick={() => topCardRef.current?.fly("left")}
          aria-label="Discard"
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-neutral-700 bg-neutral-900 text-3xl text-red-400 transition hover:border-red-500 hover:bg-red-500/10"
        >
          ✕
        </button>
        <button
          onClick={() => topCardRef.current?.fly("right")}
          aria-label="Keep"
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-neutral-700 bg-neutral-900 text-3xl text-emerald-400 transition hover:border-emerald-500 hover:bg-emerald-500/10"
        >
          ♥
        </button>
      </div>
    </div>
  );
}
