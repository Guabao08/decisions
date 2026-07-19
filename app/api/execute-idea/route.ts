import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/anthropic";

export async function POST(request: Request) {
  const { problem, idea } = (await request.json()) as {
    problem?: string;
    idea?: { title?: string; description?: string };
  };

  if (!problem?.trim() || !idea?.title || !idea?.description) {
    return NextResponse.json(
      { error: "A problem and idea (title + description) are required." },
      { status: 400 }
    );
  }

  try {
    const { steps } = await generateStructured<{ steps: string[] }>({
      system:
        "You are a pragmatic execution coach. Given a problem and a chosen solution idea, " +
        "produce a short, concrete action plan the person can start on immediately. " +
        "3-5 steps, each a single actionable sentence, ordered logically. No fluff or caveats.",
      prompt:
        `Problem: ${problem.trim()}\n\n` +
        `Chosen idea: ${idea.title}\n` +
        `Idea description: ${idea.description}\n\n` +
        "Generate the action plan.",
      toolName: "submit_action_plan",
      toolDescription: "Submit the ordered list of concrete next steps.",
      inputSchema: {
        type: "object",
        properties: {
          steps: {
            type: "array",
            minItems: 3,
            maxItems: 5,
            items: { type: "string" },
          },
        },
        required: ["steps"],
      },
      maxTokens: 1024,
    });

    return NextResponse.json({ steps });
  } catch (error) {
    console.error("execute-idea failed:", error);
    const message = error instanceof Error ? error.message : "Failed to generate an action plan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
