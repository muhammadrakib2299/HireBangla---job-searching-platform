import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">
                Hire<span className="text-blue-600">Bangla</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              Bangladesh&apos;s leading job searching platform. Connecting
              talent with opportunities across the nation.
            </p>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              For Job Seekers
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/jobs"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/companies"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  Companies
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              For Employers
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/register"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  Post a Job
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  Find Talent
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} HireBangla. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
