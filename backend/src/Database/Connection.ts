import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../Models/User";
import { Note } from "../Models/Note";
import path from "path";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: path.resolve(__dirname, "../../data/app.db"),
  synchronize: false,
  logging: true,
  entities: [User, Note],
  migrations: [__dirname + "/Migrations/*.{ts,js}"],
});