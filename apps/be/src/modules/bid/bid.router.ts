import { Router } from "express";
import OpenAI from "openai";
import { AppDataSource } from "../../data-source.js";
import { Prompt } from "../prompts/prompt.entity.js";
import { User } from "../users/user.entity.js";
import { authenticateToken } from "../auth/auth.middleware.js";
import { decrypt } from "../../lib/encrypt.js";

const router = Router();
router.use(authenticateToken);

const promptRepo = () => AppDataSource.getRepository(Prompt);
const userRepo = () => AppDataSource.getRepository(User);

const ALLOWED_MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4o-nano"] as const;

router.post("/generate", async (req, res) => {
  const { keyword, copiedText, model } = req.body as { keyword?: string; copiedText?: string; model?: string };
  if (!keyword || typeof keyword !== "string" || copiedText === undefined) {
    res.status(400).json({ error: "keyword and copiedText required" });
    return;
  }
  const modelToUse = model && ALLOWED_MODELS.includes(model as (typeof ALLOWED_MODELS)[number]) ? model : "gpt-4o-mini";
  const normalizedKeyword = keyword.trim().toLowerCase().replace(/\s+/g, "");
  const prompt = await promptRepo().findOne({
    where: { userId: req.userId!, keyword: normalizedKeyword },
  });
  if (!prompt) {
    res.status(404).json({ error: "No prompt found for this keyword" });
    return;
  }
  const user = await userRepo().findOne({ where: { id: req.userId! } });
  if (!user?.openaiKeyEncrypted) {
    res.status(400).json({ error: "OpenAI API key not set. Set it in the dashboard." });
    return;
  }
  let apiKey: string;
  try {
    apiKey = decrypt(user.openaiKeyEncrypted);
  } catch {
    res.status(500).json({ error: "Failed to read API key" });
    return;
  }
  const messageContent = prompt.body.replace(/\{\{copied_text\}\}/gi, String(copiedText ?? ""));
  const openai = new OpenAI({ apiKey });
  try {
    const completion = await openai.chat.completions.create({
      model: modelToUse,
      messages: [{ role: "user", content: messageContent }],
      max_tokens: 1024,
    });
    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    res.json({ text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "OpenAI request failed";
    res.status(502).json({ error: message });
  }
});

export default router;
