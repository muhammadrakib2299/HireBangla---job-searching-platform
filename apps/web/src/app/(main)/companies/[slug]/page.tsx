'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { JobCard } from '@/components/jobs/JobCard';
import { PageSpinner } from '@/components/ui/Spinner';
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  Calendar,
  Users,
  CheckCircle,
  ArrowLeft,
  Briefcase,
} from 'lucide-react';

export default function CompanyDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: company, isLoading } = useQuery({
    queryKey: ['company', slug],
    queryFn: async () => {
      const { data } = await apiClient.get(`/companies/${slug}`);
      return data.data;
    },
    enabled: !!slug,
  });

  const { data: jobs } = useQuery({
    queryKey: ['company', slug, 'jobs'],
    queryFn: async () => {
      const { data } = await apiClient.get('/jobs', {
        params: { q: company?.name, limit: 10 },
      });
      return data.data?.jobs || [];
    },
    enabled: !!company?.name,
  });

  if (isLoading) return <PageSpinner />;

  if (!company) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <h2 className="text-xl font-bold">Company not found</h2>
        <Link href="/companies" className="mt-4">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Back to Companies
          </Button>
        </Link>
      </div>
    );
  }

  const location = [
    company.location?.address,
    company.location?.district,
    company.location?.division,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/companies"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Companies
      </Link>

      {/* Company Header */}
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-16 w-16 rounded-xl object-contain"
                />
              ) : (
                <Building2 className="h-10 w-10 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {company.name}
                </h1>
                {company.isVerified && (
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <p className="mt-1 text-gray-500">{company.industry}</p>

              <div className="mt-4 flex flex-wrap gap-3">
                {company.companySize && (
                  <Badge variant="secondary">
                    <Users className="mr-1 h-3 w-3" />
                    {company.companySize} employees
                  </Badge>
                )}
                {company.founded && (
                  <Badge variant="secondary">
                    <Calendar className="mr-1 h-3 w-3" />
                    Founded {company.founded}
                  </Badge>
                )}
                <Badge variant="default">
                  <Briefcase className="mr-1 h-3 w-3" />
                  {company.activeJobs || 0} active jobs
                </Badge>
              </div>
            </div>
          </div>

          {company.description && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">About</h2>
              <p className="mt-2 text-gray-600">{company.description}</p>
            </div>
          )}

          {/* Contact Info */}
          <div className="mt-6 grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                {location}
              </div>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
            {company.contactEmail && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                {company.contactEmail}
              </div>
            )}
            {company.contactPhone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                {company.contactPhone}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Company Jobs */}
      {jobs && jobs.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Open Positions
          </h2>
          <div className="space-y-3">
            {jobs.map((job: any) => (
              <JobCard key={job._id || job.slug} job={job} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
