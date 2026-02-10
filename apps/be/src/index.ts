import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source.js";
import authRouter from "./modules/auth/auth.router.js";
import usersRouter from "./modules/users/users.router.js";
import promptsRouter from "./modules/prompts/prompts.router.js";
import bidRouter from "./modules/bid/bid.router.js";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/prompts", promptsRouter);
app.use("/api/bid", bidRouter);

const PORT = Number(process.env.PORT) || 3000;

async function main() {
  await AppDataSource.initialize();
  app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
