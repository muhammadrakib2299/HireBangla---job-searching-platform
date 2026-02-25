'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMyApplications, useWithdrawApplication } from '@/hooks/useApplications';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  ClipboardList,
  MapPin,
  Building2,
  Calendar,
  ChevronRight,
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

const statusLabels: Record<string, string> = {
  applied: 'Applied',
  viewed: 'Viewed',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  offered: 'Offered',
  hired: 'Hired',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'applied', label: 'Applied' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'offered', label: 'Offered' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

export default function MyApplicationsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useMyApplications(page, statusFilter || undefined);
  const withdrawMutation = useWithdrawApplication();

  const handleWithdraw = (applicationId: string) => {
    if (confirm('Are you sure you want to withdraw this application?')) {
      withdrawMutation.mutate(applicationId);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage your job applications
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mt-4 flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setStatusFilter(f.value);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : !data?.applications?.length ? (
        <div className="flex flex-col items-center justify-center py-20">
          <ClipboardList className="h-16 w-16 text-gray-200" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No applications found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Start applying for jobs to track them here.
          </p>
          <Link href="/jobs" className="mt-4">
            <Button>Browse Jobs</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {data.applications.map((app: any) => (
              <Card key={app._id} className="transition-all hover:shadow-md">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
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
                        <div className="min-w-0">
                          <Link
                            href={`/jobs/${app.job?.slug}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {app.job?.title || 'Job Unavailable'}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {app.job?.companyName}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        {app.job?.location?.division && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {app.job.location.division}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Applied{' '}
                          {formatDistanceToNow(new Date(app.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={statusColors[app.status] || 'default'}>
                        {statusLabels[app.status] || app.status}
                      </Badge>
                      <div className="flex gap-2">
                        {!['withdrawn', 'hired', 'rejected'].includes(
                          app.status,
                        ) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWithdraw(app._id)}
                            isLoading={withdrawMutation.isPending}
                          >
                            Withdraw
                          </Button>
                        )}
                        <Link href={`/jobs/${app.job?.slug}`}>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="flex items-center px-3 text-sm text-gray-500">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= data.totalPages}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
