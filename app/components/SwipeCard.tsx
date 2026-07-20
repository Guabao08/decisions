"use client";

import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { forwardRef, useImperativeHandle, useRef } from "react";
import type { Idea } from "@/app/api/generate-ideas/route";
import { gradientForIdea } from "@/lib/ideaVisuals";

export type SwipeDirection = "left" | "right";

export interface SwipeCardHandle {
  fly: (direction: SwipeDirection) => void;
}

const SwipeCard = forwardRef<
  SwipeCardHandle,
  {
    idea: Idea;
    index: number;
    isTop: boolean;
    onExited: (direction: SwipeDirection) => void;
  }
>(function SwipeCard({ idea, index, isTop, onExited }, ref) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-20, 20]);
  const likeOpacity = useTransform(x, [20, 140], [0, 1]);
  const nopeOpacity = useTransform(x, [-140, -20], [1, 0]);
  // Guards against a second fly() (double-click, or drag-then-click) retargeting
  // an in-flight animation and silently swallowing the first swipe's onExited.
  const hasExited = useRef(false);

  function fly(direction: SwipeDirection) {
    if (hasExited.current) return;
    hasExited.current = true;
    animate(x, direction === "right" ? 700 : -700, {
      duration: 0.35,
      ease: "easeIn",
      onComplete: () => onExited(direction),
    });
  }

  useImperativeHandle(ref, () => ({ fly }));

  function handleDragEnd(_event: unknown, info: PanInfo) {
    if (hasExited.current) return;
    if (info.offset.x > 120 || info.velocity.x > 500) {
      fly("right");
    } else if (info.offset.x < -120 || info.velocity.x < -500) {
      fly("left");
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  }

  return (
    <motion.div
      className="absolute inset-x-0 top-0"
      style={{ zIndex: 10 - index, x: isTop ? x : 0, rotate: isTop ? rotate : 0 }}
      animate={{ scale: 1 - index * 0.05, y: index * 14 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={isTop ? handleDragEnd : undefined}
    >
      <div className="relative flex h-[440px] w-full select-none flex-col overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 shadow-xl shadow-black/40">
        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute right-6 top-6 z-10 rotate-12 rounded-lg border-4 border-emerald-400 px-3 py-1 text-xl font-black text-emerald-400"
            >
              KEEP
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute left-6 top-6 z-10 -rotate-12 rounded-lg border-4 border-red-400 px-3 py-1 text-xl font-black text-red-400"
            >
              PASS
            </motion.div>
          </>
        )}
        <div
          className={`flex h-40 shrink-0 items-center justify-center bg-gradient-to-br ${gradientForIdea(idea.id)}`}
        >
          <span className="text-7xl drop-shadow-lg" role="img" aria-label="">
            {idea.emoji}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-2xl font-bold text-white">{idea.title}</h2>
          <p className="mt-4 text-neutral-300">{idea.description}</p>
          <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">
              Worst case
            </p>
            <p className="mt-1 text-sm text-amber-200/90">{idea.worstCase}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default SwipeCard;
