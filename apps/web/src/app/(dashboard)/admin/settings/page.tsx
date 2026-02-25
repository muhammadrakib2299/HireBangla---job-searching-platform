'use client';

import { useState, useEffect } from 'react';
import { usePlatformSettings, useUpdatePlatformSettings } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Settings, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = usePlatformSettings();
  const updateMutation = useUpdatePlatformSettings();
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure global platform settings.
        </p>
      </div>

      {/* General */}
      <Card>
        <CardHeader>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Settings className="h-5 w-5 text-gray-500" />
            General
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Site Name</label>
              <input
                type="text"
                value={form.siteName || ''}
                onChange={(e) => setForm((p) => ({ ...p, siteName: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Default Currency</label>
              <select
                value={form.defaultCurrency || 'BDT'}
                onChange={(e) => setForm((p) => ({ ...p, defaultCurrency: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="BDT">BDT (Bangladeshi Taka)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Site Description</label>
            <textarea
              value={form.siteDescription || ''}
              onChange={(e) => setForm((p) => ({ ...p, siteDescription: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Limits */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Limits & Controls</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Max Jobs per Employer
              </label>
              <input
                type="number"
                value={form.maxJobsPerEmployer || 50}
                onChange={(e) => setForm((p) => ({ ...p, maxJobsPerEmployer: parseInt(e.target.value) || 50 }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                min={1}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Max Applications per Day
              </label>
              <input
                type="number"
                value={form.maxApplicationsPerDay || 20}
                onChange={(e) => setForm((p) => ({ ...p, maxApplicationsPerDay: parseInt(e.target.value) || 20 }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                min={1}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toggles */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Feature Toggles</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Show maintenance page to all users' },
            { key: 'requireJobApproval', label: 'Require Job Approval', desc: 'New jobs require admin approval before publishing' },
            { key: 'enableScrapers', label: 'Enable Scrapers', desc: 'Enable automatic job scraping from external sources' },
            { key: 'enableAssessments', label: 'Enable Assessments', desc: 'Allow users to take skill assessments' },
          ].map((toggle) => (
            <div
              key={toggle.key}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
            >
              <div>
                <p className="font-medium text-gray-900">{toggle.label}</p>
                <p className="text-sm text-gray-500">{toggle.desc}</p>
              </div>
              <button
                onClick={() => setForm((p) => ({ ...p, [toggle.key]: !p[toggle.key] }))}
                className={`relative h-6 w-11 rounded-full transition ${
                  form[toggle.key] ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition ${
                    form[toggle.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={updateMutation.isPending}>
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
