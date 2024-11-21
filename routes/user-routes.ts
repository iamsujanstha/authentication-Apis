import { Router } from 'express';
import { loginController, logoutController, registerUserController, verifyEmailController, } from '../controllers/user-controller';
import { authMiddleware } from '../middleware/auth-middleware'

const userRouter: Router = Router();

userRouter.post('/register', registerUserController as any);
userRouter.post('/verify-email', verifyEmailController as any);
userRouter.post('/login', loginController as any);
userRouter.post('/logout', authMiddleware as any, logoutController as any)

export default userRouter;
