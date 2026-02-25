import { Request, Response, NextFunction } from 'express';
import * as companyService from '../services/company.service.js';

export async function createCompany(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const company = await companyService.createCompany(req.body, userId);
    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCompany(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const companyId = req.params.companyId as string;
    const company = await companyService.updateCompany(
      companyId,
      req.body,
      userId,
    );
    res.json({
      success: true,
      message: 'Company updated successfully',
      data: company,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCompanyBySlug(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const slug = req.params.slug as string;
    const company = await companyService.getCompanyBySlug(slug);
    res.json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
}

export async function listCompanies(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const industry = req.query.industry as string | undefined;
    const result = await companyService.listCompanies(page, limit, industry);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getMyCompany(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const company = await companyService.getMyCompany(userId);
    res.json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
}
