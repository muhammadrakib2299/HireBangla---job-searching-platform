'use client';

import { useState, type FormEvent } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DIVISIONS } from '@job-platform/shared-constants';

interface JobSearchBarProps {
  initialQuery?: string;
  initialDivision?: string;
  onSearch: (query: string, division: string) => void;
  className?: string;
}

export function JobSearchBar({
  initialQuery = '',
  initialDivision = '',
  onSearch,
  className,
}: JobSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [division, setDivision] = useState(initialDivision);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query, division);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-2 sm:flex-row ${className || ''}`}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Job title, keyword, or company"
          className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div className="relative sm:w-48">
        <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <select
          value={division}
          onChange={(e) => setDivision(e.target.value)}
          className="h-12 w-full appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All Locations</option>
          {DIVISIONS.map((div) => (
            <option key={div.name} value={div.name}>
              {div.name}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" size="lg" className="h-12 px-8">
        <Search className="h-5 w-5" />
        Search
      </Button>
    </form>
  );
}
