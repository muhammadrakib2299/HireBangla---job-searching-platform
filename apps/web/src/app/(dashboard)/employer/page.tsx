'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/providers/AuthProvider';
import { useEmployerStats } from '@/hooks/useApplications';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Briefcase,
  ClipboardList,
  CheckCircle,
  Users,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const { data: appStats } = useEmployerStats();
  const { data: jobsData } = useQuery({
    queryKey: ['employer', 'my-jobs-dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get('/jobs/me/posted', {
        params: { limit: 5 },
      });
      return data.data;
    },
  });

  const stats = [
    {
      label: 'Active Jobs',
      value: jobsData?.total || 0,
      icon: <Briefcase className="h-5 w-5 text-blue-600" />,
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Applications',
      value: appStats?.total || 0,
      icon: <ClipboardList className="h-5 w-5 text-green-600" />,
      bg: 'bg-green-50',
    },
    {
      label: 'Shortlisted',
      value: appStats?.statusCounts?.shortlisted || 0,
      icon: <CheckCircle className="h-5 w-5 text-purple-600" />,
      bg: 'bg-purple-50',
    },
    {
      label: 'Hired',
      value: appStats?.statusCounts?.hired || 0,
      icon: <Users className="h-5 w-5 text-orange-600" />,
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome back, {user?.profile.firstName}!
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage your job postings and review applications.
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

      {/* Recent Jobs */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Job Postings
          </h2>
          <div className="flex gap-2">
            <Link href="/dashboard/employer/manage-jobs">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/employer/post-job">
              <Button size="sm">
                <PlusCircle className="h-4 w-4" />
                Post Job
              </Button>
            </Link>
          </div>
        </div>

        {!jobsData?.jobs?.length ? (
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-gray-300" />
              <h3 className="mt-3 text-lg font-medium text-gray-900">
                No jobs posted yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Post your first job to start receiving applications.
              </p>
              <Link href="/dashboard/employer/post-job" className="mt-4">
                <Button>Post a Job</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 space-y-3">
            {jobsData.jobs.map((job: any) => (
              <Card key={job._id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500">
                      {job.applicationCount || 0} applications &middot;{' '}
                      {job.viewCount || 0} views
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        job.status === 'active' ? 'success' : 'secondary'
                      }
                    >
                      {job.status}
                    </Badge>
                    <Link
                      href={`/dashboard/employer/applications/${job._id}`}
                    >
                      <Button variant="outline" size="sm">
                        Applications
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
