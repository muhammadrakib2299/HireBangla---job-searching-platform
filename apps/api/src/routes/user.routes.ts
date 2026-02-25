import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { changePasswordSchema } from '@job-platform/shared-validators';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Profile
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Password
router.put(
  '/change-password',
  validate(changePasswordSchema),
  userController.changePassword,
);

// Public profile (still requires auth to view)
router.get('/:userId/public', userController.getPublicProfile);

// Preferences & Skills
router.put('/preferences', userController.updatePreferences);
router.put('/skills', userController.updateSkills);

export default router;
