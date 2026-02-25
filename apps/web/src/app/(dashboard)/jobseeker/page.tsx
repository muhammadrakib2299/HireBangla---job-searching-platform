'use client';

import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent } from '@/components/ui/Card';
import {
  ClipboardList,
  BookmarkCheck,
  Eye,
  TrendingUp,
} from 'lucide-react';

export default function JobseekerDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      label: 'Applications',
      value: '0',
      icon: <ClipboardList className="h-5 w-5 text-blue-600" />,
      bg: 'bg-blue-50',
    },
    {
      label: 'Saved Jobs',
      value: '0',
      icon: <BookmarkCheck className="h-5 w-5 text-green-600" />,
      bg: 'bg-green-50',
    },
    {
      label: 'Profile Views',
      value: '0',
      icon: <Eye className="h-5 w-5 text-purple-600" />,
      bg: 'bg-purple-50',
    },
    {
      label: 'Match Score',
      value: '--',
      icon: <TrendingUp className="h-5 w-5 text-orange-600" />,
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome back, {user?.profile.firstName}!
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Here&apos;s an overview of your job search activity.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-12 w-12 text-gray-300" />
            <h3 className="mt-3 text-lg font-medium text-gray-900">
              No recent activity
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Start searching and applying for jobs to see your activity here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
