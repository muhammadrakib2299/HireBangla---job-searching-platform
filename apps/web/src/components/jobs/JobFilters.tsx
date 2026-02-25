'use client';

import { JOB_CATEGORIES } from '@job-platform/shared-constants';

interface FilterValues {
  category?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  isRemote?: boolean;
  source?: string;
}

interface JobFiltersProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  className?: string;
}

const jobTypes = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'remote', label: 'Remote' },
];

const experienceLevels = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'executive', label: 'Executive' },
];

const salaryRanges = [
  { label: 'Any Salary', min: undefined, max: undefined },
  { label: 'Up to 20k', min: undefined, max: 20000 },
  { label: '20k - 40k', min: 20000, max: 40000 },
  { label: '40k - 70k', min: 40000, max: 70000 },
  { label: '70k - 100k', min: 70000, max: 100000 },
  { label: '100k+', min: 100000, max: undefined },
];

export function JobFilters({ filters, onChange, className }: JobFiltersProps) {
  const update = (partial: Partial<FilterValues>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Category */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Category</h3>
        <select
          value={filters.category || ''}
          onChange={(e) => update({ category: e.target.value || undefined })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All Categories</option>
          {JOB_CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Job Type */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Job Type</h3>
        <div className="space-y-1.5">
          {jobTypes.map((type) => (
            <label
              key={type.value}
              className="flex cursor-pointer items-center gap-2 text-sm text-gray-600"
            >
              <input
                type="radio"
                name="jobType"
                checked={filters.jobType === type.value}
                onChange={() => update({ jobType: type.value })}
                className="text-blue-600 focus:ring-blue-500"
              />
              {type.label}
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-400">
            <input
              type="radio"
              name="jobType"
              checked={!filters.jobType}
              onChange={() => update({ jobType: undefined })}
              className="text-blue-600 focus:ring-blue-500"
            />
            All Types
          </label>
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">
          Experience Level
        </h3>
        <div className="space-y-1.5">
          {experienceLevels.map((level) => (
            <label
              key={level.value}
              className="flex cursor-pointer items-center gap-2 text-sm text-gray-600"
            >
              <input
                type="radio"
                name="experienceLevel"
                checked={filters.experienceLevel === level.value}
                onChange={() => update({ experienceLevel: level.value })}
                className="text-blue-600 focus:ring-blue-500"
              />
              {level.label}
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-400">
            <input
              type="radio"
              name="experienceLevel"
              checked={!filters.experienceLevel}
              onChange={() => update({ experienceLevel: undefined })}
              className="text-blue-600 focus:ring-blue-500"
            />
            All Levels
          </label>
        </div>
      </div>

      {/* Salary Range */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">
          Salary Range (BDT/month)
        </h3>
        <div className="space-y-1.5">
          {salaryRanges.map((range) => (
            <label
              key={range.label}
              className="flex cursor-pointer items-center gap-2 text-sm text-gray-600"
            >
              <input
                type="radio"
                name="salary"
                checked={
                  filters.salaryMin === range.min &&
                  filters.salaryMax === range.max
                }
                onChange={() =>
                  update({ salaryMin: range.min, salaryMax: range.max })
                }
                className="text-blue-600 focus:ring-blue-500"
              />
              {range.label}
            </label>
          ))}
        </div>
      </div>

      {/* Source Filter */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Source</h3>
        <select
          value={filters.source || ''}
          onChange={(e) => update({ source: e.target.value || undefined })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
      </div>

      {/* Remote Toggle */}
      <div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!filters.isRemote}
            onChange={(e) =>
              update({ isRemote: e.target.checked || undefined })
            }
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="font-medium text-gray-700">Remote Only</span>
        </label>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() =>
          onChange({
            category: undefined,
            jobType: undefined,
            experienceLevel: undefined,
            salaryMin: undefined,
            salaryMax: undefined,
            isRemote: undefined,
            source: undefined,
          })
        }
        className="text-sm text-blue-600 hover:text-blue-700"
      >
        Clear all filters
      </button>
    </div>
  );
}
