import { AppDataSource } from "../Database/Connection";
import bcrypt from 'bcrypt';

export class AppError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = "AppError";
    }
}

export const getAllUsers = async () => {
    const db = AppDataSource.manager;
    const users = await db.query('SELECT id, username, role FROM user');
    return users;
};

export const getUserById = async (userId: string) => {
    if (!userId) {
        throw new AppError(400, "User ID is required");
    }

    const db = AppDataSource.manager;
    const users = await db.query(
        "SELECT id, username, role FROM user WHERE id = ?",
        [userId]
    );

    if (users.length === 0) {
        throw new AppError(404, "User not found");
    }

    return users[0];
};

export const createUser = async (username: string, password: string, role?: string) => {
    if (!username || !password) {
        throw new AppError(400, "Username and password are required");
    }

    const userRole = role ?? 'user';
    const db = AppDataSource.manager;

    const existing = await db.query(
        "SELECT id FROM user WHERE username = ?",
        [username]
    );

    if (existing.length > 0) {
        throw new AppError(409, "Username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
        "INSERT INTO user (username, password, role) VALUES (?, ?, ?)",
        [username, hashedPassword, userRole]
    );

    return { userId: result.insertId };
};

export const updateUser = async (
    userId: string,
    username?: string,
    password?: string,
    role?: string
) => {
    if (!userId || (!username && !password && !role)) {
        throw new AppError(400, "User ID and at least one field (username, password or role) are required");
    }

    let hashedPassword: string | undefined;
    if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
    }

    const db = AppDataSource.manager;
    const result = await db.query(
        `UPDATE user
         SET username = COALESCE(?, username),
             password = COALESCE(?, password),
             role     = COALESCE(?, role)
         WHERE id = ?`,
        [username ?? null, hashedPassword ?? null, role ?? null, userId]
    );

    if (result.affectedRows === 0) {
        throw new AppError(404, "User not found");
    }
};

export const deleteUser = async (userId: string) => {
    if (!userId) {
        throw new AppError(400, "User ID is required");
    }

    const db = AppDataSource.manager;
    const result = await db.query(
        "DELETE FROM user WHERE id = ?",
        [userId]
    );

    if (result.affectedRows === 0) {
        throw new AppError(404, "User not found");
    }
};
