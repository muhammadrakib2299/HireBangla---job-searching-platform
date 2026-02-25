import { Request, Response, NextFunction } from 'express';
import * as assessmentService from '../services/assessment.service.js';
import * as matchingService from '../services/matching.service.js';

// ─── Public ──────────────────────────────────────────────────────────────────

export async function listAssessments(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const difficulty = req.query.difficulty as string | undefined;
    const skillName = req.query.skillName as string | undefined;

    const result = await assessmentService.listAssessments(page, limit, difficulty, skillName);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getAssessmentBySlug(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const slug = req.params.slug as string;
    const assessment = await assessmentService.getAssessmentBySlug(slug);
    res.json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
}

// ─── Authenticated (Jobseeker) ───────────────────────────────────────────────

export async function startAssessment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const assessmentId = req.params.assessmentId as string;
    const result = await assessmentService.startAssessment(assessmentId, userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function submitAssessment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const assessmentId = req.params.assessmentId as string;
    const result = await assessmentService.submitAssessment(
      assessmentId,
      userId,
      req.body,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getMyAttempts(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await assessmentService.getMyAttempts(userId, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getAttemptResult(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const attemptId = req.params.attemptId as string;
    const result = await assessmentService.getAttemptResult(attemptId, userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getMyVerifiedSkills(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const skills = await assessmentService.getUserVerifiedSkills(userId);
    res.json({ success: true, data: skills });
  } catch (error) {
    next(error);
  }
}

// ─── Matching / Recommendations ──────────────────────────────────────────────

export async function getRecommendedJobs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await matchingService.getRecommendedJobs(userId, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getJobMatchScore(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const jobId = req.params.jobId as string;
    const result = await matchingService.getJobMatchScore(jobId, userId);
    if (!result) {
      res.status(404).json({ success: false, message: 'Job or user not found' });
      return;
    }
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function createAssessment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const createdBy = req.user!._id.toString();
    const assessment = await assessmentService.createAssessment(req.body, createdBy);
    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAssessment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const assessmentId = req.params.assessmentId as string;
    const assessment = await assessmentService.updateAssessment(
      assessmentId,
      req.body,
    );
    res.json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
}

export async function toggleAssessmentActive(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const assessmentId = req.params.assessmentId as string;
    const assessment = await assessmentService.toggleAssessmentActive(assessmentId);
    res.json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
}
