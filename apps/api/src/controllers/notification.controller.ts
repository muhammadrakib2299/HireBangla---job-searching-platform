import { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notification.service.js';

export async function getNotifications(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await notificationService.getUserNotifications(userId, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const notificationId = req.params.notificationId as string;
    await notificationService.markAsRead(notificationId, userId);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    await notificationService.markAllAsRead(userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
}

export async function getUnreadCount(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const result = await notificationService.getUnreadCount(userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function deleteNotification(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!._id.toString();
    const notificationId = req.params.notificationId as string;
    await notificationService.deleteNotification(notificationId, userId);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
}
