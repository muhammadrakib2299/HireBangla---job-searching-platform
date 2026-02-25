import { Request, Response, NextFunction } from 'express';
import * as applicationService from '../services/application.service.js';

export async function applyToJob(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const applicantId = req.user!._id.toString();
    const application = await applicationService.applyToJob(req.body, applicantId);
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyApplications(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const applicantId = req.user!._id.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const result = await applicationService.getMyApplications(
      applicantId,
      page,
      limit,
      status,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getJobApplications(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const employerId = req.user!._id.toString();
    const jobId = req.params.jobId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const result = await applicationService.getJobApplications(
      jobId,
      employerId,
      page,
      limit,
      status,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getApplication(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const applicationId = req.params.applicationId as string;
    const application = await applicationService.getApplication(applicationId, userId);
    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
}

export async function updateApplicationStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const employerId = req.user!._id.toString();
    const applicationId = req.params.applicationId as string;
    const application = await applicationService.updateApplicationStatus(
      applicationId,
      req.body,
      employerId,
    );
    res.json({
      success: true,
      message: 'Application status updated',
      data: application,
    });
  } catch (error) {
    next(error);
  }
}

export async function addEmployerNotes(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const employerId = req.user!._id.toString();
    const applicationId = req.params.applicationId as string;
    const application = await applicationService.addEmployerNotes(
      applicationId,
      req.body,
      employerId,
    );
    res.json({
      success: true,
      message: 'Notes updated',
      data: application,
    });
  } catch (error) {
    next(error);
  }
}

export async function withdrawApplication(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const applicantId = req.user!._id.toString();
    const applicationId = req.params.applicationId as string;
    const application = await applicationService.withdrawApplication(
      applicationId,
      applicantId,
    );
    res.json({
      success: true,
      message: 'Application withdrawn',
      data: application,
    });
  } catch (error) {
    next(error);
  }
}

export async function saveJob(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const jobId = req.params.jobId as string;
    const result = await applicationService.saveJob(jobId, userId);
    res.status(201).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
}

export async function unsaveJob(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const jobId = req.params.jobId as string;
    const result = await applicationService.unsaveJob(jobId, userId);
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
}

export async function getSavedJobs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await applicationService.getSavedJobs(userId, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function isJobSaved(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const jobId = req.params.jobId as string;
    const result = await applicationService.isJobSaved(jobId, userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getEmployerStats(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const employerId = req.user!._id.toString();
    const stats = await applicationService.getEmployerApplicationStats(employerId);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}

export async function getJobseekerStats(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const applicantId = req.user!._id.toString();
    const stats = await applicationService.getJobseekerApplicationStats(applicantId);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}
