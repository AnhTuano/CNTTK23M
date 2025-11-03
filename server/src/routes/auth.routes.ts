import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty()
  ],
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  authController.login
);

// Logout
router.post('/logout', authenticate, authController.logout);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

// Change password
router.post(
  '/change-password',
  authenticate,
  [
    body('newPassword').isLength({ min: 6 })
    // currentPassword is optional - required only if mustChangePassword is false
  ],
  authController.changePassword
);

// Forgot password
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password/:token',
  [body('password').isLength({ min: 6 })],
  authController.resetPassword
);

// Google OAuth
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleAuthCallback);

// Facebook OAuth
router.get('/facebook', authController.facebookAuth);
router.get('/facebook/callback', authController.facebookAuthCallback);

export default router;
