'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DIVISIONS } from '@job-platform/shared-constants';
import type { IUser } from '@job-platform/shared-types';

const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().max(20).optional().or(z.literal('')),
  headline: z.string().max(200).optional().or(z.literal('')),
  bio: z.string().max(2000).optional().or(z.literal('')),
  division: z.string().optional().or(z.literal('')),
  district: z.string().optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

interface PersonalInfoFormProps {
  user: IUser;
  onSave: (data: { profile: Record<string, unknown> }) => Promise<void>;
  isSaving: boolean;
}

export default function PersonalInfoForm({ user, onSave, isSaving }: PersonalInfoFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: user.profile.firstName || '',
      lastName: user.profile.lastName || '',
      phone: user.profile.phone || '',
      headline: user.profile.headline || '',
      bio: user.profile.bio || '',
      division: user.profile.location?.division || '',
      district: user.profile.location?.district || '',
      address: user.profile.location?.address || '',
      website: user.profile.website || '',
      linkedin: user.profile.linkedin || '',
      github: user.profile.github || '',
    },
  });

  const selectedDivision = watch('division');
  const districts =
    DIVISIONS.find((d) => d.name === selectedDivision)?.districts || [];

  const onSubmit = async (data: PersonalInfoFormData) => {
    await onSave({
      profile: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
        headline: data.headline || undefined,
        bio: data.bio || undefined,
        location: {
          division: data.division || undefined,
          district: data.district || undefined,
          address: data.address || undefined,
        },
        website: data.website || undefined,
        linkedin: data.linkedin || undefined,
        github: data.github || undefined,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="firstName"
          label="First Name"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          id="lastName"
          label="Last Name"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>

      <Input
        id="phone"
        label="Phone Number"
        placeholder="+880 1XXX-XXXXXX"
        error={errors.phone?.message}
        {...register('phone')}
      />

      <Input
        id="headline"
        label="Professional Headline"
        placeholder="e.g. Full Stack Developer with 3 years experience"
        error={errors.headline?.message}
        {...register('headline')}
      />

      <div className="w-full">
        <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="Tell employers about yourself..."
          {...register('bio')}
        />
        {errors.bio && <p className="mt-1 text-sm text-red-500">{errors.bio.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="w-full">
          <label htmlFor="division" className="mb-1.5 block text-sm font-medium text-gray-700">
            Division
          </label>
          <select
            id="division"
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            {...register('division')}
          >
            <option value="">Select division</option>
            {DIVISIONS.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full">
          <label htmlFor="district" className="mb-1.5 block text-sm font-medium text-gray-700">
            District
          </label>
          <select
            id="district"
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            {...register('district')}
            disabled={!selectedDivision}
          >
            <option value="">Select district</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        id="address"
        label="Address"
        placeholder="Street address"
        error={errors.address?.message}
        {...register('address')}
      />

      <div className="border-t border-gray-200 pt-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Links</h3>
        <div className="space-y-4">
          <Input
            id="website"
            label="Website"
            placeholder="https://yourwebsite.com"
            error={errors.website?.message}
            {...register('website')}
          />
          <Input
            id="linkedin"
            label="LinkedIn"
            placeholder="https://linkedin.com/in/yourprofile"
            error={errors.linkedin?.message}
            {...register('linkedin')}
          />
          <Input
            id="github"
            label="GitHub"
            placeholder="https://github.com/yourusername"
            error={errors.github?.message}
            {...register('github')}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSaving}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
