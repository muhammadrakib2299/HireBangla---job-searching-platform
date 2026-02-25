'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { JobSearchBar } from '@/components/jobs/JobSearchBar';
import { JobFilters } from '@/components/jobs/JobFilters';
import { JobList } from '@/components/jobs/JobList';
import { useJobSearch } from '@/hooks/useJobs';
import { SlidersHorizontal, X } from 'lucide-react';

export default function JobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Read filters from URL
  const params: Record<string, any> = {
    q: searchParams.get('q') || undefined,
    division: searchParams.get('division') || undefined,
    category: searchParams.get('category') || undefined,
    jobType: searchParams.get('jobType') || undefined,
    experienceLevel: searchParams.get('experienceLevel') || undefined,
    salaryMin: searchParams.get('salaryMin')
      ? Number(searchParams.get('salaryMin'))
      : undefined,
    salaryMax: searchParams.get('salaryMax')
      ? Number(searchParams.get('salaryMax'))
      : undefined,
    isRemote: searchParams.get('isRemote') === 'true' || undefined,
    sort: (searchParams.get('sort') as 'relevance' | 'date' | 'salary') || 'date',
    page: Number(searchParams.get('page')) || 1,
    limit: 20,
  };

  const { data, isLoading } = useJobSearch(params);

  const updateParams = useCallback(
    (updates: Record<string, unknown>) => {
      const newParams = new URLSearchParams();
      const merged = { ...params, ...updates, page: updates.page || 1 };

      Object.entries(merged).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== false) {
          newParams.set(key, String(value));
        }
      });

      router.push(`/jobs?${newParams.toString()}`);
    },
    [params, router],
  );

  const handleSearch = (query: string, division: string) => {
    updateParams({ q: query || undefined, division: division || undefined });
  };

  const handleFilterChange = (filters: any) => {
    updateParams(filters);
  };

  const handlePageChange = (page: number) => {
    updateParams({ ...params, page });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search Bar */}
      <div className="mb-6">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Find Jobs</h1>
        <JobSearchBar
          initialQuery={params.q}
          initialDivision={params.division}
          onSearch={handleSearch}
        />
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar - Desktop */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              Filters
            </h2>
            <JobFilters filters={params} onChange={handleFilterChange} />
          </div>
        </aside>

        {/* Mobile Filter Button */}
        <button
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg lg:hidden"
          onClick={() => setShowFilters(true)}
        >
          <SlidersHorizontal className="h-5 w-5" />
          Filters
        </button>

        {/* Mobile Filter Drawer */}
        {showFilters && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setShowFilters(false)}
            />
            <div className="fixed inset-y-0 right-0 z-50 w-80 overflow-y-auto bg-white p-6 shadow-xl lg:hidden">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <JobFilters filters={params} onChange={handleFilterChange} />
            </div>
          </>
        )}

        {/* Job List */}
        <div className="flex-1">
          {/* Sort */}
          <div className="mb-4 flex items-center justify-between">
            <div />
            <select
              value={params.sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="date">Newest First</option>
              <option value="relevance">Most Relevant</option>
              <option value="salary">Highest Salary</option>
            </select>
          </div>

          <JobList
            jobs={data?.jobs || []}
            isLoading={isLoading}
            pagination={
              data
                ? { page: data.page, totalPages: data.totalPages, total: data.total }
                : undefined
            }
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
