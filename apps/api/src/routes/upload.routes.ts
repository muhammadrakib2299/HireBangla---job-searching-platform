import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller.js';
import { uploadImage, uploadResume } from '../middleware/upload.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

router.post('/image', uploadImage, uploadController.uploadImage);
router.post('/resume', uploadResume, uploadController.uploadResumeFile);

export default router;
