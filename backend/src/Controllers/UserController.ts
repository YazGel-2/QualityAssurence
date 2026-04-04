import { Request, Response } from 'express';
import { AppDataSource } from "../Database/Connection";
import bcrypt from 'bcrypt';

export const getAllUsers = async (req: Request, res: Response) => 
{
    const db = AppDataSource.manager;
    try 
    {
        const users = await db.query('SELECT id, username, role FROM user');
        res.status(200).json({ data: users });
    } 
    catch (error) 
    {
        console.error('Failed to fetch users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getUserById = async (req: Request, res: Response) => 
{
    const db = AppDataSource.manager;
    const { userId } = req.params;

    if (!userId) 
    {
        return res.status(400).json({ error: "User ID is required" });
    }

    try 
    {
        const users = await db.query(
            "SELECT id, username, role FROM user WHERE id = ?", 
            [userId]
        );

        if (users.length === 0) 
        {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ data: users[0] });
    } 
    catch (error) 
    {
        console.error('Failed to fetch user:', error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
};

export const createUser = async (req: Request, res: Response) => 
{
    const db = AppDataSource.manager;
    const { username, password, role } = req.body;

    if (!username || !password) 
    {
        return res.status(400).json({ error: "Username and password are required" });
    }

    const userRole = role ?? 'user';

    try 
    {
        const existing = await db.query(
            "SELECT id FROM user WHERE username = ?", 
            [username]
        );

        if (existing.length > 0) 
        {
            return res.status(409).json({ error: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query(
            "INSERT INTO user (username, password, role) VALUES (?, ?, ?)",
            [username, hashedPassword, userRole]
        );

        res.status(201).json({ 
            message: "User created successfully", 
            userId: result.insertId 
        });
    } 
    catch (error) 
    {
        console.error('Failed to create user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const updateUser = async (req: Request, res: Response) => 
{
    const db = AppDataSource.manager;
    const { userId } = req.params;
    const { username, password, role } = req.body;

    if (!userId || (!username && !password && !role)) 
    {
        return res.status(400).json({ 
            error: "User ID and at least one field (username, password or role) are required" 
        });
    }

    try 
    {
        let hashedPassword: string | undefined;
        if (password) 
        {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const result = await db.query(
            `UPDATE user 
             SET username = COALESCE(?, username), 
                 password = COALESCE(?, password),
                 role     = COALESCE(?, role)
             WHERE id = ?`,
            [username ?? null, hashedPassword ?? null, role ?? null, userId]
        );

        if (result.affectedRows === 0) 
        {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully" });
    } 
    catch (error) 
    {
        console.error('Failed to update user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

export const deleteUser = async (req: Request, res: Response) => 
{
    const db = AppDataSource.manager;
    const { userId } = req.params;

    if (!userId) 
    {
        return res.status(400).json({ error: "User ID is required" });
    }

    try 
    {
        const result = await db.query(
            "DELETE FROM user WHERE id = ?", 
            [userId]
        );

        if (result.affectedRows === 0) 
        {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } 
    catch (error) 
    {
        console.error('Failed to delete user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};