import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import jobRoutes from './job.routes.js';
import companyRoutes from './company.routes.js';
import uploadRoutes from './upload.routes.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Phase 1: Auth + Users
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Phase 2: Jobs + Companies + Uploads
router.use('/jobs', jobRoutes);
router.use('/companies', companyRoutes);
router.use('/uploads', uploadRoutes);

// Future phases:
// router.use('/applications', applicationRoutes);
// router.use('/resumes', resumeRoutes);
// router.use('/assessments', assessmentRoutes);
// router.use('/admin', adminRoutes);
// router.use('/scrapers', scraperRoutes);

export default router;
