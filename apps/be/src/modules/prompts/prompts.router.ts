import { Router } from "express";
import { AppDataSource } from "../../data-source.js";
import { Prompt } from "./prompt.entity.js";
import { authenticateToken } from "../auth/auth.middleware.js";

const router = Router();
router.use(authenticateToken);

const promptRepo = () => AppDataSource.getRepository(Prompt);

router.get("/", async (req, res) => {
  const prompts = await promptRepo().find({
    where: { userId: req.userId! },
    order: { keyword: "ASC" },
    select: { id: true, keyword: true, body: true, createdAt: true, updatedAt: true },
  });
  res.json(prompts);
});

router.post("/", async (req, res) => {
  const { keyword, body } = req.body as { keyword?: string; body?: string };
  if (!keyword || typeof keyword !== "string" || !body || typeof body !== "string") {
    res.status(400).json({ error: "keyword and body required" });
    return;
  }
  const normalized = keyword.trim().toLowerCase().replace(/\s+/g, "");
  if (!normalized) {
    res.status(400).json({ error: "keyword cannot be empty" });
    return;
  }
  const repo = promptRepo();
  const existing = await repo.findOne({
    where: { userId: req.userId!, keyword: normalized },
  });
  if (existing) {
    res.status(409).json({ error: "Keyword already used" });
    return;
  }
  const prompt = repo.create({ keyword: normalized, body: body.trim(), userId: req.userId! });
  await repo.save(prompt);
  res.status(201).json({ id: prompt.id, keyword: prompt.keyword, body: prompt.body, createdAt: prompt.createdAt, updatedAt: prompt.updatedAt });
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { keyword, body } = req.body as { keyword?: string; body?: string };
  const repo = promptRepo();
  const prompt = await repo.findOne({ where: { id, userId: req.userId! } });
  if (!prompt) {
    res.status(404).json({ error: "Prompt not found" });
    return;
  }
  if (keyword !== undefined) {
    const normalized = typeof keyword === "string" ? keyword.trim().toLowerCase().replace(/\s+/g, "") : "";
    if (!normalized) {
      res.status(400).json({ error: "keyword cannot be empty" });
      return;
    }
    const existing = await repo.findOne({
      where: { userId: req.userId!, keyword: normalized },
    });
    if (existing && existing.id !== id) {
      res.status(409).json({ error: "Keyword already used" });
      return;
    }
    prompt.keyword = normalized;
  }
  if (body !== undefined) prompt.body = typeof body === "string" ? body.trim() : prompt.body;
  await repo.save(prompt);
  res.json({ id: prompt.id, keyword: prompt.keyword, body: prompt.body, createdAt: prompt.createdAt, updatedAt: prompt.updatedAt });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const repo = promptRepo();
  const result = await repo.delete({ id, userId: req.userId! });
  if (result.affected === 0) {
    res.status(404).json({ error: "Prompt not found" });
    return;
  }
  res.status(204).send();
});

export default router;
