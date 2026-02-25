'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'sonner';
import {
  Bot,
  Play,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const sourceLabels: Record<string, string> = {
  bdjobs: 'BDJobs',
  careerjet: 'CareerJet',
  unjobs: 'UNJobs',
  impactpool: 'Impactpool',
  shomvob: 'Shomvob',
  nextjobz: 'NextJobz',
  skilljobs: 'SkillJobs',
};

const sourceColors: Record<string, string> = {
  bdjobs: 'bg-blue-100 text-blue-700',
  careerjet: 'bg-green-100 text-green-700',
  unjobs: 'bg-purple-100 text-purple-700',
  impactpool: 'bg-orange-100 text-orange-700',
  shomvob: 'bg-pink-100 text-pink-700',
  nextjobz: 'bg-cyan-100 text-cyan-700',
  skilljobs: 'bg-yellow-100 text-yellow-700',
};

function useScraperStatus() {
  return useQuery({
    queryKey: ['scrapers', 'status'],
    queryFn: async () => {
      const { data } = await apiClient.get('/scrapers/status');
      return data.data;
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

function useScraperStats() {
  return useQuery({
    queryKey: ['scrapers', 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/scrapers/stats');
      return data.data;
    },
  });
}

function useScraperLogs(source?: string, page = 1) {
  return useQuery({
    queryKey: ['scrapers', 'logs', source, page],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit: 10 };
      if (source) params.source = source;
      const { data } = await apiClient.get('/scrapers/logs', { params });
      return data.data;
    },
  });
}

export default function ScrapersPage() {
  const queryClient = useQueryClient();
  const [showLogs, setShowLogs] = useState(false);
  const [logSource, setLogSource] = useState<string | undefined>();
  const [logPage, setLogPage] = useState(1);

  const { data: statuses, isLoading: statusLoading } = useScraperStatus();
  const { data: stats } = useScraperStats();
  const { data: logsData, isLoading: logsLoading } = useScraperLogs(
    logSource,
    logPage,
  );

  const triggerMutation = useMutation({
    mutationFn: async (source: string) => {
      await apiClient.post(`/scrapers/trigger/${source}`);
    },
    onSuccess: (_data, source) => {
      toast.success(`${sourceLabels[source] || source} scraper triggered`);
      queryClient.invalidateQueries({ queryKey: ['scrapers'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to trigger scraper');
    },
  });

  const triggerAllMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/scrapers/trigger-all');
    },
    onSuccess: () => {
      toast.success('All scrapers triggered');
      queryClient.invalidateQueries({ queryKey: ['scrapers'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to trigger scrapers',
      );
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Job Scrapers
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor job aggregation from external sources
          </p>
        </div>
        <Button
          onClick={() => triggerAllMutation.mutate()}
          isLoading={triggerAllMutation.isPending}
        >
          <Play className="h-4 w-4" />
          Run All Scrapers
        </Button>
      </div>

      {/* Overview Stats */}
      {stats?.overall && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                <Bot className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.overall.totalRuns}
                </p>
                <p className="text-sm text-gray-500">Runs (7d)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.overall.totalNew}
                </p>
                <p className="text-sm text-gray-500">New Jobs (7d)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50">
                <RefreshCw className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.overall.totalFetched}
                </p>
                <p className="text-sm text-gray-500">Total Fetched (7d)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50">
                <CheckCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.overall.successRate}%
                </p>
                <p className="text-sm text-gray-500">Success Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scraper Status Cards */}
      <h2 className="mt-8 text-lg font-semibold text-gray-900">
        Scraper Sources
      </h2>

      {statusLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {statuses?.map((scraper: any) => (
            <Card key={scraper.source}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        sourceColors[scraper.source] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {sourceLabels[scraper.source] || scraper.source}
                      </h3>
                      {scraper.isRunning ? (
                        <Badge variant="warning">Running</Badge>
                      ) : scraper.lastStatus === 'completed' ? (
                        <Badge variant="success">Healthy</Badge>
                      ) : scraper.lastStatus === 'failed' ? (
                        <Badge variant="danger">Failed</Badge>
                      ) : (
                        <Badge variant="secondary">Never Run</Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => triggerMutation.mutate(scraper.source)}
                    isLoading={
                      triggerMutation.isPending &&
                      triggerMutation.variables === scraper.source
                    }
                    disabled={scraper.isRunning}
                  >
                    <Play className="h-3.5 w-3.5" />
                    Run
                  </Button>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Last Run
                    </span>
                    <span>
                      {scraper.lastRun
                        ? formatDistanceToNow(new Date(scraper.lastRun), {
                            addSuffix: true,
                          })
                        : 'Never'}
                    </span>
                  </div>
                  {scraper.lastDuration && (
                    <div className="flex items-center justify-between">
                      <span>Duration</span>
                      <span>{Math.round(scraper.lastDuration / 1000)}s</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Last 24h</span>
                    <span>
                      {scraper.last24h.runs} runs &middot;{' '}
                      {scraper.last24h.newJobs} new jobs
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Log Viewer */}
      <div className="mt-8">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-900"
        >
          Scraper Logs
          {showLogs ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {showLogs && (
          <div className="mt-4">
            {/* Source Filter */}
            <div className="mb-4">
              <select
                value={logSource || ''}
                onChange={(e) => {
                  setLogSource(e.target.value || undefined);
                  setLogPage(1);
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Sources</option>
                {Object.entries(sourceLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {logsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : !logsData?.logs?.length ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No logs found
              </p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                          Source
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                          Started
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                          Duration
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                          Fetched
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                          New
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                          Trigger
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                          Errors
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {logsData.logs.map((log: any) => (
                        <tr key={log._id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                sourceColors[log.source] || 'bg-gray-100'
                              }`}
                            >
                              {sourceLabels[log.source] || log.source}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            {log.status === 'completed' ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                Completed
                              </span>
                            ) : log.status === 'failed' ? (
                              <span className="flex items-center gap-1 text-red-600">
                                <XCircle className="h-4 w-4" />
                                Failed
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-yellow-600">
                                <AlertTriangle className="h-4 w-4" />
                                Running
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                            {formatDistanceToNow(new Date(log.startedAt), {
                              addSuffix: true,
                            })}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                            {log.duration
                              ? `${Math.round(log.duration / 1000)}s`
                              : '-'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                            {log.stats?.fetched || 0}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-green-600">
                            +{log.stats?.new || 0}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                            {log.triggeredBy}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {log.errorMessages?.length > 0 ? (
                              <span className="text-red-500" title={log.errorMessages.join('\n')}>
                                {log.errorMessages.length} error(s)
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {logsData.totalPages > 1 && (
                  <div className="mt-4 flex justify-center gap-2">
                    <button
                      onClick={() => setLogPage(logPage - 1)}
                      disabled={logPage <= 1}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="flex items-center px-3 text-sm text-gray-500">
                      Page {logPage} of {logsData.totalPages}
                    </span>
                    <button
                      onClick={() => setLogPage(logPage + 1)}
                      disabled={logPage >= logsData.totalPages}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
