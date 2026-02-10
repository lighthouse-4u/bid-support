import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../../data-source.js";
import { User } from "../users/user.entity.js";

const router = Router();
const userRepo = () => AppDataSource.getRepository(User);

router.post("/signup", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  const repo = userRepo();
  const existing = await repo.findOne({ where: { email: email.toLowerCase() } });
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = repo.create({
    email: email.toLowerCase(),
    passwordHash,
  });
  await repo.save(user);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }
  const token = jwt.sign({ sub: user.id }, secret, { expiresIn: "7d" });
  res.status(201).json({ token, user: { id: user.id, email: user.email } });
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  const repo = userRepo();
  const user = await repo.findOne({ where: { email: email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }
  const token = jwt.sign({ sub: user.id }, secret, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email } });
});

export default router;
