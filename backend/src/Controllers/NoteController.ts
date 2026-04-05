import { Request, Response } from 'express';
import * as NoteService from '../Services/NoteService';
import { AppError } from '../Services/NoteService';

export const getAllNotes = async (req: Request, res: Response) => {
    try 
    {
        const notes = await NoteService.getAllNotes();
        res.status(200).json({ data: notes });
    } 
    catch (error) 
    {
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
};

export const getNoteById = async (req: Request,res: Response) => 
{
    const noteId = req.params.noteId;
    try
    {
        const note = await NoteService.getNoteById(noteId);
        res.status(200).json(note);
    } 
    catch (error) 
    {
        console.error('Failed to fetch notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
};

export const getMyNotes = async (req: Request, res: Response) => {
    const user = (req as any).user;
    try 
    {
        const notes = await NoteService.getMyNotes(user?.userId);
        res.status(200).json({ data: notes });
    } 
    catch (error) 
    {
        if (error instanceof AppError) 
        {
            return res.status(error.status).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to fetch notes" });
    }
};

export const createNote = async (req: Request, res: Response) => {
    const { title, content } = req.body;
    const user = (req as any).user;
    try 
    {
        const result = await NoteService.createNote(title, content, user?.userId);
        res.status(201).json({ message: "Note created successfully", noteId: result.noteId });
    } 
    catch (error) 
    {
        if (error instanceof AppError) {
            return res.status(error.status).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to create note' });
    }
};

export const updateNote = async (req: Request, res: Response) => {
    const noteId = req.params.noteId as string;
    const { title, content } = req.body;
    try 
    {
        await NoteService.updateNote(noteId, title, content);
        res.status(200).json({ message: "Note updated successfully" });
    } 
    catch (error) 
    {
        if (error instanceof AppError) 
        {
            return res.status(error.status).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to update note' });
    }
};

export const deleteNote = async (req: Request, res: Response) => {
    const noteId = req.params.noteId as string;
    try 
    {
        await NoteService.deleteNote(noteId);
        res.status(204).json({ message: "Note deleted successfully" });
    } 
    catch (error) 
    {
        if (error instanceof AppError) 
        {
            return res.status(error.status).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to delete note' });
    }
};
