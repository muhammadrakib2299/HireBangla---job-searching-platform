'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useEmployerStats } from '@/hooks/useApplications';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  ClipboardList,
  Briefcase,
  Users,
  ChevronRight,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';

export default function EmployerApplicationsPage() {
  const { data: stats } = useEmployerStats();

  // Get employer's jobs to show application counts per job
  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['employer', 'my-jobs-with-apps'],
    queryFn: async () => {
      const { data } = await apiClient.get('/jobs/me/posted', {
        params: { limit: 50 },
      });
      return data.data;
    },
  });

  const statCards = [
    {
      label: 'Total Applications',
      value: stats?.total || 0,
      icon: <ClipboardList className="h-5 w-5 text-blue-600" />,
      bg: 'bg-blue-50',
    },
    {
      label: 'Shortlisted',
      value: stats?.statusCounts?.shortlisted || 0,
      icon: <Eye className="h-5 w-5 text-yellow-600" />,
      bg: 'bg-yellow-50',
    },
    {
      label: 'Hired',
      value: stats?.statusCounts?.hired || 0,
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      bg: 'bg-green-50',
    },
    {
      label: 'Rejected',
      value: stats?.statusCounts?.rejected || 0,
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      bg: 'bg-red-50',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
      <p className="mt-1 text-sm text-gray-500">
        Review and manage applications across all your job postings
      </p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
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

      {/* Jobs with Applications */}
      <h2 className="mt-8 text-lg font-semibold text-gray-900">
        Applications by Job
      </h2>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : !jobsData?.jobs?.length ? (
        <div className="mt-4 flex flex-col items-center justify-center py-12">
          <Briefcase className="h-16 w-16 text-gray-200" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No jobs posted yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Post a job to start receiving applications.
          </p>
          <Link href="/dashboard/employer/post-job" className="mt-4">
            <Button>Post a Job</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {jobsData.jobs.map((job: any) => (
            <Card key={job._id} className="transition-all hover:shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-gray-900">
                      {job.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {job.applicationCount || 0} applications
                      </span>
                      <Badge
                        variant={
                          job.status === 'active' ? 'success' : 'secondary'
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/employer/applications/${job._id}`}
                  >
                    <Button variant="outline" size="sm">
                      View Applications
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
