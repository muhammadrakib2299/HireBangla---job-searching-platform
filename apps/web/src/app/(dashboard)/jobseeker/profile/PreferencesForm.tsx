'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { JobType } from '@job-platform/shared-types';
import { JOB_CATEGORIES } from '@job-platform/shared-constants';
import type { IUser } from '@job-platform/shared-types';

const preferencesSchema = z.object({
  preferredJobTypes: z.array(z.string()),
  preferredCategories: z.array(z.string()),
  salaryMin: z.coerce.number().min(0).optional().or(z.literal(0)),
  salaryMax: z.coerce.number().min(0).optional().or(z.literal(0)),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

const JOB_TYPE_OPTIONS = Object.values(JobType).map((v) => ({
  label: v.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  value: v,
}));

interface PreferencesFormProps {
  user: IUser;
  onSave: (data: {
    preferredJobTypes: string[];
    preferredCategories: string[];
    expectedSalary: { min?: number; max?: number; currency: string };
  }) => Promise<void>;
  isSaving: boolean;
}

export default function PreferencesForm({ user, onSave, isSaving }: PreferencesFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      preferredJobTypes: user.preferredJobTypes || [],
      preferredCategories: user.preferredCategories || [],
      salaryMin: user.expectedSalary?.min || 0,
      salaryMax: user.expectedSalary?.max || 0,
    },
  });

  const onSubmit = async (data: PreferencesFormData) => {
    await onSave({
      preferredJobTypes: data.preferredJobTypes,
      preferredCategories: data.preferredCategories,
      expectedSalary: {
        min: data.salaryMin || undefined,
        max: data.salaryMax || undefined,
        currency: 'BDT',
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Preferred Job Types
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {JOB_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm hover:bg-gray-50"
            >
              <input
                type="checkbox"
                value={option.value}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                {...register('preferredJobTypes')}
              />
              {option.label}
            </label>
          ))}
        </div>
        {errors.preferredJobTypes && (
          <p className="mt-1 text-sm text-red-500">{errors.preferredJobTypes.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Preferred Categories
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {JOB_CATEGORIES.map((cat) => (
            <label
              key={cat.slug}
              className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm hover:bg-gray-50"
            >
              <input
                type="checkbox"
                value={cat.name}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                {...register('preferredCategories')}
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Expected Salary (BDT)</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="salaryMin"
            label="Minimum"
            type="number"
            placeholder="e.g. 30000"
            error={errors.salaryMin?.message}
            {...register('salaryMin')}
          />
          <Input
            id="salaryMax"
            label="Maximum"
            type="number"
            placeholder="e.g. 60000"
            error={errors.salaryMax?.message}
            {...register('salaryMax')}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSaving}>
          Save Preferences
        </Button>
      </div>
    </form>
  );
}
