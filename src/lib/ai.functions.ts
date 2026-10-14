import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { POLICIES_TEXT } from "./policies";

const chatSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2000) }))
    .min(1)
    .max(20),
  products: z
    .array(
      z.object({
        name: z.string(),
        fragrance: z.string(),
        family: z.string(),
        price: z.number(),
        size: z.string(),
        description: z.string(),
        inStock: z.boolean(),
        slug: z.string(),
      }),
    )
    .max(60),
});

export const askConcierge = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => chatSchema.parse(d))
  .handler(async ({ data }) => {
    const { generateText, AiError } = await import("./ai.server");
    const catalogue = data.products
      .map(
        (p) =>
          `- ${p.name} (/shop/${p.slug}): ${p.fragrance}, ${p.family} family, ${p.size}, R${p.price.toFixed(2)}, ${p.inStock ? "in stock" : "out of stock"}. ${p.description}`,
      )
      .join("\n");
    const instructions = `You are "Kusasa Candle Concierge", the friendly assistant for KUSASA-ELIHLE Essential Candles, a South African candle brand. Tagline: "Light up your peaceful moments."
Rules:
- ONLY use the product catalogue and published policies below. Never invent products, ingredients, burn times, delivery options, prices or stock.
- If you don't know, say so kindly and suggest the Contact page (/contact).
- Prices are in South African rand (R). Note that the current catalogue items are sample products.
- Be warm, concise (under 120 words), and suggest pages like /shop, /find-your-scent, /gifts, /moments when helpful.

CATALOGUE:
${catalogue}

PUBLISHED POLICIES:
${POLICIES_TEXT}`;
    const transcript = data.messages
      .map((m) => `${m.role === "user" ? "Customer" : "Concierge"}: ${m.content}`)
      .join("\n");
    try {
      const reply = await generateText(instructions, transcript + "\nConcierge:");
      return { reply: reply || "Sorry, I couldn't think of an answer. Please contact us for help." };
    } catch (e) {
      return { error: e instanceof AiError ? e.message : "Something went wrong. Please try again." };
    }
  });

const toolSchema = z.object({
  tool: z.enum(["email", "planner", "notes", "research", "assistant"]),
  input: z.string().min(2).max(12000),
  tone: z.enum(["formal", "friendly", "persuasive"]).optional(),
  emailType: z.string().max(80).optional(),
});

const TOOL_PROMPTS: Record<string, string> = {
  email:
    "You write professional business emails for KUSASA-ELIHLE Essential Candles, a South African candle business. Output a subject line then the email body. Use placeholders like [Customer Name] for unknown details; never invent facts, prices or dates.",
  planner:
    "You are a task planner for a small South African candle business owner. From the owner's input, produce: 1) Urgent priorities, 2) A daily schedule, 3) A weekly plan covering stock management, marketing and customer service. Use clear headings and bullet points. Be practical.",
  notes:
    "Summarise the pasted meeting notes. Output sections: Summary, Decisions, Assigned tasks (owner — task), Deadlines. Only use information in the notes; write 'Not specified' where missing.",
  research:
    "Analyse the pasted article or research for a small candle business. Output two clearly separated parts: 'FROM THE SOURCE' (key facts and insights stated in the text only) and 'AI SUGGESTIONS' (your recommendations, clearly labelled as AI-generated and to be verified).",
  assistant:
    "You are a business productivity assistant for the owner of KUSASA-ELIHLE Essential Candles. Guide them on using the Email Generator, Task Planner, Meeting Notes Summariser and Research Assistant, and answer business questions concisely. Do not invent facts about their business.",
};

export const runOwnerTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => toolSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) return { error: "Only the shop owner can use these tools." };
    const { generateText, AiError } = await import("./ai.server");
    let instr = TOOL_PROMPTS[data.tool];
    if (data.tool === "email") instr += ` Tone: ${data.tone ?? "friendly"}. Email type: ${data.emailType ?? "general"}.`;
    try {
      return { output: await generateText(instr, data.input) };
    } catch (e) {
      return { error: e instanceof AiError ? e.message : "Something went wrong. Please try again." };
    }
  });
