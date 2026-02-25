import { Router } from 'express';
import * as assessmentController from '../controllers/assessment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { UserRole } from '@job-platform/shared-types';
import {
  createAssessmentSchema,
  submitAssessmentSchema,
} from '@job-platform/shared-validators';

const router = Router();

// ─── Public Routes ───────────────────────────────────────────────────────────

// List assessments (browse)
router.get('/', assessmentController.listAssessments);

// Get assessment by slug (public view, no answers)
router.get('/slug/:slug', assessmentController.getAssessmentBySlug);

// ─── Authenticated Routes ────────────────────────────────────────────────────

// My attempts history
router.get('/attempts', authenticate, assessmentController.getMyAttempts);

// Get attempt result
router.get('/attempts/:attemptId', authenticate, assessmentController.getAttemptResult);

// My verified skills
router.get('/verified-skills', authenticate, assessmentController.getMyVerifiedSkills);

// Start an assessment (get questions without answers)
router.post('/:assessmentId/start', authenticate, assessmentController.startAssessment);

// Submit assessment answers
router.post(
  '/:assessmentId/submit',
  authenticate,
  validate(submitAssessmentSchema),
  assessmentController.submitAssessment,
);

// ─── Matching / Recommendations ──────────────────────────────────────────────

// Get recommended jobs based on profile + verified skills
router.get(
  '/recommended-jobs',
  authenticate,
  authorize(UserRole.JOBSEEKER),
  assessmentController.getRecommendedJobs,
);

// Get match score for a specific job
router.get(
  '/match/:jobId',
  authenticate,
  authorize(UserRole.JOBSEEKER),
  assessmentController.getJobMatchScore,
);

// ─── Admin Routes ────────────────────────────────────────────────────────────

// Create assessment
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(createAssessmentSchema),
  assessmentController.createAssessment,
);

// Update assessment
router.put(
  '/:assessmentId',
  authenticate,
  authorize(UserRole.ADMIN),
  assessmentController.updateAssessment,
);

// Toggle active
router.patch(
  '/:assessmentId/toggle-active',
  authenticate,
  authorize(UserRole.ADMIN),
  assessmentController.toggleAssessmentActive,
);

export default router;
