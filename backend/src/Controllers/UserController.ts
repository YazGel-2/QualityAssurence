import { Request, Response } from 'express';
import * as UserService from '../Services/UserService';
import { AppError } from '../Services/UserService';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await UserService.getAllUsers();
        res.status(200).json({ data: users });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    try {
        const user = await UserService.getUserById(userId);
        res.status(200).json({ data: user });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.status).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to fetch user" });
    }
};

export const createUser = async (req: Request, res: Response) => {
    const { username, password, role } = req.body;
    try {
        const result = await UserService.createUser(username, password, role);
        res.status(201).json({ message: "User created successfully", userId: result.userId });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.status).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    const { username, password, role } = req.body;
    try {
        await UserService.updateUser(userId, username, password, role);
        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.status).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to update user' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    try {
        await UserService.deleteUser(userId);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.status).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
