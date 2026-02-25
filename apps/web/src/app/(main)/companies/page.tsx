'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { INDUSTRIES } from '@job-platform/shared-constants';
import { Building2, MapPin, Briefcase, CheckCircle } from 'lucide-react';

export default function CompaniesPage() {
  const [page, setPage] = useState(1);
  const [industry, setIndustry] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['companies', page, industry],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (industry) params.industry = industry;
      const { data } = await apiClient.get('/companies', { params });
      return data.data;
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
        <p className="mt-1 text-gray-500">
          Explore top employers hiring in Bangladesh
        </p>
      </div>

      {/* Industry Filter */}
      <div className="mb-6">
        <select
          value={industry}
          onChange={(e) => {
            setIndustry(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Industries</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : !data?.companies?.length ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Building2 className="h-16 w-16 text-gray-200" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No companies found
          </h3>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.companies.map((company: any) => (
              <Link key={company._id} href={`/companies/${company.slug}`}>
                <Card className="h-full transition-all hover:border-blue-200 hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="h-10 w-10 rounded-lg object-contain"
                          />
                        ) : (
                          <Building2 className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-semibold text-gray-900">
                            {company.name}
                          </h3>
                          {company.isVerified && (
                            <CheckCircle className="h-4 w-4 flex-shrink-0 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {company.industry}
                        </p>
                      </div>
                    </div>

                    {company.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-gray-500">
                        {company.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
                      {company.location?.division && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {company.location.division}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {company.activeJobs || 0} active jobs
                      </span>
                    </div>

                    {company.companySize && (
                      <Badge variant="secondary" className="mt-3">
                        {company.companySize} employees
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
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
