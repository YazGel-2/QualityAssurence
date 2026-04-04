import 'dotenv/config';
import express from "express";
import { AppDataSource } from "./Database/Connection";

import {
  getAllNotes,
  getMyNotes,
  createNote,
  updateNote,
  deleteNote,
} from "./Controllers/NoteController";

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "./Controllers/UserController";

import { register, login, me } from "./Controllers/AuthController";

import { authenticateToken, requireAdmin } from "./Middlewares/AuthMiddleware";

import cors from 'cors';

const app = express();
app.use(express.json());

app.use(cors());

AppDataSource.initialize()
  .then(() => {
    // ── Auth ─────────────────────────────────────
    app.post("/auth/register", register);
    app.post("/auth/login", login);
    app.get("/auth/me", authenticateToken, me);

    // ── Notes ─────────────────────────────────────────────
    app.get("/note/getall", authenticateToken, getAllNotes);
    app.get("/note/my-notes", authenticateToken, getMyNotes);
    app.post("/note/create", authenticateToken, createNote);
    app.put("/note/edit/:noteId", authenticateToken, updateNote);
    app.delete("/note/delete/:noteId", authenticateToken, deleteNote);

    // ── Users ────────────────────────────────
    app.get("/user/getall", authenticateToken, requireAdmin, getAllUsers);
    app.get(
      "/user/getbyid/:userId",
      authenticateToken,
      requireAdmin,
      getUserById,
    );
    app.post("/user/create", authenticateToken, requireAdmin, createUser);
    app.put("/user/edit/:userId", authenticateToken, requireAdmin, updateUser);
    app.delete(
      "/user/delete/:userId",
      authenticateToken,
      requireAdmin,
      deleteUser,
    );

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => console.error("Database connection failed:", err));
