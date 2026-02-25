import { Request, Response, NextFunction } from 'express';
import * as jobService from '../services/job.service.js';

export async function searchJobs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await jobService.searchJobs(req.query as any);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getFeaturedJobs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 6;
    const jobs = await jobService.getFeaturedJobs(limit);
    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
}

export async function getRecentJobs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const jobs = await jobService.getRecentJobs(limit);
    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const categories = await jobService.getCategoriesWithCounts();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

export async function getJobBySlug(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const slug = req.params.slug as string;
    const job = await jobService.getJobBySlug(slug);

    // Increment view count asynchronously
    jobService.incrementViewCount(job._id.toString());

    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
}

export async function getSimilarJobs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const slug = req.params.slug as string;
    const job = await jobService.getJobBySlug(slug);
    const similar = await jobService.getSimilarJobs(job._id.toString());
    res.json({ success: true, data: similar });
  } catch (error) {
    next(error);
  }
}

export async function createJob(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const companyId = req.user!.company?.toString();
    const job = await jobService.createJob(req.body, userId, companyId);
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateJob(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const jobId = req.params.jobId as string;
    const job = await jobService.updateJob(jobId, req.body, userId);
    res.json({
      success: true,
      message: 'Job updated successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteJob(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const jobId = req.params.jobId as string;
    const result = await jobService.deleteJob(jobId, userId);
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
}

export async function getMyJobs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await jobService.getEmployerJobs(userId, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
