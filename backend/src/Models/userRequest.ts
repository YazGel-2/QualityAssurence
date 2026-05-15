import { Request, Response } from "express";

export interface userRequest extends Request {
    user?: {
        userId: number;
    };
}