import express from "express";
import { getAllNotes, getNotesById, createNote, updateNote, deleteNote } from "./Controllers/NoteController";
import { AppDataSource } from "./Database/Connection";
import { get } from "node:http";

const app = express();
app.use(express.json());

AppDataSource.initialize()
  .then(() => 
  {
    app.get("/note/getall", getAllNotes);
    app.get("/note/getbyid/:userId", getNotesById);
    app.post("/note/create", createNote);
    app.put("/note/edit/:noteId", updateNote);
    app.delete("/note/delete/:noteId", deleteNote);

    app.listen(3000, () => 
    {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => console.error("Database connection failed:", err));