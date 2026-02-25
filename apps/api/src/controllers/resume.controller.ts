import { Request, Response, NextFunction } from 'express';
import * as resumeService from '../services/resume.service.js';

export async function createResume(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const resume = await resumeService.createResume(
      req.user!._id.toString(),
      req.body,
    );
    res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      data: resume,
    });
  } catch (error) {
    next(error);
  }
}

export async function listResumes(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await resumeService.listResumes(
      req.user!._id.toString(),
      page,
      limit,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getResume(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const resume = await resumeService.getResume(
      req.params.id,
      req.user!._id.toString(),
    );
    res.json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
}

export async function updateResume(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const resume = await resumeService.updateResume(
      req.params.id,
      req.user!._id.toString(),
      req.body,
    );
    res.json({
      success: true,
      message: 'Resume updated successfully',
      data: resume,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteResume(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await resumeService.deleteResume(
      req.params.id,
      req.user!._id.toString(),
    );
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
}

export async function setDefaultResume(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const resume = await resumeService.setDefaultResume(
      req.params.id,
      req.user!._id.toString(),
    );
    res.json({
      success: true,
      message: 'Default resume updated',
      data: resume,
    });
  } catch (error) {
    next(error);
  }
}
