import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-haiku-4-5-20251001";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to .env.local (see .env.local.example)."
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

/**
 * Calls Claude with a single forced tool call so the response is guaranteed
 * to match `inputSchema`, sidestepping fragile freeform-JSON parsing.
 */
export async function generateStructured<T>({
  system,
  prompt,
  toolName,
  toolDescription,
  inputSchema,
  maxTokens = 4096,
}: {
  system: string;
  prompt: string;
  toolName: string;
  toolDescription: string;
  inputSchema: Anthropic.Tool.InputSchema;
  maxTokens?: number;
}): Promise<T> {
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: prompt }],
    tools: [
      {
        name: toolName,
        description: toolDescription,
        input_schema: inputSchema,
      },
    ],
    tool_choice: { type: "tool", name: toolName },
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    throw new Error("Claude did not return the expected structured tool call.");
  }

  return toolUse.input as T;
}
