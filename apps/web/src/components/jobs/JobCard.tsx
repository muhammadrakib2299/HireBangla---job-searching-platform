import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import {
  MapPin,
  Clock,
  Banknote,
  Building2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: {
    slug: string;
    title: string;
    companyName: string;
    companyLogo?: string;
    jobType: string;
    experienceLevel?: string;
    location: {
      district?: string;
      division?: string;
      isRemote?: boolean;
    };
    salary?: {
      min?: number;
      max?: number;
      currency?: string;
      isNegotiable?: boolean;
    };
    source?: string;
    deadline?: string;
    publishedAt?: string;
    skillNames?: string[];
    isFeatured?: boolean;
  };
  className?: string;
}

const jobTypeLabels: Record<string, string> = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
  freelance: 'Freelance',
  remote: 'Remote',
};

function formatSalary(salary?: JobCardProps['job']['salary']) {
  if (!salary) return null;
  if (salary.isNegotiable) return 'Negotiable';
  if (!salary.min && !salary.max) return null;

  const currency = salary.currency || 'BDT';
  const fmt = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n.toString();

  if (salary.min && salary.max) {
    return `${currency} ${fmt(salary.min)} - ${fmt(salary.max)}`;
  }
  if (salary.min) return `${currency} ${fmt(salary.min)}+`;
  if (salary.max) return `Up to ${currency} ${fmt(salary.max)}`;
  return null;
}

export function JobCard({ job, className }: JobCardProps) {
  const salaryText = formatSalary(job.salary);
  const locationText = [job.location.district, job.location.division]
    .filter(Boolean)
    .join(', ');

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className={cn(
        'group block rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-md',
        job.isFeatured && 'border-blue-200 bg-blue-50/30',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-gray-900 group-hover:text-blue-600">
            {job.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{job.companyName}</span>
          </div>
        </div>

        {job.isFeatured && (
          <Badge variant="warning" className="flex-shrink-0">
            Featured
          </Badge>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="default">
          {jobTypeLabels[job.jobType] || job.jobType}
        </Badge>
        {job.experienceLevel && (
          <Badge variant="secondary" className="capitalize">
            {job.experienceLevel}
          </Badge>
        )}
        {job.source && job.source !== 'original' && (
          <Badge variant="secondary">
            <ExternalLink className="mr-1 h-3 w-3" />
            {job.source}
          </Badge>
        )}
      </div>

      <div className="mt-3 space-y-1.5">
        {locationText && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>
              {locationText}
              {job.location.isRemote && ' (Remote)'}
            </span>
          </div>
        )}
        {salaryText && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Banknote className="h-4 w-4 flex-shrink-0" />
            <span>{salaryText}</span>
          </div>
        )}
      </div>

      {job.skillNames && job.skillNames.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {job.skillNames.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            >
              {skill}
            </span>
          ))}
          {job.skillNames.length > 4 && (
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
              +{job.skillNames.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {job.publishedAt
            ? formatDistanceToNow(new Date(job.publishedAt), {
                addSuffix: true,
              })
            : 'Recently'}
        </div>
        {job.deadline && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Deadline: {new Date(job.deadline).toLocaleDateString()}
          </div>
        )}
      </div>
    </Link>
  );
}
