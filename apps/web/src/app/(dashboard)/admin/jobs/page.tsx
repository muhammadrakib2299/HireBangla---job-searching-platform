'use client';

import { useState } from 'react';
import {
  useAdminJobs,
  useApproveJob,
  useRejectJob,
  useBulkApproveJobs,
  useBulkRejectJobs,
  useToggleJobFeatured,
  useDeleteJobAdmin,
} from '@/hooks/useAdmin';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { Check, X, Star, Trash2, ExternalLink } from 'lucide-react';

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'secondary'> = {
  active: 'success',
  draft: 'secondary',
  paused: 'warning',
  expired: 'danger',
  closed: 'danger',
};

export default function AdminJobsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [approvedFilter, setApprovedFilter] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const { data, isLoading } = useAdminJobs(page, {
    status: statusFilter || undefined,
    source: sourceFilter || undefined,
    isApproved: approvedFilter || undefined,
    search: search || undefined,
  });

  const approveMutation = useApproveJob();
  const rejectMutation = useRejectJob();
  const bulkApproveMutation = useBulkApproveJobs();
  const bulkRejectMutation = useBulkRejectJobs();
  const toggleFeaturedMutation = useToggleJobFeatured();
  const deleteMutation = useDeleteJobAdmin();

  const handleBulkApprove = () => {
    if (selectedRows.size === 0) return;
    bulkApproveMutation.mutate(Array.from(selectedRows), {
      onSuccess: () => setSelectedRows(new Set()),
    });
  };

  const handleBulkReject = () => {
    if (selectedRows.size === 0) return;
    bulkRejectMutation.mutate(Array.from(selectedRows), {
      onSuccess: () => setSelectedRows(new Set()),
    });
  };

  const columns: Column<any>[] = [
    {
      key: 'title',
      header: 'Job',
      render: (row) => (
        <div>
          <p className="max-w-[250px] truncate font-medium text-gray-900">{row.title}</p>
          <p className="text-xs text-gray-500">{row.companyName}</p>
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      sortable: true,
      render: (row) => (
        <Badge variant={row.source === 'original' ? 'default' : 'secondary'}>
          {row.source}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <Badge variant={statusColors[row.status]}>{row.status}</Badge>
      ),
    },
    {
      key: 'isApproved',
      header: 'Approved',
      render: (row) => (
        <span className={row.isApproved ? 'text-green-600' : 'text-red-500'}>
          {row.isApproved ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'applicationCount',
      header: 'Apps',
      sortable: true,
      render: (row) => (
        <span className="text-sm text-gray-600">{row.applicationCount || 0}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Posted',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          {!row.isApproved && (
            <button
              onClick={() => approveMutation.mutate(row._id)}
              className="rounded p-1.5 text-green-500 hover:bg-green-50"
              title="Approve"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          {row.isApproved && (
            <button
              onClick={() => rejectMutation.mutate(row._id)}
              className="rounded p-1.5 text-red-500 hover:bg-red-50"
              title="Reject"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => toggleFeaturedMutation.mutate(row._id)}
            className={`rounded p-1.5 transition ${
              row.isFeatured ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'
            } hover:bg-yellow-50`}
            title={row.isFeatured ? 'Remove featured' : 'Mark featured'}
          >
            <Star className="h-4 w-4" fill={row.isFeatured ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this job and all its applications?')) {
                deleteMutation.mutate(row._id);
              }
            }}
            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Moderate, approve, and manage all job listings.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="paused">Paused</option>
          <option value="expired">Expired</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Sources</option>
          <option value="original">Direct Post</option>
          <option value="bdjobs">BDJobs</option>
          <option value="careerjet">CareerJet</option>
          <option value="shomvob">Shomvob</option>
          <option value="unjobs">UNJobs</option>
          <option value="impactpool">Impactpool</option>
          <option value="nextjobz">NextJobz</option>
          <option value="skilljobs">SkillJobs</option>
        </select>
        <select
          value={approvedFilter}
          onChange={(e) => { setApprovedFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Approval</option>
          <option value="true">Approved</option>
          <option value="false">Pending</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.jobs || []}
        isLoading={isLoading}
        page={data?.page}
        totalPages={data?.totalPages}
        total={data?.total}
        hasNextPage={data?.hasNextPage}
        hasPrevPage={data?.hasPrevPage}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search jobs or companies..."
        emptyMessage="No jobs found."
        rowKey={(row) => row._id}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        actions={
          selectedRows.size > 0 ? (
            <>
              <Button
                size="sm"
                onClick={handleBulkApprove}
                isLoading={bulkApproveMutation.isPending}
              >
                <Check className="h-4 w-4" />
                Approve ({selectedRows.size})
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkReject}
                isLoading={bulkRejectMutation.isPending}
              >
                <X className="h-4 w-4" />
                Reject ({selectedRows.size})
              </Button>
            </>
          ) : undefined
        }
      />
    </div>
  );
}
