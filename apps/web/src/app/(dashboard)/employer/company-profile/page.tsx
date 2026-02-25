'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { INDUSTRIES } from '@job-platform/shared-constants';
import { DIVISIONS } from '@job-platform/shared-constants';
import { toast } from 'sonner';
import { PageSpinner } from '@/components/ui/Spinner';
import { Building2 } from 'lucide-react';

export default function CompanyProfilePage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const { data: company, isLoading } = useQuery({
    queryKey: ['employer', 'company'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/companies/me/profile');
        return data.data;
      } catch {
        return null;
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: Record<string, unknown>) => {
      const { data } = await apiClient.post('/companies', formData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer', 'company'] });
      toast.success('Company profile created!');
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create company');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data: formData,
    }: {
      id: string;
      data: Record<string, unknown>;
    }) => {
      const { data } = await apiClient.put(`/companies/${id}`, formData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer', 'company'] });
      toast.success('Company profile updated!');
    },
    onError: () => toast.error('Failed to update company'),
  });

  if (isLoading) return <PageSpinner />;

  if (!company && !isCreating) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-16 w-16 text-gray-200" />
        <h2 className="mt-4 text-xl font-bold text-gray-900">
          No Company Profile
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Create your company profile to start posting jobs.
        </p>
        <Button className="mt-4" onClick={() => setIsCreating(true)}>
          Create Company Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {company ? 'Company Profile' : 'Create Company Profile'}
      </h1>

      <CompanyForm
        initialData={company}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onSubmit={(formData) => {
          if (company) {
            updateMutation.mutate({ id: company._id, data: formData });
          } else {
            createMutation.mutate(formData);
          }
        }}
      />
    </div>
  );
}

function CompanyForm({
  initialData,
  isLoading,
  onSubmit,
}: {
  initialData?: any;
  isLoading: boolean;
  onSubmit: (data: Record<string, unknown>) => void;
}) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    industry: initialData?.industry || '',
    description: initialData?.description || '',
    companySize: initialData?.companySize || '',
    founded: initialData?.founded || '',
    website: initialData?.website || '',
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
    division: initialData?.location?.division || '',
    district: initialData?.location?.district || '',
    address: initialData?.location?.address || '',
  });

  const selectedDivisionObj = DIVISIONS.find((d) => d.name === form.division);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      industry: form.industry,
      description: form.description,
      companySize: form.companySize || undefined,
      founded: form.founded ? Number(form.founded) : undefined,
      website: form.website || undefined,
      contactEmail: form.contactEmail || undefined,
      contactPhone: form.contactPhone || undefined,
      location: {
        division: form.division || undefined,
        district: form.district || undefined,
        address: form.address || undefined,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Basic Info</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Company Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Industry *
            </label>
            <select
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Tell candidates about your company..."
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Company Size
              </label>
              <select
                value={form.companySize}
                onChange={(e) =>
                  setForm({ ...form, companySize: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select size</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="501-1000">501-1000</option>
                <option value="1000+">1000+</option>
              </select>
            </div>
            <Input
              label="Founded Year"
              type="number"
              value={form.founded}
              onChange={(e) => setForm({ ...form, founded: e.target.value })}
              placeholder="e.g. 2010"
            />
          </div>
          <Input
            label="Website"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Location & Contact</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Division
              </label>
              <select
                value={form.division}
                onChange={(e) =>
                  setForm({ ...form, division: e.target.value, district: '' })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
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
                  value={form.district}
                  onChange={(e) =>
                    setForm({ ...form, district: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
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
            label="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Street address"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Contact Email"
              type="email"
              value={form.contactEmail}
              onChange={(e) =>
                setForm({ ...form, contactEmail: e.target.value })
              }
            />
            <Input
              label="Contact Phone"
              value={form.contactPhone}
              onChange={(e) =>
                setForm({ ...form, contactPhone: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Company' : 'Create Company'}
        </Button>
      </div>
    </form>
  );
}
