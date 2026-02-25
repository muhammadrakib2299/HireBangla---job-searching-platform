'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createJobSchema,
  type CreateJobInput,
} from '@job-platform/shared-validators';
import { JOB_CATEGORIES } from '@job-platform/shared-constants';
import { DIVISIONS } from '@job-platform/shared-constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function JobPostForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      jobType: 'full-time',
      applicationMethod: 'internal',
      vacancies: 1,
      location: { isRemote: false },
      salary: { currency: 'BDT', isNegotiable: false, period: 'monthly' },
    },
  });

  const selectedCategory = watch('category');
  const selectedDivision = watch('location.division');
  const applicationMethod = watch('applicationMethod');

  const selectedCategoryObj = JOB_CATEGORIES.find(
    (c) => c.name === selectedCategory,
  );
  const selectedDivisionObj = DIVISIONS.find(
    (d) => d.name === selectedDivision,
  );

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      const newSkills = [...skills, trimmed];
      setSkills(newSkills);
      setValue('skillNames', newSkills);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    const newSkills = skills.filter((s) => s !== skill);
    setSkills(newSkills);
    setValue('skillNames', newSkills);
  };

  const onSubmit = async (data: CreateJobInput) => {
    setIsLoading(true);
    try {
      await apiClient.post('/jobs', { ...data, skillNames: skills });
      toast.success('Job posted successfully!');
      router.push('/dashboard/employer/manage-jobs');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to post job',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Basic Information</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="title"
            label="Job Title *"
            placeholder="e.g. Senior Software Engineer"
            error={errors.title?.message}
            {...register('title')}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              rows={8}
              placeholder="Describe the job role, responsibilities, and what makes this opportunity great..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <Input
            id="shortDescription"
            label="Short Description"
            placeholder="Brief summary (shown in search results)"
            error={errors.shortDescription?.message}
            {...register('shortDescription')}
          />
        </CardContent>
      </Card>

      {/* Classification */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Classification</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                {...register('category')}
              >
                <option value="">Select category</option>
                {JOB_CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            {selectedCategoryObj && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Subcategory
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  {...register('subcategory')}
                >
                  <option value="">Select subcategory</option>
                  {selectedCategoryObj.subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Job Type *
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                {...register('jobType')}
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Experience Level
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                {...register('experienceLevel')}
              >
                <option value="">Any</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>

          <Input
            id="vacancies"
            label="Number of Vacancies"
            type="number"
            min={1}
            error={errors.vacancies?.message}
            {...register('vacancies', { valueAsNumber: true })}
          />
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Location</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="rounded text-blue-600"
              {...register('location.isRemote')}
            />
            <span className="font-medium text-gray-700">
              This is a remote position
            </span>
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Division
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                {...register('location.division')}
              >
                <option value="">Select division</option>
                {DIVISIONS.map((div) => (
                  <option key={div.name} value={div.name}>
                    {div.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedDivisionObj && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  District
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  {...register('location.district')}
                >
                  <option value="">Select district</option>
                  {selectedDivisionObj.districts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <Input
            id="address"
            label="Address"
            placeholder="Street address"
            {...register('location.address')}
          />
        </CardContent>
      </Card>

      {/* Salary */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Salary</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="rounded text-blue-600"
              {...register('salary.isNegotiable')}
            />
            <span className="font-medium text-gray-700">Salary is negotiable</span>
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              id="salaryMin"
              label="Minimum (BDT)"
              type="number"
              placeholder="e.g. 30000"
              {...register('salary.min', { valueAsNumber: true })}
            />
            <Input
              id="salaryMax"
              label="Maximum (BDT)"
              type="number"
              placeholder="e.g. 50000"
              {...register('salary.max', { valueAsNumber: true })}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Period
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                {...register('salary.period')}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Skills</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Type a skill and press Enter"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <Button type="button" variant="outline" onClick={addSkill}>
              Add
            </Button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1 text-sm text-blue-700"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 text-blue-400 hover:text-blue-700"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application & Deadline */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Application Settings</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Application Method
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              {...register('applicationMethod')}
            >
              <option value="internal">Apply on HireBangla</option>
              <option value="external">External URL</option>
              <option value="email">Email</option>
            </select>
          </div>

          {applicationMethod === 'external' && (
            <Input
              id="applicationUrl"
              label="Application URL"
              type="url"
              placeholder="https://..."
              error={errors.applicationUrl?.message}
              {...register('applicationUrl')}
            />
          )}

          {applicationMethod === 'email' && (
            <Input
              id="applicationEmail"
              label="Application Email"
              type="email"
              placeholder="hr@company.com"
              error={errors.applicationEmail?.message}
              {...register('applicationEmail')}
            />
          )}

          <Input
            id="deadline"
            label="Application Deadline"
            type="datetime-local"
            error={errors.deadline?.message}
            {...register('deadline')}
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Post Job
        </Button>
      </div>
    </form>
  );
}
