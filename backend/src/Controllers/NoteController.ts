import { Request, Response } from 'express';
import { AppDataSource } from "../Database/Connection";

export const getAllNotes = async (req: Request,res: Response) => 
{
    const db = AppDataSource.manager;
    try
    {
        const notes = await db.query('SELECT * FROM note');
        res.status(200).json({ data: notes });
    } 
    catch (error) 
    {
        console.error('Failed to fetch notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
};

export const getMyNotes = async (req: Request, res: Response) => 
{
    const db = AppDataSource.manager;
    const user = (req as any).user;

    if (!user || !user.userId) 
    {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try 
    {
        const notes = await db.query("SELECT * FROM note WHERE userId = ?", [user.userId]);
        res.status(200).json({ data: notes });
    } 
    catch (error) 
    {
        res.status(500).json({ error: "Failed to fetch notes" });
    }
};

export const createNote = async (req: Request, res: Response) => 
{
    const db = AppDataSource.manager;
    const { title, content } = req.body;
    const user = (req as any).user;

    if (!title || !content) 
    {
        return res.status(400).json({ error: "Title and content are required" });
    }

    if (!user || !user.userId) 
    {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try 
    {
        const result = await db.query(
            "INSERT INTO note (title, content, userId) VALUES (?, ?, ?)",
            [title, content, user.userId]
        );
        res.status(201).json({ message: "Note created successfully", noteId: result.insertId });
    } 
    catch (error) 
    {
        console.error('Failed to create note:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
};

export const updateNote = async (req: Request, res: Response) => 
{
    const db = AppDataSource.manager;
    const noteId = req.params.noteId;
    const { title, content } = req.body;

    if (!noteId || (!title && !content)) 
    {
        return res.status(400).json({ error: "Note ID and at least one field (title or content) are required" });
    }

    try 
    {
        const result = await db.query("UPDATE note SET title = COALESCE(?, title), content = COALESCE(?, content) WHERE id = ?", [title, content, noteId]);

        if (result.changes === 0) 
        {
            return res.status(404).json({ error: "Note not found" });
        }

        res.status(200).json({ message: "Note updated successfully" });
    } 
    catch (error) 
    {
        res.status(500).json({ error: 'Failed to update note' });
    }
};

export const deleteNote = async (req: Request, res: Response) => 
{
    const db = AppDataSource.manager;
    const noteId = req.params.noteId;

    if (!noteId) 
    {
        return res.status(400).json({ error: "Note ID is required" });
    }

    try 
    {
        const result = await db.query("DELETE FROM note WHERE id = ?", [noteId]);

        if (result.changes === 0) 
        {
            return res.status(404).json({ error: "Note not found" });
        }

        res.status(200).json({ message: "Note deleted successfully" });
    } 
    catch (error) 
    {
        console.error('Failed to delete note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
};

