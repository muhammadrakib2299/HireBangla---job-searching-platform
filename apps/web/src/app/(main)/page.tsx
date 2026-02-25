import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Search, Briefcase, Building2, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Find Your Dream Job in{' '}
            <span className="text-blue-600">Bangladesh</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Search thousands of jobs from top employers, NGOs, and international
            organizations. Your next career move starts here.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/jobs">
              <Button size="lg">
                <Search className="h-5 w-5" />
                Browse Jobs
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg">
                <Briefcase className="h-5 w-5" />
                Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-100 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
              <Briefcase className="h-7 w-7 text-blue-600" />
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900">1,000+</p>
            <p className="mt-1 text-sm text-gray-500">Jobs Available</p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-green-100">
              <Building2 className="h-7 w-7 text-green-600" />
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900">500+</p>
            <p className="mt-1 text-sm text-gray-500">Companies</p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100">
              <Users className="h-7 w-7 text-purple-600" />
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900">10,000+</p>
            <p className="mt-1 text-sm text-gray-500">Job Seekers</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Create your free account and start exploring opportunities today.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button size="lg">Create Free Account</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
