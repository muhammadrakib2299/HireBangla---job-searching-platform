import { Router } from 'express';
import { apiLimiter, authLimiter } from '../middleware/rateLimiter.middleware.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import jobRoutes from './job.routes.js';
import companyRoutes from './company.routes.js';
import uploadRoutes from './upload.routes.js';
import applicationRoutes from './application.routes.js';
import notificationRoutes from './notification.routes.js';
import scraperRoutes from './scraper.routes.js';
import assessmentRoutes from './assessment.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

// Apply general rate limiter to all routes
router.use(apiLimiter);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Phase 1: Auth + Users (stricter rate limit on auth)
router.use('/auth', authLimiter, authRoutes);
router.use('/users', userRoutes);

// Phase 2: Jobs + Companies + Uploads
router.use('/jobs', jobRoutes);
router.use('/companies', companyRoutes);
router.use('/uploads', uploadRoutes);

// Phase 3: Applications + Notifications
router.use('/applications', applicationRoutes);
router.use('/notifications', notificationRoutes);

// Phase 4: Scrapers (admin only)
router.use('/scrapers', scraperRoutes);

// Phase 5: Assessments + Matching
router.use('/assessments', assessmentRoutes);

// Phase 6: Admin
router.use('/admin', adminRoutes);

export default router;
