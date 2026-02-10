import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { User } from "./modules/users/user.entity.js";
import { Prompt } from "./modules/prompts/prompt.entity.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: process.env.NODE_ENV === "development",
  entities: [User, Prompt],
  subscribers: [],
});
