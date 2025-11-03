import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../lib/bcrypt';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies 
} from '../lib/jwt';
import { AuthRequest } from '../middleware/auth.middleware';
import crypto from 'crypto';
import { sendEmail } from '../lib/email-free';

// Register
export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, major, mustChangePassword, role } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: normalizedEmail } 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Validate role if provided
    const validRoles = ['Admin', 'LopTruong', 'LopPhoHocTap', 'LopPhoDoiSong', 'BiThu', 'PhoBiThu', 'ThanhVien'];
    const userRole = role && validRoles.includes(role) ? role : 'ThanhVien';

    console.log('Creating user with data:', {
      email: normalizedEmail,
      name: name.trim(),
      major: major?.trim() || '',
      role: userRole,
      mustChangePassword: mustChangePassword === true
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name.trim(),
        major: major?.trim() || '',
        role: userRole,
        mustChangePassword: mustChangePassword === true // Default to false if not provided
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        coverImage: true,
        bio: true,
        major: true,
        points: true,
        createdAt: true
      }
    });

    // Generate tokens
    const accessToken = generateAccessToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });
    const refreshToken = generateRefreshToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });

    setTokenCookies(res, accessToken, refreshToken);

    // Send welcome email (non-blocking)
    sendEmail({
      to: user.email,
      subject: 'Chào mừng đến với ClassZone!',
      text: `Xin chào ${user.name},\n\nChào mừng bạn đến với ClassZone!`,
      html: `<h1>Xin chào ${user.name}!</h1><p>Chào mừng bạn đến với ClassZone!</p>`
    }).catch(err => console.error('Failed to send welcome email:', err));

    res.status(201).json({ 
      user, 
      accessToken, 
      refreshToken 
    });
  } catch (error) {
    console.error('Register error:', error);
    
    // Provide more detailed error message
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user with password
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase().trim() }
    });

    // User not found
    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    // User has no password (OAuth user trying to login with password)
    if (!user.password) {
      return res.status(401).json({ error: 'Vui lòng đăng nhập bằng tài khoản mạng xã hội' });
    }

    // Check if account is locked
    if (user.locked) {
      return res.status(403).json({ 
        error: 'Tài khoản của bạn đã bị khoá. Vui lòng liên hệ quản trị viên.',
        contactUrl: 'https://facebook.com/tuanvik206'
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    // Generate tokens
    const accessToken = generateAccessToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });
    const refreshToken = generateRefreshToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });

    setTokenCookies(res, accessToken, refreshToken);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ 
      user: userWithoutPassword, 
      accessToken, 
      refreshToken,
      mustChangePassword: user.mustChangePassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  clearTokenCookies(res);
  res.json({ message: 'Logged out successfully' });
};

// Refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const cookieRefreshToken = req.cookies.refreshToken;

    const token = refreshToken || cookieRefreshToken;
    if (!token) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    const decoded = verifyRefreshToken(token);

    // Generate new tokens
    const newAccessToken = generateAccessToken({ 
      userId: decoded.userId, 
      email: decoded.email, 
      role: decoded.role 
    });
    const newRefreshToken = generateRefreshToken({ 
      userId: decoded.userId, 
      email: decoded.email, 
      role: decoded.role 
    });

    setTokenCookies(res, newAccessToken, newRefreshToken);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// Get current user
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        coverImage: true,
        role: true,
        bio: true,
        major: true,
        birthday: true,
        phone: true,
        facebookUrl: true,
        githubUrl: true,
        points: true,
        locked: true,
        mustChangePassword: true,
        createdAt: true,
        badges: {
          include: {
            badge: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Change password
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ 
      where: { id: req.user!.id } 
    });

    if (!user || !user.password) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If mustChangePassword is true, skip current password verification
    // (first-time password change with default password)
    if (!user.mustChangePassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required' });
      }
      
      const isValid = await comparePassword(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        mustChangePassword: false
      }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If email exists, reset link has been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: resetTokenExpires
      }
    });

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    try {
      await sendEmail({
        to: user.email,
        subject: 'Đặt lại mật khẩu ClassZone',
        text: `Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng truy cập: ${resetUrl}`,
        html: `
          <h2>Đặt lại mật khẩu</h2>
          <p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
          <p>Nhấn vào link sau để đặt lại mật khẩu (có hiệu lực trong 1 giờ):</p>
          <a href="${resetUrl}">${resetUrl}</a>
        `
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      return res.status(500).json({ error: 'Failed to send reset email' });
    }

    res.json({ message: 'If email exists, reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.params;
    const { password } = req.body;

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        mustChangePassword: false
      }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// OAuth placeholders (implement with Passport.js)
export const googleAuth = (req: Request, res: Response) => {
  res.json({ message: 'Google OAuth - To be implemented with Passport.js' });
};

export const googleAuthCallback = (req: Request, res: Response) => {
  res.json({ message: 'Google OAuth Callback - To be implemented' });
};

export const facebookAuth = (req: Request, res: Response) => {
  res.json({ message: 'Facebook OAuth - To be implemented with Passport.js' });
};

export const facebookAuthCallback = (req: Request, res: Response) => {
  res.json({ message: 'Facebook OAuth Callback - To be implemented' });
};
