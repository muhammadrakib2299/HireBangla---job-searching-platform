import { Router } from 'express';
import * as jobController from '../controllers/job.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate, validateQuery } from '../middleware/validate.middleware.js';
import { cacheResponse } from '../middleware/cache.middleware.js';
import { UserRole } from '@job-platform/shared-types';
import { createJobSchema, jobSearchSchema } from '@job-platform/shared-validators';

const router = Router();

// Public routes (cached)
router.get('/', validateQuery(jobSearchSchema), cacheResponse(30), jobController.searchJobs);
router.get('/featured', cacheResponse(60), jobController.getFeaturedJobs);
router.get('/recent', cacheResponse(30), jobController.getRecentJobs);
router.get('/categories', cacheResponse(300), jobController.getCategories);
router.get('/:slug', jobController.getJobBySlug);
router.get('/:slug/similar', jobController.getSimilarJobs);

// Protected routes (employer only)
router.post(
  '/',
  authenticate,
  authorize(UserRole.EMPLOYER, UserRole.ADMIN),
  validate(createJobSchema),
  jobController.createJob,
);

router.put(
  '/:jobId',
  authenticate,
  authorize(UserRole.EMPLOYER, UserRole.ADMIN),
  jobController.updateJob,
);

router.delete(
  '/:jobId',
  authenticate,
  authorize(UserRole.EMPLOYER, UserRole.ADMIN),
  jobController.deleteJob,
);

// Employer's own jobs
router.get(
  '/me/posted',
  authenticate,
  authorize(UserRole.EMPLOYER, UserRole.ADMIN),
  jobController.getMyJobs,
);

export default router;
