"use client";

import { useState } from "react";
import HomeScreen from "@/app/components/HomeScreen";
import ProcessingScreen from "@/app/components/ProcessingScreen";
import SwipeScreen from "@/app/components/SwipeScreen";
import FinalScreen from "@/app/components/FinalScreen";
import type { Idea } from "@/app/api/generate-ideas/route";
import { deleteEntry, saveEntry, useHistory } from "@/lib/history";

type View = "home" | "processing" | "swipe" | "final";

export default function Page() {
  const [view, setView] = useState<View>("home");
  const [problem, setProblem] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [finalists, setFinalists] = useState<Idea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  function reset() {
    setView("home");
    setProblem("");
    setIdeas([]);
    setFinalists([]);
    setError(null);
  }

  return (
    <div className="flex-1 bg-neutral-950">
      {view === "home" && (
        <HomeScreen
          onSubmit={(p) => {
            setProblem(p);
            setError(null);
            setView("processing");
          }}
          history={history}
          onOpenEntry={(entry) => {
            setProblem(entry.problem);
            setFinalists(entry.finalists);
            setError(null);
            setView("final");
          }}
          onDeleteEntry={deleteEntry}
        />
      )}

      {view === "processing" && (
        <ProcessingScreen
          problem={problem}
          onComplete={(generated) => {
            setIdeas(generated);
            setView("swipe");
          }}
          onError={(message) => {
            setError(message);
            setView("home");
          }}
        />
      )}

      {view === "swipe" && (
        <SwipeScreen problem={problem} ideas={ideas} onFinish={(f) => {
          setFinalists(f);
          saveEntry(problem, f);
          setView("final");
        }} onRestart={reset} />
      )}

      {view === "final" && (
        <FinalScreen problem={problem} finalists={finalists} onRestart={reset} />
      )}

      {error && view === "home" && (
        <div className="fixed inset-x-0 bottom-6 mx-auto w-fit max-w-md rounded-xl border border-red-500/40 bg-red-950/80 px-4 py-3 text-sm text-red-200 shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
