import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request to include userId
export interface AuthenticatedRequest extends Request {
  userId?: string; // Make it optional as it might not always be set
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1]; // ['Bearer', 'token']

    if (!token) {
      return res.status(401).json({
        message: "Provide token",
      });
    }

    const decode = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN || 'secret_key') as { id: string };

    if (!decode) {
      return res.status(401).json({
        message: "Unauthorized access",
        error: true,
        success: false,
      });
    }

    req.userId = decode.id; // Add the decoded id to req.userId
    next();

  } catch (error: any) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
