import { Router } from 'express';
import * as applicationController from '../controllers/application.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { UserRole } from '@job-platform/shared-types';
import {
  applyJobSchema,
  updateApplicationStatusSchema,
  addEmployerNotesSchema,
} from '@job-platform/shared-validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── Jobseeker Routes ─────────────────────────────────────────────────────────

// Apply to a job
router.post(
  '/',
  authorize(UserRole.JOBSEEKER),
  validate(applyJobSchema),
  applicationController.applyToJob,
);

// Get my applications
router.get(
  '/me',
  authorize(UserRole.JOBSEEKER),
  applicationController.getMyApplications,
);

// Get jobseeker stats
router.get(
  '/me/stats',
  authorize(UserRole.JOBSEEKER),
  applicationController.getJobseekerStats,
);

// Withdraw application
router.patch(
  '/:applicationId/withdraw',
  authorize(UserRole.JOBSEEKER),
  applicationController.withdrawApplication,
);

// ─── Employer Routes ──────────────────────────────────────────────────────────

// Get applications for a specific job
router.get(
  '/job/:jobId',
  authorize(UserRole.EMPLOYER, UserRole.ADMIN),
  applicationController.getJobApplications,
);

// Get employer application stats
router.get(
  '/employer/stats',
  authorize(UserRole.EMPLOYER, UserRole.ADMIN),
  applicationController.getEmployerStats,
);

// Update application status
router.patch(
  '/:applicationId/status',
  authorize(UserRole.EMPLOYER, UserRole.ADMIN),
  validate(updateApplicationStatusSchema),
  applicationController.updateApplicationStatus,
);

// Add employer notes
router.patch(
  '/:applicationId/notes',
  authorize(UserRole.EMPLOYER, UserRole.ADMIN),
  validate(addEmployerNotesSchema),
  applicationController.addEmployerNotes,
);

// ─── Shared Routes ────────────────────────────────────────────────────────────

// Get single application (both applicant and employer can view)
router.get('/:applicationId', applicationController.getApplication);

// ─── Saved Jobs ───────────────────────────────────────────────────────────────

// Save a job
router.post('/saved/:jobId', applicationController.saveJob);

// Unsave a job
router.delete('/saved/:jobId', applicationController.unsaveJob);

// Get saved jobs
router.get('/saved/list', applicationController.getSavedJobs);

// Check if job is saved
router.get('/saved/:jobId/check', applicationController.isJobSaved);

export default router;
