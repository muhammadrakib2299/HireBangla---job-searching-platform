'use client';

import { useAdminStats } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import {
  Users,
  Briefcase,
  Building2,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  UserPlus,
  Star,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!stats) {
    return <p className="py-20 text-center text-gray-500">Failed to load dashboard data.</p>;
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totals.users.toLocaleString(),
      trend: `+${stats.trends.newUsersThisWeek} this week`,
      icon: <Users className="h-5 w-5 text-blue-600" />,
      bg: 'bg-blue-50',
    },
    {
      label: 'Active Jobs',
      value: stats.totals.activeJobs.toLocaleString(),
      trend: `${stats.totals.jobs.toLocaleString()} total`,
      icon: <Briefcase className="h-5 w-5 text-green-600" />,
      bg: 'bg-green-50',
    },
    {
      label: 'Companies',
      value: stats.totals.companies.toLocaleString(),
      trend: '',
      icon: <Building2 className="h-5 w-5 text-purple-600" />,
      bg: 'bg-purple-50',
    },
    {
      label: 'Applications',
      value: stats.totals.applications.toLocaleString(),
      trend: `+${stats.trends.newApplicationsThisMonth} this month`,
      icon: <ClipboardList className="h-5 w-5 text-orange-600" />,
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Platform overview and management.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
                {stat.trend && (
                  <p className="mt-0.5 text-xs text-green-600">{stat.trend}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert: Pending Approvals */}
      {stats.totals.pendingApprovalJobs > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              <strong>{stats.totals.pendingApprovalJobs}</strong> job(s) pending approval.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Signups Chart */}
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <UserPlus className="h-4 w-4 text-blue-500" />
              New Users (30 days)
            </h2>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stats.charts.dailySignups}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#dbeafe" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Job Postings Chart */}
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <TrendingUp className="h-4 w-4 text-green-500" />
              New Jobs (30 days)
            </h2>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.charts.dailyJobs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Breakdowns Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Users by Role */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-gray-900">Users by Role</h2>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.breakdowns.usersByRole}
                  dataKey="count"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ role, count }: any) => `${role} (${count})`}
                >
                  {stats.breakdowns.usersByRole.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Jobs by Source */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-gray-900">Jobs by Source</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.breakdowns.jobsBySource.map((item: any) => {
                const total = stats.totals.jobs || 1;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={item.source} className="flex items-center gap-2">
                    <span className="w-20 truncate text-xs text-gray-600">{item.source}</span>
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-12 text-right text-xs text-gray-500">{item.count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Signups */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-gray-900">Recent Signups</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentSignups?.map((user: any) => (
                <div key={user._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                      {user.profile?.firstName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.profile?.firstName} {user.profile?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs capitalize text-gray-400">{user.role}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
