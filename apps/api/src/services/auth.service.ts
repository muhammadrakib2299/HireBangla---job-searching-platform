import { User, IUserDocument } from '../models/User.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  parseDuration,
} from '../utils/jwt.js';
import { generateToken, hashToken } from '../utils/password.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './email.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';
import type {
  RegisterInput,
  LoginInput,
} from '@job-platform/shared-validators';

function generateTokens(user: IUserDocument) {
  const payload = { userId: user._id.toString(), role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

function sanitizeUser(user: IUserDocument) {
  return {
    _id: user._id,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    profile: {
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      avatar: user.profile.avatar,
    },
  };
}

// ─── Register ────────────────────────────────────────────────────────────────

export async function register(input: RegisterInput) {
  const existingUser = await User.findOne({ email: input.email });
  if (existingUser) {
    throw new AppError('Email is already registered', 409);
  }

  const verificationToken = generateToken();

  const user = await User.create({
    email: input.email,
    password: input.password,
    role: input.role,
    profile: {
      firstName: input.firstName,
      lastName: input.lastName,
    },
    emailVerificationToken: hashToken(verificationToken),
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
  });

  await sendVerificationEmail(user.email, verificationToken);

  const tokens = generateTokens(user);

  // Store refresh token
  user.refreshTokens.push({
    token: tokens.refreshToken,
    expiresAt: new Date(Date.now() + parseDuration(env.JWT_REFRESH_EXPIRES_IN)),
  });
  await user.save();

  return {
    user: sanitizeUser(user),
    tokens,
  };
}

// ─── Login ───────────────────────────────────────────────────────────────────

export async function login(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select('+password');

  if (!user || !user.password) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await user.comparePassword(input.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account has been deactivated', 403);
  }

  const tokens = generateTokens(user);

  // Store refresh token and update last login
  user.refreshTokens.push({
    token: tokens.refreshToken,
    expiresAt: new Date(Date.now() + parseDuration(env.JWT_REFRESH_EXPIRES_IN)),
  });
  user.lastLoginAt = new Date();
  await user.save();

  return {
    user: sanitizeUser(user),
    tokens,
  };
}

// ─── Google OAuth ────────────────────────────────────────────────────────────

export async function googleAuth(profile: {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}) {
  let user = await User.findOne({
    $or: [{ googleId: profile.googleId }, { email: profile.email }],
  });

  if (user) {
    // Link Google account if not already linked
    if (!user.googleId) {
      user.googleId = profile.googleId;
      user.isEmailVerified = true;
    }
    if (profile.avatar && !user.profile.avatar) {
      user.profile.avatar = profile.avatar;
    }
  } else {
    // Create new user
    user = new User({
      email: profile.email,
      googleId: profile.googleId,
      isEmailVerified: true,
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatar: profile.avatar,
      },
    });
  }

  const tokens = generateTokens(user);

  user.refreshTokens.push({
    token: tokens.refreshToken,
    expiresAt: new Date(Date.now() + parseDuration(env.JWT_REFRESH_EXPIRES_IN)),
  });
  user.lastLoginAt = new Date();
  await user.save();

  return {
    user: sanitizeUser(user),
    tokens,
  };
}

// ─── Refresh Token ───────────────────────────────────────────────────────────

export async function refreshToken(oldRefreshToken: string) {
  const payload = verifyRefreshToken(oldRefreshToken);

  const user = await User.findById(payload.userId);
  if (!user) {
    throw new AppError('User not found', 401);
  }

  // Check if refresh token exists in user's tokens
  const tokenIndex = user.refreshTokens.findIndex(
    (rt) => rt.token === oldRefreshToken,
  );

  if (tokenIndex === -1) {
    // Token reuse detected - invalidate all refresh tokens
    user.refreshTokens = [];
    await user.save();
    throw new AppError('Token reuse detected. All sessions revoked.', 401);
  }

  // Remove old token
  user.refreshTokens.splice(tokenIndex, 1);

  // Generate new tokens (rotation)
  const tokens = generateTokens(user);

  user.refreshTokens.push({
    token: tokens.refreshToken,
    expiresAt: new Date(Date.now() + parseDuration(env.JWT_REFRESH_EXPIRES_IN)),
  });
  await user.save();

  return { tokens };
}

// ─── Logout ──────────────────────────────────────────────────────────────────

export async function logout(userId: string, refreshTokenToRemove?: string) {
  const user = await User.findById(userId);
  if (!user) return;

  if (refreshTokenToRemove) {
    user.refreshTokens = user.refreshTokens.filter(
      (rt) => rt.token !== refreshTokenToRemove,
    );
  } else {
    // Logout from all devices
    user.refreshTokens = [];
  }

  await user.save();
}

// ─── Verify Email ────────────────────────────────────────────────────────────

export async function verifyEmail(token: string) {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return { message: 'Email verified successfully' };
}

// ─── Forgot Password ────────────────────────────────────────────────────────

export async function forgotPassword(email: string) {
  const user = await User.findOne({ email });

  // Always return success to prevent email enumeration
  if (!user) return { message: 'If the email exists, a reset link has been sent' };

  const resetToken = generateToken();

  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  await sendPasswordResetEmail(user.email, resetToken);

  return { message: 'If the email exists, a reset link has been sent' };
}

// ─── Reset Password ─────────────────────────────────────────────────────────

export async function resetPassword(token: string, newPassword: string) {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // Invalidate all refresh tokens (force re-login)
  user.refreshTokens = [];
  await user.save();

  return { message: 'Password reset successfully' };
}

// ─── Change Password ─────────────────────────────────────────────────────────

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await User.findById(userId).select('+password');

  if (!user || !user.password) {
    throw new AppError('User not found', 404);
  }

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = newPassword;
  // Keep current session, invalidate others
  user.refreshTokens = [];
  await user.save();

  return { message: 'Password changed successfully' };
}

// ─── Get Current User ────────────────────────────────────────────────────────

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId).populate('company');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
}
