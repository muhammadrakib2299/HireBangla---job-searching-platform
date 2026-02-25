'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useJobseekerStats, useMyApplications } from '@/hooks/useApplications';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ClipboardList,
  BookmarkCheck,
  CheckCircle,
  Clock,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'secondary'> = {
  applied: 'default',
  viewed: 'secondary',
  shortlisted: 'warning',
  interview: 'warning',
  offered: 'success',
  hired: 'success',
  rejected: 'danger',
  withdrawn: 'secondary',
};

export default function JobseekerDashboard() {
  const { user } = useAuth();
  const { data: statsData } = useJobseekerStats();
  const { data: recentApps } = useMyApplications(1);

  const stats = [
    {
      label: 'Total Applications',
      value: statsData?.total || 0,
      icon: <ClipboardList className="h-5 w-5 text-blue-600" />,
      bg: 'bg-blue-50',
    },
    {
      label: 'Saved Jobs',
      value: statsData?.savedCount || 0,
      icon: <BookmarkCheck className="h-5 w-5 text-green-600" />,
      bg: 'bg-green-50',
    },
    {
      label: 'Shortlisted',
      value: (statsData?.statusCounts?.shortlisted || 0) + (statsData?.statusCounts?.interview || 0),
      icon: <CheckCircle className="h-5 w-5 text-purple-600" />,
      bg: 'bg-purple-50',
    },
    {
      label: 'Pending',
      value: (statsData?.statusCounts?.applied || 0) + (statsData?.statusCounts?.viewed || 0),
      icon: <Clock className="h-5 w-5 text-orange-600" />,
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

      {/* Recent Applications */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Applications
          </h2>
          <Link href="/dashboard/jobseeker/applications">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {!recentApps?.applications?.length ? (
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-gray-300" />
              <h3 className="mt-3 text-lg font-medium text-gray-900">
                No applications yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Start searching and applying for jobs to see your activity here.
              </p>
              <Link href="/jobs" className="mt-4">
                <Button>Browse Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 space-y-3">
            {recentApps.applications.slice(0, 5).map((app: any) => (
              <Card key={app._id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      {app.job?.companyLogo ? (
                        <img
                          src={app.job.companyLogo}
                          alt=""
                          className="h-8 w-8 rounded-lg object-contain"
                        />
                      ) : (
                        <Building2 className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/jobs/${app.job?.slug}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {app.job?.title || 'Job Unavailable'}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {app.job?.companyName} &middot;{' '}
                        {formatDistanceToNow(new Date(app.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusColors[app.status] || 'default'}>
                    {app.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
