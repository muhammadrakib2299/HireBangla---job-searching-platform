'use client';

import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Briefcase,
  ClipboardList,
  Users,
  Eye,
} from 'lucide-react';

export default function EmployerDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      label: 'Active Jobs',
      value: '0',
      icon: <Briefcase className="h-5 w-5 text-blue-600" />,
      bg: 'bg-blue-50',
    },
    {
      label: 'Applications',
      value: '0',
      icon: <ClipboardList className="h-5 w-5 text-green-600" />,
      bg: 'bg-green-50',
    },
    {
      label: 'Total Candidates',
      value: '0',
      icon: <Users className="h-5 w-5 text-purple-600" />,
      bg: 'bg-purple-50',
    },
    {
      label: 'Job Views',
      value: '0',
      icon: <Eye className="h-5 w-5 text-orange-600" />,
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

      <div className="mt-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-gray-300" />
            <h3 className="mt-3 text-lg font-medium text-gray-900">
              No jobs posted yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Post your first job to start receiving applications.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
