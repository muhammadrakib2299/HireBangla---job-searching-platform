'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  BookmarkCheck,
  User,
  ClipboardList,
  Building2,
  PlusCircle,
  Users,
  Settings,
  BarChart3,
  Bot,
  Award,
} from 'lucide-react';

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const jobseekerLinks: SidebarLink[] = [
  {
    href: '/dashboard/jobseeker',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: '/dashboard/jobseeker/applications',
    label: 'My Applications',
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    href: '/dashboard/jobseeker/saved-jobs',
    label: 'Saved Jobs',
    icon: <BookmarkCheck className="h-5 w-5" />,
  },
  {
    href: '/dashboard/jobseeker/resume',
    label: 'Resume',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    href: '/dashboard/jobseeker/assessments',
    label: 'Assessments',
    icon: <Award className="h-5 w-5" />,
  },
  {
    href: '/dashboard/jobseeker/profile',
    label: 'Profile',
    icon: <User className="h-5 w-5" />,
  },
];

const employerLinks: SidebarLink[] = [
  {
    href: '/dashboard/employer',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: '/dashboard/employer/post-job',
    label: 'Post a Job',
    icon: <PlusCircle className="h-5 w-5" />,
  },
  {
    href: '/dashboard/employer/manage-jobs',
    label: 'Manage Jobs',
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    href: '/dashboard/employer/applications',
    label: 'Applications',
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    href: '/dashboard/employer/company-profile',
    label: 'Company Profile',
    icon: <Building2 className="h-5 w-5" />,
  },
];

const adminLinks: SidebarLink[] = [
  {
    href: '/dashboard/admin',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: '/dashboard/admin/users',
    label: 'Users',
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: '/dashboard/admin/jobs',
    label: 'Jobs',
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    href: '/dashboard/admin/scrapers',
    label: 'Scrapers',
    icon: <Bot className="h-5 w-5" />,
  },
  {
    href: '/dashboard/admin/assessments',
    label: 'Assessments',
    icon: <Award className="h-5 w-5" />,
  },
  {
    href: '/dashboard/admin/analytics',
    label: 'Analytics',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    href: '/dashboard/admin/settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const links =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'employer'
        ? employerLinks
        : jobseekerLinks;

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== '/dashboard/jobseeker' &&
              link.href !== '/dashboard/employer' &&
              link.href !== '/dashboard/admin' &&
              pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
