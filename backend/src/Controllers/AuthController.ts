import { Request, Response } from 'express';
import { AppDataSource } from "../Database/Connection";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? '1d') as jwt.SignOptions['expiresIn'];

export const register = async (req: Request, res: Response) => 
{
    const db = AppDataSource.manager;
    const { username, password } = req.body;

    if (!username || !password) 
    {
        return res.status(400).json({ error: "Username and password are required" });
    }

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
            [username, hashedPassword, 'user']
        );

        res.status(201).json({ 
            message: "Registration successful", 
            userId: result.insertId 
        });
    } 
    catch (error) 
    {
        console.error('Registration failed:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

export const login = async (req: Request, res: Response) => 
{
    const db = AppDataSource.manager;
    const { username, password } = req.body;

    if (!username || !password) 
    {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try 
    {
        const users = await db.query(
            "SELECT * FROM user WHERE username = ?", 
            [username]
        );

        if (users.length === 0) 
        {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const user = users[0];
        console.log(user);
        
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) 
        {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const token = jwt.sign(
            { 
                userId: user.id, 
                role:   user.role 
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(200).json({ 
            message: "Login successful", 
            token 
        });
    } 
    catch (error) 
    {
        console.error('Login failed:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

export const me = async (req: Request, res: Response) => 
{
    const user = (req as any).user;
    res.status(200).json({ data: user });
};