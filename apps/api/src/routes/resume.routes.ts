import { Router } from 'express';
import * as resumeController from '../controllers/resume.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createResumeSchema,
  updateResumeSchema,
} from '@job-platform/shared-validators';

const router = Router();

// All resume routes require authentication
router.use(authenticate);

router.post('/', validate(createResumeSchema), resumeController.createResume);
router.get('/', resumeController.listResumes);
router.get('/:id', resumeController.getResume);
router.put('/:id', validate(updateResumeSchema), resumeController.updateResume);
router.delete('/:id', resumeController.deleteResume);
router.patch('/:id/default', resumeController.setDefaultResume);

export default router;
