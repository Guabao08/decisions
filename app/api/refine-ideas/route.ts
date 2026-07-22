import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/anthropic";
import type { Idea } from "@/app/api/generate-ideas/route";

const MIN_NEW_IDEAS = 3;
const MAX_NEW_IDEAS = 5;

interface IdeaSignal {
  title: string;
  description: string;
}

export async function POST(request: Request) {
  const { problem, liked, passed, seenTitles } = (await request.json()) as {
    problem?: string;
    liked?: IdeaSignal[];
    passed?: IdeaSignal[];
    seenTitles?: string[];
  };

  if (!problem?.trim() || !liked || liked.length === 0) {
    return NextResponse.json(
      { error: "A problem and at least one kept idea are required." },
      { status: 400 }
    );
  }

  try {
    const likedList = liked.map((i) => `- ${i.title}: ${i.description}`).join("\n");
    const passedList =
      (passed ?? []).map((i) => `- ${i.title}: ${i.description}`).join("\n") || "(none passed on yet)";
    const seenList = (seenTitles ?? []).join("; ") || "(none)";

    const { ideas } = await generateStructured<{
      ideas: Array<{
        title: string;
        description: string;
        bestCase: string;
        worstCase: string;
        emoji: string;
      }>;
    }>({
      system:
        "You are a sharp, creative problem-solving assistant helping refine a shortlist of solutions. " +
        "The person has been swiping through candidate ideas for their problem: they kept some (a strong " +
        "signal of what resonates with them) and passed on others (a signal of what to avoid). Given this " +
        `feedback, generate ${MIN_NEW_IDEAS}-${MAX_NEW_IDEAS} brand-new ideas that lean into the pattern ` +
        "behind what they kept, while steering clear of the style or substance of what they passed on. " +
        "Every new idea must be genuinely new — not a reworded or trivial variation of any idea already " +
        "shown to them. For each idea, also give an honest best-case scenario (the most plausible great " +
        "outcome if it works) and worst-case scenario (the most plausible bad outcome if it backfires). " +
        "Be realistic in both directions — no hype, no catastrophizing — one sentence each.",
      prompt:
        `The problem: ${problem.trim()}\n\n` +
        `Ideas they kept (lean into this pattern):\n${likedList}\n\n` +
        `Ideas they passed on (avoid this pattern):\n${passedList}\n\n` +
        `Titles already shown to them, do not repeat or trivially rephrase any of these:\n${seenList}\n\n` +
        "Generate the new, refined ideas.",
      toolName: "submit_refined_ideas",
      toolDescription: `Submit ${MIN_NEW_IDEAS}-${MAX_NEW_IDEAS} new solution ideas refined from the user's swipe feedback.`,
      inputSchema: {
        type: "object",
        properties: {
          ideas: {
            type: "array",
            minItems: MIN_NEW_IDEAS,
            maxItems: MAX_NEW_IDEAS,
            items: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "A short, punchy name for the idea (6 words or fewer).",
                },
                description: {
                  type: "string",
                  description: "One or two sentences explaining the idea concretely.",
                },
                bestCase: {
                  type: "string",
                  description:
                    "One sentence: the most plausible great outcome if this idea works. Realistic, no hype.",
                },
                worstCase: {
                  type: "string",
                  description:
                    "One sentence: the most plausible bad outcome if this idea backfires. Realistic, not catastrophizing.",
                },
                emoji: {
                  type: "string",
                  maxLength: 8,
                  description:
                    "A single emoji (no text) that visually represents this idea.",
                },
              },
              required: ["title", "description", "bestCase", "worstCase", "emoji"],
            },
          },
        },
        required: ["ideas"],
      },
      maxTokens: 2048,
    });

    const withIds: Idea[] = ideas.map((idea) => ({
      id: randomUUID(),
      title: idea.title,
      description: idea.description,
      bestCase: idea.bestCase,
      worstCase: idea.worstCase,
      emoji: idea.emoji,
    }));

    return NextResponse.json({ ideas: withIds });
  } catch (error) {
    console.error("refine-ideas failed:", error);
    const message = error instanceof Error ? error.message : "Failed to refine ideas.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
