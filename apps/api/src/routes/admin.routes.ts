import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { UserRole } from '@job-platform/shared-types';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

// ─── Dashboard ───────────────────────────────────────────────────────────────

router.get('/stats', adminController.getDashboardStats);

// ─── User Management ─────────────────────────────────────────────────────────

router.get('/users', adminController.listUsers);
router.get('/users/:userId', adminController.getUserDetail);
router.patch('/users/:userId/toggle-active', adminController.toggleUserActive);
router.patch('/users/:userId/role', adminController.changeUserRole);

// ─── Job Management ──────────────────────────────────────────────────────────

router.get('/jobs', adminController.listJobsAdmin);
router.patch('/jobs/:jobId/approve', adminController.approveJob);
router.patch('/jobs/:jobId/reject', adminController.rejectJob);
router.patch('/jobs/:jobId/toggle-featured', adminController.toggleJobFeatured);
router.delete('/jobs/:jobId', adminController.deleteJobAdmin);
router.post('/jobs/bulk-approve', adminController.bulkApproveJobs);
router.post('/jobs/bulk-reject', adminController.bulkRejectJobs);

// ─── Company Management ──────────────────────────────────────────────────────

router.get('/companies', adminController.listCompaniesAdmin);
router.patch('/companies/:companyId/verify', adminController.verifyCompany);
router.patch('/companies/:companyId/unverify', adminController.unverifyCompany);

// ─── Platform Settings ───────────────────────────────────────────────────────

router.get('/settings', adminController.getPlatformSettings);
router.put('/settings', adminController.updatePlatformSettings);

export default router;
