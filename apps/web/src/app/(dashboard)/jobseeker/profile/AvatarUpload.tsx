'use client';

import { useState, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';

interface AvatarUploadProps {
  currentAvatar?: string;
  firstName?: string;
  onUploaded: (url: string) => void;
}

export default function AvatarUpload({ currentAvatar, firstName, onUploaded }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setPreview(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await apiClient.post('/uploads/image?folder=avatars', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onUploaded(data.data.url);
      toast.success('Avatar uploaded');
    } catch {
      toast.error('Failed to upload avatar');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const displayUrl = preview || currentAvatar;
  const initials = firstName ? firstName.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Avatar"
            className="h-20 w-20 rounded-full border-2 border-gray-200 object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-200 bg-blue-100 text-2xl font-bold text-blue-600">
            {initials}
          </div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white hover:bg-blue-700"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          isLoading={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          Change Photo
        </Button>
        <p className="mt-1 text-xs text-gray-500">JPG, PNG. Max 5MB.</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
