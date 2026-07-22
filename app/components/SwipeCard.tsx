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
      <div className="relative flex h-[440px] w-full select-none flex-col overflow-hidden rounded-[28px] bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
        {/* Ambient per-idea glow: same gradient identity as before, whispered
            instead of shouted. */}
        <div
          className={`pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br opacity-25 blur-3xl ${gradientForIdea(idea.id)}`}
        />
        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute right-6 top-6 z-10 rotate-12 rounded-xl border-2 border-emerald-400/80 bg-emerald-500/10 px-3 py-1 text-lg font-bold tracking-widest text-emerald-300 backdrop-blur-sm"
            >
              KEEP
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute left-6 top-6 z-10 -rotate-12 rounded-xl border-2 border-red-400/80 bg-red-500/10 px-3 py-1 text-lg font-bold tracking-widest text-red-300 backdrop-blur-sm"
            >
              PASS
            </motion.div>
          </>
        )}
        <div className="flex-1 overflow-y-auto p-7">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl shadow-lg shadow-black/30 ring-1 ring-white/20 ${gradientForIdea(idea.id)}`}
          >
            <span role="img" aria-label="">
              {idea.emoji}
            </span>
          </div>
          <h2 className="mt-5 text-[22px] font-semibold leading-snug tracking-tight text-white">
            {idea.title}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-400">
            {idea.description}
          </p>
          <div className="mt-6 space-y-3 border-t border-white/5 pt-5">
            <div className="flex gap-3">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              <p className="text-sm leading-relaxed text-neutral-400">
                <span className="font-medium text-emerald-300">Best case</span>{" "}
                — {idea.bestCase}
              </p>
            </div>
            <div className="flex gap-3">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              <p className="text-sm leading-relaxed text-neutral-400">
                <span className="font-medium text-amber-300">Worst case</span>{" "}
                — {idea.worstCase}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default SwipeCard;
