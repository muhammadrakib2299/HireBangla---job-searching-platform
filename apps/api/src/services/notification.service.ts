import { Notification } from '../models/Notification.js';
import { NotificationType } from '@job-platform/shared-types';
import {
  getPaginationOptions,
  getPaginationResult,
  getSkip,
} from '../utils/pagination.js';

// ─── Create Notification ──────────────────────────────────────────────────────

export async function createNotification(input: {
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  return Notification.create(input);
}

// ─── Get User Notifications ───────────────────────────────────────────────────

export async function getUserNotifications(
  userId: string,
  page?: number,
  limit?: number,
) {
  const pagination = getPaginationOptions(page, limit);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(getSkip(pagination))
      .limit(pagination.limit)
      .lean(),
    Notification.countDocuments({ user: userId }),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return {
    notifications,
    unreadCount,
    ...getPaginationResult(total, pagination),
  };
}

// ─── Mark as Read ─────────────────────────────────────────────────────────────

export async function markAsRead(notificationId: string, userId: string) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true },
  );
  return notification;
}

// ─── Mark All as Read ─────────────────────────────────────────────────────────

export async function markAllAsRead(userId: string) {
  await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true },
  );
  return { message: 'All notifications marked as read' };
}

// ─── Get Unread Count ─────────────────────────────────────────────────────────

export async function getUnreadCount(userId: string) {
  const count = await Notification.countDocuments({
    user: userId,
    isRead: false,
  });
  return { count };
}

// ─── Delete Notification ──────────────────────────────────────────────────────

export async function deleteNotification(
  notificationId: string,
  userId: string,
) {
  await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId,
  });
  return { message: 'Notification deleted' };
}
