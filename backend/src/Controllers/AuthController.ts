import { Request, Response } from 'express';
import * as AuthService from '../Services/AuthService';
import { AppError } from '../Services/AuthService';

export const register = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
        const result = await AuthService.registerUser(username, password);
        res.status(201).json({ message: "Registration successful", userId: result.userId });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error('Registration failed:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
        const result = await AuthService.loginUser(username, password);
        res.status(200).json({ message: "Login successful", token: result.token });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error('Login failed:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

export const me = async (req: Request, res: Response) => {
    const user = (req as any).user;
    res.status(200).json({ data: user });
};
