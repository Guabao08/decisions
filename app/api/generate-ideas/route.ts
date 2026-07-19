import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/anthropic";

export interface Idea {
  id: string;
  title: string;
  description: string;
}

const MIN_IDEAS = 15;
const MAX_IDEAS = 20;

export async function POST(request: Request) {
  const { problem } = (await request.json()) as { problem?: string };

  if (!problem || !problem.trim()) {
    return NextResponse.json({ error: "A problem description is required." }, { status: 400 });
  }

  try {
    const { ideas } = await generateStructured<{
      ideas: Array<{ title: string; description: string }>;
    }>({
      system:
        "You are a sharp, creative problem-solving assistant. Given a problem someone is facing, " +
        `you generate a wide, genuinely diverse set of ${MIN_IDEAS}-${MAX_IDEAS} distinct, concrete, ` +
        "actionable potential solutions or approaches. Avoid near-duplicates or trivial rephrasings of " +
        "the same idea. Every idea should be realistically viable, not filler. Cover a range of angles " +
        "(quick fixes, structural changes, unconventional approaches, etc.) where relevant.",
      prompt: `The problem: ${problem.trim()}`,
      toolName: "submit_ideas",
      toolDescription: `Submit the list of ${MIN_IDEAS}-${MAX_IDEAS} generated solution ideas.`,
      inputSchema: {
        type: "object",
        properties: {
          ideas: {
            type: "array",
            minItems: MIN_IDEAS,
            maxItems: MAX_IDEAS,
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
              },
              required: ["title", "description"],
            },
          },
        },
        required: ["ideas"],
      },
      maxTokens: 4096,
    });

    const withIds: Idea[] = ideas.map((idea, index) => ({
      id: `idea-${index}`,
      title: idea.title,
      description: idea.description,
    }));

    return NextResponse.json({ ideas: withIds });
  } catch (error) {
    console.error("generate-ideas failed:", error);
    const message = error instanceof Error ? error.message : "Failed to generate ideas.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
