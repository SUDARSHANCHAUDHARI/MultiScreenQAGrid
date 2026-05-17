import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

type AIProvider = "claude" | "openai";

function getProvider(): AIProvider {
  const val = process.env.AI_PROVIDER;
  if (val === "openai") return "openai";
  return "claude"; // default
}

export async function analyzeScreensWithAI(
  screensJson: string
): Promise<string> {
  const provider = getProvider();

  const systemPrompt = `You are an expert QA analyst for a digital signage monitoring platform.
Analyze the provided screen data and detect anomalies.
For each screen, identify issues based on: status (OK/WARNING/CRITICAL/OFFLINE), last seen timestamp (stale > 5 minutes), and metadata.
Return a JSON array of anomalies with this shape:
[
  {
    "screenId": "string",
    "screenName": "string",
    "type": "OFFLINE | PERFORMANCE | VISUAL | SYNC",
    "severity": "LOW | MEDIUM | HIGH | CRITICAL",
    "description": "string"
  }
]
Only include screens that have genuine issues. Return an empty array [] if everything looks healthy.`;

  const userPrompt = `Analyze these screens and detect anomalies:\n\n${screensJson}`;

  if (provider === "openai") {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });
    return response.choices[0]?.message?.content ?? "[]";
  }

  // Default: Claude
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const block = response.content[0];
  if (block.type === "text") return block.text;
  return "[]";
}

export async function compareReleasesWithAI(
  beforeJson: string,
  afterJson: string
): Promise<string> {
  const provider = getProvider();

  const systemPrompt = `You are an expert QA analyst for digital signage screens.
Compare two sets of screen data (before and after a release).
Identify which screens changed status, which degraded, and which improved.
Return a JSON array of diffs with this shape:
[
  {
    "screenId": "string",
    "screenName": "string",
    "statusBefore": "OK | WARNING | CRITICAL | OFFLINE",
    "statusAfter": "OK | WARNING | CRITICAL | OFFLINE",
    "changed": true
  }
]
Only include screens where statusBefore !== statusAfter (changed: true). Return [] if no changes.`;

  const userPrompt = `BEFORE screens:\n${beforeJson}\n\nAFTER screens:\n${afterJson}`;

  if (provider === "openai") {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });
    return response.choices[0]?.message?.content ?? "[]";
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const block = response.content[0];
  if (block.type === "text") return block.text;
  return "[]";
}
