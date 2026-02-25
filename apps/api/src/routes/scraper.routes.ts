import { Router } from 'express';
import * as scraperController from '../controllers/scraper.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { UserRole } from '@job-platform/shared-types';

const router = Router();

// All scraper routes require admin authentication
router.use(authenticate, authorize(UserRole.ADMIN));

// Get scraper status overview (all sources)
router.get('/status', scraperController.getScraperStatus);

// Get scraper stats (last 7 days)
router.get('/stats', scraperController.getScraperStats);

// Get scraper logs (paginated, filterable by source)
router.get('/logs', scraperController.getScraperLogs);

// Trigger all scrapers manually
router.post('/trigger-all', scraperController.triggerAllScrapersManual);

// Trigger a specific scraper
router.post('/trigger/:source', scraperController.triggerScraperManual);

export default router;
