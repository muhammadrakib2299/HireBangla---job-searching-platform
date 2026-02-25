import { Router } from 'express';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes will be added here as we build each phase:
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/jobs', jobRoutes);
// router.use('/companies', companyRoutes);
// router.use('/applications', applicationRoutes);
// router.use('/resumes', resumeRoutes);
// router.use('/assessments', assessmentRoutes);
// router.use('/admin', adminRoutes);
// router.use('/uploads', uploadRoutes);
// router.use('/scrapers', scraperRoutes);

export default router;
