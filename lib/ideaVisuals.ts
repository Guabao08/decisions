const GRADIENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-cyan-400",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-400",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-blue-500",
  "from-lime-500 to-emerald-500",
  "from-fuchsia-500 to-purple-600",
  "from-orange-500 to-red-500",
  "from-teal-500 to-cyan-500",
];

/** Deterministically picks a cover gradient for an idea from its id, so the same idea always looks the same. */
export function gradientForIdea(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}
