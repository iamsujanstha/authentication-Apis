import { Request, Response } from 'express';
import UserModel from '../models/user_models';
import bcryptjs from 'bcryptjs';
import sendEmail from '../config/sendEmail';
import verificationEmailTemplate from '../utils/verifyEmailTemplate';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens';
import { AuthenticatedRequest } from '../middleware/auth-middleware';


// Helper function for cookie options
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as 'none',
};

// Register User Controller
export const registerUserController = async (req: Request, res: Response): Promise<Response> => {
  const { name, email, password } = req.body;

  try {
    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Provide name, email, and password",
        error: true,
        success: false,
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered",
        error: true,
        success: false,
      });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Save user to database
    const newUser = new UserModel({ name, email, password: hashedPassword });
    const savedUser = await newUser.save();

    // Send verification email
    const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${savedUser._id}`;
    await sendEmail({
      sendTo: email,
      subject: "Verify your email",
      html: verificationEmailTemplate(name, verifyEmailUrl),
    });

    return res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      success: true,
      error: false,
      data: savedUser,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
};

// Verify Email Controller
export const verifyEmailController = async (req: Request, res: Response): Promise<Response> => {
  const { code } = req.body;

  try {
    const user = await UserModel.findById(code);

    if (!user) {
      return res.status(400).json({
        message: "Invalid code",
        error: true,
        success: false,
      });
    }

    await UserModel.updateOne({ _id: code }, { verify_email: true });

    return res.status(200).json({
      message: "Email verification successful",
      error: false,
      success: true,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
};

// Login Controller
export const loginController = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not registered",
        error: true,
        success: false,
      });
    }

    if (user.status !== "Active") {
      return res.status(400).json({
        message: "Account is inactive. Contact Admin.",
        error: true,
        success: false,
      });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
        error: true,
        success: false,
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Set cookies
    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    return res.json({
      message: "Login successful",
      success: true,
      error: false,
      data: { accessToken, refreshToken },
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
};

// Logout Controller
export const logoutController = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        message: "Invalid request",
        error: true,
        success: false,
      });
    }

    // Clear cookies and remove refresh token
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    await UserModel.findByIdAndUpdate(userId, { refresh_token: "" });

    return res.json({
      message: "Logout successful",
      success: true,
      error: false,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
};
