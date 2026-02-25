import { Router } from 'express';
import * as companyController from '../controllers/company.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { cacheResponse } from '../middleware/cache.middleware.js';
import { UserRole } from '@job-platform/shared-types';

const router = Router();

// Public routes (cached)
router.get('/', cacheResponse(60), companyController.listCompanies);
router.get('/:slug', cacheResponse(120), companyController.getCompanyBySlug);

// Protected routes (employer only)
router.post(
  '/',
  authenticate,
  authorize(UserRole.EMPLOYER),
  companyController.createCompany,
);

router.put(
  '/:companyId',
  authenticate,
  authorize(UserRole.EMPLOYER),
  companyController.updateCompany,
);

// Get own company
router.get(
  '/me/profile',
  authenticate,
  authorize(UserRole.EMPLOYER),
  companyController.getMyCompany,
);

export default router;
