import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service.js';
import { UserRole } from '@job-platform/shared-types';

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboardStats(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}

// ─── User Management ─────────────────────────────────────────────────────────

export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters = {
      role: req.query.role as string | undefined,
      search: req.query.search as string | undefined,
      isActive: req.query.isActive as string | undefined,
    };

    const result = await adminService.listUsers(page, limit, filters);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getUserDetail(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const user = await adminService.getUserDetail(userId);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function toggleUserActive(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const result = await adminService.toggleUserActive(userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function changeUserRole(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const { role } = req.body;
    const result = await adminService.changeUserRole(userId, role as UserRole);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// ─── Job Management ──────────────────────────────────────────────────────────

export async function listJobsAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters = {
      status: req.query.status as string | undefined,
      source: req.query.source as string | undefined,
      isApproved: req.query.isApproved as string | undefined,
      search: req.query.search as string | undefined,
    };

    const result = await adminService.listJobsAdmin(page, limit, filters);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function approveJob(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const jobId = req.params.jobId as string;
    const job = await adminService.approveJob(jobId);
    res.json({ success: true, message: 'Job approved', data: job });
  } catch (error) {
    next(error);
  }
}

export async function rejectJob(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const jobId = req.params.jobId as string;
    const job = await adminService.rejectJob(jobId);
    res.json({ success: true, message: 'Job rejected', data: job });
  } catch (error) {
    next(error);
  }
}

export async function bulkApproveJobs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { jobIds } = req.body;
    const result = await adminService.bulkApproveJobs(jobIds);
    res.json({ success: true, message: `${result.modifiedCount} jobs approved`, data: result });
  } catch (error) {
    next(error);
  }
}

export async function bulkRejectJobs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { jobIds } = req.body;
    const result = await adminService.bulkRejectJobs(jobIds);
    res.json({ success: true, message: `${result.modifiedCount} jobs rejected`, data: result });
  } catch (error) {
    next(error);
  }
}

export async function toggleJobFeatured(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const jobId = req.params.jobId as string;
    const result = await adminService.toggleJobFeatured(jobId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function deleteJobAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const jobId = req.params.jobId as string;
    await adminService.deleteJobAdmin(jobId);
    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    next(error);
  }
}

// ─── Company Management ──────────────────────────────────────────────────────

export async function listCompaniesAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters = {
      isVerified: req.query.isVerified as string | undefined,
      search: req.query.search as string | undefined,
    };

    const result = await adminService.listCompaniesAdmin(page, limit, filters);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function verifyCompany(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const companyId = req.params.companyId as string;
    const company = await adminService.verifyCompany(companyId);
    res.json({ success: true, message: 'Company verified', data: company });
  } catch (error) {
    next(error);
  }
}

export async function unverifyCompany(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const companyId = req.params.companyId as string;
    const company = await adminService.unverifyCompany(companyId);
    res.json({ success: true, message: 'Company verification removed', data: company });
  } catch (error) {
    next(error);
  }
}

// ─── Platform Settings ───────────────────────────────────────────────────────

export async function getPlatformSettings(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const settings = adminService.getPlatformSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
}

export async function updatePlatformSettings(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const settings = adminService.updatePlatformSettings(req.body);
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
}
