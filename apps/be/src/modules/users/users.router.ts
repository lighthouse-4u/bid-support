import { Router } from "express";
import { AppDataSource } from "../../data-source.js";
import { User } from "./user.entity.js";
import { authenticateToken } from "../auth/auth.middleware.js";
import { encrypt } from "../../lib/encrypt.js";

const router = Router();
router.use(authenticateToken);

const userRepo = () => AppDataSource.getRepository(User);

router.get("/me", async (req, res) => {
  const user = await userRepo().findOne({
    where: { id: req.userId! },
    select: { id: true, email: true, createdAt: true, updatedAt: true },
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.put("/me/openai-key", async (req, res) => {
  const { key } = req.body as { key?: string | null };
  if (key === undefined || (key !== null && typeof key !== "string")) {
    res.status(400).json({ error: "key must be a string or null" });
    return;
  }
  const repo = userRepo();
  const user = await repo.findOne({ where: { id: req.userId! } });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  user.openaiKeyEncrypted = key === null || key === "" ? null : encrypt(key);
  await repo.save(user);
  res.json({ ok: true });
});

export default router;
