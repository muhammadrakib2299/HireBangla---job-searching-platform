'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'sonner';
import { User, Wrench, Settings } from 'lucide-react';
import PersonalInfoForm from './PersonalInfoForm';
import SkillsForm from './SkillsForm';
import PreferencesForm from './PreferencesForm';
import AvatarUpload from './AvatarUpload';
import type { IUser } from '@job-platform/shared-types';

const TABS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'preferences', label: 'Preferences', icon: Settings },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('personal');
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (data: { profile: Record<string, unknown> }) => {
      const { data: res } = await apiClient.put('/users/profile', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Profile updated');
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const updateSkills = useMutation({
    mutationFn: async (data: { skills: string[] }) => {
      const { data: res } = await apiClient.put('/users/skills', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Skills updated');
      refreshUser();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update skills');
    },
  });

  const updatePreferences = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { data: res } = await apiClient.put('/users/preferences', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Preferences updated');
      refreshUser();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update preferences');
    },
  });

  const handleAvatarUpload = async (url: string) => {
    await updateProfile.mutateAsync({ profile: { avatar: url } });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) return null;

  const typedUser = user as unknown as IUser;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Profile</h1>

      <Card className="mb-6">
        <CardContent className="py-6">
          <AvatarUpload
            currentAvatar={typedUser.profile.avatar}
            firstName={typedUser.profile.firstName}
            onUploaded={handleAvatarUpload}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'personal' && (
            <PersonalInfoForm
              user={typedUser}
              onSave={(data) => updateProfile.mutateAsync(data)}
              isSaving={updateProfile.isPending}
            />
          )}
          {activeTab === 'skills' && (
            <SkillsForm
              skills={typedUser.skills || []}
              onSave={(data) => updateSkills.mutateAsync(data)}
              isSaving={updateSkills.isPending}
            />
          )}
          {activeTab === 'preferences' && (
            <PreferencesForm
              user={typedUser}
              onSave={(data) => updatePreferences.mutateAsync(data)}
              isSaving={updatePreferences.isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
