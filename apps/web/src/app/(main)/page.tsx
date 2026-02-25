'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { JobCard } from '@/components/jobs/JobCard';
import { JobSearchBar } from '@/components/jobs/JobSearchBar';
import { useRecentJobs } from '@/hooks/useJobs';
import { JOB_CATEGORIES } from '@job-platform/shared-constants';
import {
  Search,
  Briefcase,
  Building2,
  Users,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { data: recentJobs } = useRecentJobs(6);

  const handleSearch = (query: string, division: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (division) params.set('division', division);
    router.push(`/jobs?${params.toString()}`);
  };

  // Show first 8 categories
  const featuredCategories = JOB_CATEGORIES.slice(0, 8);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Find Your Dream Job in{' '}
            <span className="text-blue-600">Bangladesh</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Search thousands of jobs from top employers, NGOs, and international
            organizations. Your next career move starts here.
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-10 max-w-3xl">
            <JobSearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-100 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
              <Briefcase className="h-7 w-7 text-blue-600" />
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900">1,000+</p>
            <p className="mt-1 text-sm text-gray-500">Jobs Available</p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-green-100">
              <Building2 className="h-7 w-7 text-green-600" />
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900">500+</p>
            <p className="mt-1 text-sm text-gray-500">Companies</p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100">
              <Users className="h-7 w-7 text-purple-600" />
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900">10,000+</p>
            <p className="mt-1 text-sm text-gray-500">Job Seekers</p>
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Browse by Category
            </h2>
            <Link
              href="/jobs"
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {featuredCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/jobs?category=${encodeURIComponent(cat.name)}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {cat.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {cat.subcategories.length} subcategories
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Jobs */}
      {recentJobs && recentJobs.length > 0 && (
        <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Jobs
              </h2>
              <Link
                href="/jobs"
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {recentJobs.map((job: any) => (
                <JobCard key={job._id || job.slug} job={job} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Create your free account and start exploring opportunities today.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg">
                <Search className="h-5 w-5" />
                Find Jobs
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg">
                <Briefcase className="h-5 w-5" />
                Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
