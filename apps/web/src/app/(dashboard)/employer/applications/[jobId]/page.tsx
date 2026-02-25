'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  useJobApplications,
  useUpdateApplicationStatus,
  useAddEmployerNotes,
} from '@/hooks/useApplications';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Star,
  MessageSquare,
  ChevronDown,
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

const statusOptions = [
  'viewed',
  'shortlisted',
  'interview',
  'offered',
  'hired',
  'rejected',
];

export default function JobApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [ratingValue, setRatingValue] = useState(0);

  const { data, isLoading } = useJobApplications(
    jobId,
    page,
    statusFilter || undefined,
  );
  const updateStatusMutation = useUpdateApplicationStatus();
  const addNotesMutation = useAddEmployerNotes();

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    updateStatusMutation.mutate({
      applicationId,
      status: newStatus,
    });
  };

  const handleSaveNotes = (applicationId: string) => {
    addNotesMutation.mutate({
      applicationId,
      notes: noteText,
      rating: ratingValue > 0 ? ratingValue : undefined,
    });
    setExpandedId(null);
    setNoteText('');
    setRatingValue(0);
  };

  const statusFilters = [
    { value: '', label: 'All' },
    ...statusOptions.map((s) => ({ value: s, label: statusLabels[s] })),
  ];

  return (
    <div>
      <Link
        href="/dashboard/employer/applications"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to All Applications
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">
        Applications
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {data?.total || 0} total applications for this job
      </p>

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
          <User className="h-16 w-16 text-gray-200" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No applications yet
          </h3>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {data.applications.map((app: any) => {
              const applicant = app.applicant;
              const isExpanded = expandedId === app._id;

              return (
                <Card key={app._id} className="overflow-hidden">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                          {applicant?.profile?.avatar ? (
                            <img
                              src={applicant.profile.avatar}
                              alt=""
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {applicant?.profile?.firstName}{' '}
                            {applicant?.profile?.lastName}
                          </h3>
                          <p className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="h-3.5 w-3.5" />
                            {applicant?.email}
                          </p>
                          <p className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-3.5 w-3.5" />
                            Applied{' '}
                            {formatDistanceToNow(new Date(app.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={statusColors[app.status] || 'default'}
                        >
                          {statusLabels[app.status] || app.status}
                        </Badge>

                        {/* Status dropdown */}
                        <div className="relative">
                          <select
                            value={app.status}
                            onChange={(e) =>
                              handleStatusChange(app._id, e.target.value)
                            }
                            className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none"
                          >
                            <option value={app.status} disabled>
                              Change Status
                            </option>
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>
                                {statusLabels[s]}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Cover Letter Preview */}
                    {app.coverLetter && (
                      <div className="mt-3 rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">
                          Cover Letter
                        </p>
                        <p className="mt-1 line-clamp-3 text-sm text-gray-700">
                          {app.coverLetter}
                        </p>
                      </div>
                    )}

                    {/* Rating display */}
                    {app.rating && (
                      <div className="mt-2 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < app.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Notes toggle */}
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedId(null);
                          } else {
                            setExpandedId(app._id);
                            setNoteText(app.employerNotes || '');
                            setRatingValue(app.rating || 0);
                          }
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                        {isExpanded ? 'Hide Notes' : 'Add Notes'}
                      </Button>
                    </div>

                    {/* Expanded Notes Section */}
                    {isExpanded && (
                      <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Rating
                          </label>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setRatingValue(i + 1)}
                                className="p-0.5"
                              >
                                <Star
                                  className={`h-5 w-5 ${
                                    i < ratingValue
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300 hover:text-yellow-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Notes
                          </label>
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                            rows={3}
                            placeholder="Add private notes about this applicant..."
                            maxLength={2000}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpandedId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveNotes(app._id)}
                            isLoading={addNotesMutation.isPending}
                          >
                            Save Notes
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
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
