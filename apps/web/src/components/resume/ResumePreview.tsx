'use client';

import type { IResume } from '@job-platform/shared-types';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import MinimalTemplate from './templates/MinimalTemplate';

interface ResumePreviewProps {
  resume: IResume;
}

export default function ResumePreview({ resume }: ResumePreviewProps) {
  switch (resume.template) {
    case 'modern':
      return <ModernTemplate resume={resume} />;
    case 'minimal':
      return <MinimalTemplate resume={resume} />;
    case 'classic':
    default:
      return <ClassicTemplate resume={resume} />;
  }
}
