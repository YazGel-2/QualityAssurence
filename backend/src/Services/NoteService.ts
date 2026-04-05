import { AppDataSource } from "../Database/Connection";

export class AppError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = "AppError";
    }
}

export const getAllNotes = async () => {
    const db = AppDataSource.manager;
    const notes = await db.query('SELECT * FROM note');
    return notes;
};

export const getNoteById = async (noteId: string | string[]) => 
{
    const db = AppDataSource.manager;

    const notes = await db.query('SELECT * FROM note WHERE id = ?', [noteId]);
    if (notes.length === 0)
    {
        throw new AppError(404, "Note not found");
    }
    return notes[0];
};

export const getMyNotes = async (userId: number) => {
    if (!userId) 
    {
        throw new AppError(401, "Unauthorized");
    }

    const db = AppDataSource.manager;
    const notes = await db.query("SELECT * FROM note WHERE userId = ?", [userId]);
    return notes;
};

export const createNote = async (title: string, content: string, userId: number) => {
    if (!title || !content) 
    {
        throw new AppError(400, "Title and content are required");
    }

    if (!userId) 
    {
        throw new AppError(401, "Unauthorized");
    }

    const db = AppDataSource.manager;
    const result = await db.query(
        "INSERT INTO note (title, content, userId) VALUES (?, ?, ?)",
        [title, content, userId]
    );

    return { noteId: result };
};

export const updateNote = async (noteId: string, title?: string, content?: string) => {
    if (!noteId || (!title && !content)) {
        throw new AppError(400, "Note ID and at least one field (title or content) are required");
    }

    const db = AppDataSource.manager;
    const result = await db.query(
        "UPDATE note SET title = COALESCE(?, title), content = COALESCE(?, content) WHERE id = ?",
        [title, content, noteId]
    );

    if (result.changes === 0) {
        throw new AppError(404, "Note not found");
    }
};

export const deleteNote = async (noteId: string) => {
    if (!noteId) {
        throw new AppError(400, "Note ID is required");
    }

    const db = AppDataSource.manager;
    const result = await db.query("DELETE FROM note WHERE id = ?", [noteId]);

    if (result.changes === 0) {
        throw new AppError(404, "Note not found");
    }
};
