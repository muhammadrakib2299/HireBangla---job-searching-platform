'use client';

import { Card, CardContent } from '@/components/ui/Card';
import {
  Users,
  Briefcase,
  Building2,
  BarChart3,
} from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    {
      label: 'Total Users',
      value: '0',
      icon: <Users className="h-5 w-5 text-blue-600" />,
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Jobs',
      value: '0',
      icon: <Briefcase className="h-5 w-5 text-green-600" />,
      bg: 'bg-green-50',
    },
    {
      label: 'Companies',
      value: '0',
      icon: <Building2 className="h-5 w-5 text-purple-600" />,
      bg: 'bg-purple-50',
    },
    {
      label: 'Applications',
      value: '0',
      icon: <BarChart3 className="h-5 w-5 text-orange-600" />,
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Platform overview and management.
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
    </div>
  );
}
