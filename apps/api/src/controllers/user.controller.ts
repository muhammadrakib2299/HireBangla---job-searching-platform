import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import * as authService from '../services/auth.service.js';

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await User.findById(req.user!._id).populate('company');
    if (!user) throw new AppError('User not found', 404);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const allowedFields = [
      'profile.firstName',
      'profile.lastName',
      'profile.phone',
      'profile.avatar',
      'profile.dateOfBirth',
      'profile.gender',
      'profile.location',
      'profile.headline',
      'profile.bio',
      'profile.website',
      'profile.linkedin',
      'profile.github',
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      // Support both flat (profile.firstName) and nested ({profile: {firstName}}) formats
      const shortKey = key.split('.')[1];
      if (req.body.profile && shortKey && req.body.profile[shortKey] !== undefined) {
        updates[key] = req.body.profile[shortKey];
      } else if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { $set: updates },
      { new: true, runValidators: true },
    ).populate('company');

    if (!user) throw new AppError('User not found', 404);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(
      req.user!._id.toString(),
      currentPassword,
      newPassword,
    );
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await User.findById(req.params.userId).select(
      'profile skills createdAt',
    );
    if (!user) throw new AppError('User not found', 404);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePreferences(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { preferredJobTypes, preferredCategories, expectedSalary } = req.body;

    const updates: Record<string, unknown> = {};
    if (preferredJobTypes) updates.preferredJobTypes = preferredJobTypes;
    if (preferredCategories) updates.preferredCategories = preferredCategories;
    if (expectedSalary) updates.expectedSalary = expectedSalary;

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!user) throw new AppError('User not found', 404);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSkills(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { skills } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { $set: { skills } },
      { new: true, runValidators: true },
    );

    if (!user) throw new AppError('User not found', 404);

    res.json({
      success: true,
      message: 'Skills updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}
