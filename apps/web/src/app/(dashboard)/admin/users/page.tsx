'use client';

import { useState } from 'react';
import { useAdminUsers, useToggleUserActive, useChangeUserRole } from '@/hooks/useAdmin';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { ShieldCheck, ShieldOff, UserCog } from 'lucide-react';

const roleColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'secondary'> = {
  jobseeker: 'default',
  employer: 'warning',
  admin: 'danger',
};

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const { data, isLoading } = useAdminUsers(page, {
    role: roleFilter || undefined,
    search: search || undefined,
    isActive: activeFilter || undefined,
  });

  const toggleActiveMutation = useToggleUserActive();
  const changeRoleMutation = useChangeUserRole();

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
            {row.profile?.firstName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {row.profile?.firstName} {row.profile?.lastName}
            </p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (row) => (
        <Badge variant={roleColors[row.role]}>{row.role}</Badge>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'danger'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'isEmailVerified',
      header: 'Email',
      render: (row) => (
        <span className={`text-xs ${row.isEmailVerified ? 'text-green-600' : 'text-gray-400'}`}>
          {row.isEmailVerified ? 'Verified' : 'Unverified'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
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
          <button
            onClick={() => toggleActiveMutation.mutate(row._id)}
            className={`rounded p-1.5 transition ${
              row.isActive
                ? 'text-red-500 hover:bg-red-50'
                : 'text-green-500 hover:bg-green-50'
            }`}
            title={row.isActive ? 'Deactivate' : 'Activate'}
          >
            {row.isActive ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
          </button>
          {row.role !== 'admin' && (
            <select
              className="rounded border border-gray-200 px-1.5 py-1 text-xs"
              value={row.role}
              onChange={(e) => changeRoleMutation.mutate({ userId: row._id, role: e.target.value })}
            >
              <option value="jobseeker">Jobseeker</option>
              <option value="employer">Employer</option>
            </select>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all platform users.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Roles</option>
          <option value="jobseeker">Jobseeker</option>
          <option value="employer">Employer</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={activeFilter}
          onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.users || []}
        isLoading={isLoading}
        page={data?.page}
        totalPages={data?.totalPages}
        total={data?.total}
        hasNextPage={data?.hasNextPage}
        hasPrevPage={data?.hasPrevPage}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name or email..."
        emptyMessage="No users found."
        rowKey={(row) => row._id}
      />
    </div>
  );
}
