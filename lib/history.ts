"use client";

import { useSyncExternalStore } from "react";
import type { Idea } from "@/app/api/generate-ideas/route";

export interface HistoryEntry {
  id: string;
  createdAt: number;
  problem: string;
  finalists: Idea[];
}

const STORAGE_KEY = "decision-history";
const MAX_ENTRIES = 20;
const EMPTY: HistoryEntry[] = [];

let cache: HistoryEntry[] | null = null;
const listeners = new Set<() => void>();

function readStorage(): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): HistoryEntry[] {
  if (cache === null) cache = readStorage();
  return cache;
}

// Server render has no localStorage; hydration starts from empty and the
// client snapshot fills in right after.
function getServerSnapshot(): HistoryEntry[] {
  return EMPTY;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function update(entries: HistoryEntry[]) {
  cache = entries;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or blocked (e.g. private browsing) — history is a
    // nice-to-have, so fail silently rather than break the flow.
  }
  listeners.forEach((listener) => listener());
}

export function useHistory(): HistoryEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function saveEntry(problem: string, finalists: Idea[]) {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    problem,
    finalists,
  };
  update([entry, ...getSnapshot()].slice(0, MAX_ENTRIES));
}

export function deleteEntry(id: string) {
  update(getSnapshot().filter((entry) => entry.id !== id));
}
