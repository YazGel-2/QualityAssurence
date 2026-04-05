import { AppDataSource } from "../Database/Connection";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET    = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? '1d') as jwt.SignOptions['expiresIn'];

export class AppError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = "AppError";
    }
}

export const registerUser = async (username: string, password: string) => {
    if (!username || !password) {
        throw new AppError(400, "Username and password are required");
    }

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
        [username, hashedPassword, 'user']
    );

    return { userId: result.insertId };
};

export const loginUser = async (username: string, password: string) => {
    if (!username || !password) {
        throw new AppError(400, "Username and password are required");
    }

    const db = AppDataSource.manager;

    const users = await db.query(
        "SELECT * FROM user WHERE username = ?",
        [username]
    );

    if (users.length === 0) {
        throw new AppError(401, "Invalid username or password");
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new AppError(401, "Invalid username or password");
    }

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    return { token };
};
