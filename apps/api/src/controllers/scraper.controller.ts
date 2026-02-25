import { Request, Response, NextFunction } from 'express';
import { ScraperLog } from '../models/ScraperLog.js';
import { triggerScraper, triggerAllScrapers, SCRAPER_SOURCES } from '../jobs/queues.js';
import { getAvailableSources } from '../scrapers/index.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  getPaginationOptions,
  getPaginationResult,
  getSkip,
} from '../utils/pagination.js';

// ─── Get Scraper Status Overview ──────────────────────────────────────────────

export async function getScraperStatus(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sources = getAvailableSources();

    // Get the latest log for each source
    const statuses = await Promise.all(
      sources.map(async (source) => {
        const lastLog = await ScraperLog.findOne({ source })
          .sort({ startedAt: -1 })
          .lean();

        const lastSuccessLog = await ScraperLog.findOne({
          source,
          status: 'completed',
        })
          .sort({ startedAt: -1 })
          .lean();

        // Get stats from last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentLogs = await ScraperLog.find({
          source,
          startedAt: { $gte: oneDayAgo },
        }).lean();

        const totalFetched = recentLogs.reduce(
          (sum, l) => sum + (l.stats?.fetched || 0),
          0,
        );
        const totalNew = recentLogs.reduce(
          (sum, l) => sum + (l.stats?.new || 0),
          0,
        );

        return {
          source,
          lastRun: lastLog?.startedAt || null,
          lastStatus: lastLog?.status || 'never',
          lastDuration: lastLog?.duration || null,
          lastSuccess: lastSuccessLog?.startedAt || null,
          last24h: {
            runs: recentLogs.length,
            fetched: totalFetched,
            newJobs: totalNew,
          },
          isRunning: lastLog?.status === 'running',
        };
      }),
    );

    res.json({ success: true, data: statuses });
  } catch (error) {
    next(error);
  }
}

// ─── Get Scraper Logs ─────────────────────────────────────────────────────────

export async function getScraperLogs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const source = req.query.source as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const pagination = getPaginationOptions(page, limit);

    const filter: Record<string, unknown> = {};
    if (source) filter.source = source;

    const [logs, total] = await Promise.all([
      ScraperLog.find(filter)
        .sort({ startedAt: -1 })
        .skip(getSkip(pagination))
        .limit(pagination.limit)
        .lean(),
      ScraperLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        ...getPaginationResult(total, pagination),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Trigger Single Scraper ───────────────────────────────────────────────────

export async function triggerScraperManual(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const source = req.params.source as string;

    if (!SCRAPER_SOURCES.includes(source)) {
      throw new AppError(
        `Invalid source: ${source}. Available: ${SCRAPER_SOURCES.join(', ')}`,
        400,
      );
    }

    // Check if already running
    const runningLog = await ScraperLog.findOne({
      source,
      status: 'running',
    });
    if (runningLog) {
      throw new AppError(`${source} scraper is already running`, 409);
    }

    await triggerScraper(source);

    res.json({
      success: true,
      message: `${source} scraper triggered successfully`,
    });
  } catch (error) {
    next(error);
  }
}

// ─── Trigger All Scrapers ─────────────────────────────────────────────────────

export async function triggerAllScrapersManual(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await triggerAllScrapers();

    res.json({
      success: true,
      message: `All scrapers triggered (${SCRAPER_SOURCES.length} sources)`,
    });
  } catch (error) {
    next(error);
  }
}

// ─── Get Scraper Stats ────────────────────────────────────────────────────────

export async function getScraperStats(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const stats = await ScraperLog.aggregate([
      { $match: { startedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: '$source',
          totalRuns: { $sum: 1 },
          successRuns: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          failedRuns: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
          totalFetched: { $sum: '$stats.fetched' },
          totalNew: { $sum: '$stats.new' },
          totalUpdated: { $sum: '$stats.updated' },
          avgDuration: { $avg: '$duration' },
        },
      },
      { $sort: { totalNew: -1 } },
    ]);

    const overall = {
      totalRuns: stats.reduce((s, r) => s + r.totalRuns, 0),
      totalNew: stats.reduce((s, r) => s + r.totalNew, 0),
      totalFetched: stats.reduce((s, r) => s + r.totalFetched, 0),
      successRate:
        stats.length > 0
          ? Math.round(
              (stats.reduce((s, r) => s + r.successRuns, 0) /
                stats.reduce((s, r) => s + r.totalRuns, 0)) *
                100,
            )
          : 0,
    };

    res.json({
      success: true,
      data: { sources: stats, overall },
    });
  } catch (error) {
    next(error);
  }
}
