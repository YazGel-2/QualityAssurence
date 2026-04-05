import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../Models/User";
import { Note } from "../Models/Note";
import path from "path";

const isTest = process.env.NODE_ENV === "test";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: path.resolve(__dirname, "../../data/app.db"),
  synchronize: isTest,
  logging: true,
  entities: [User, Note],
  migrations: isTest ? [] : [__dirname + "/Migrations/*.{ts,js}"],
});