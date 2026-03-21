"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
  Clock, Play, CheckCircle2, XCircle, AlertTriangle, Loader2,
  RefreshCw, Calendar, Timer, ChevronDown, ChevronUp, Zap
} from "lucide-react";
import { getCronJobStatus, getCronJobHistory, triggerCronJob } from "@/app/actions/admin-system";
import { toast } from "sonner";

type CronJob = {
  name: string;
  label: string;
  schedule: string;
  description: string;
  path: string;
  lastRun: {
    id: number;
    jobName: string;
    status: string;
    startedAt: Date;
    completedAt: Date | null;
    durationMs: number | null;
    result: any;
    error: string | null;
  } | null;
};

export default function CronJobsPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [triggeringJob, setTriggeringJob] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCronJobStatus();
      setJobs(data as CronJob[]);
    } catch {
      toast.error("Failed to load cron jobs");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const loadHistory = async (jobName: string) => {
    if (expandedJob === jobName) {
      setExpandedJob(null);
      return;
    }
    setExpandedJob(jobName);
    setHistoryLoading(true);
    try {
      const data = await getCronJobHistory(jobName);
      setHistory(data.runs);
    } catch {
      setHistory([]);
    }
    setHistoryLoading(false);
  };

  const handleTrigger = async (jobName: string) => {
    setTriggeringJob(jobName);
    try {
      const result = await triggerCronJob(jobName);
      if (result.success) {
        toast.success("Cron job triggered successfully");
        load(); // Refresh status
      } else {
        toast.error(result.error || "Failed to trigger job");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to trigger job");
    }
    setTriggeringJob(null);
  };

  const formatTime = (d: Date | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit"
    });
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return "—";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "success":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3" />Success</span>;
      case "failed":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700"><XCircle className="w-3 h-3" />Failed</span>;
      case "running":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"><Loader2 className="w-3 h-3 animate-spin" />Running</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Never run</span>;
    }
  };

  const parseCron = (schedule: string) => {
    // Simple human-readable cron description
    const parts = schedule.split(" ");
    if (parts.length !== 5) return schedule;
    const [min, hour, dom, mon, dow] = parts;
    if (min === "0" && hour !== "*" && dom === "*" && mon === "*" && dow === "*") {
      return `Daily at ${hour}:00 UTC`;
    }
    if (min === "0" && hour.includes("/")) {
      return `Every ${hour.split("/")[1]} hours`;
    }
    return schedule;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cron Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor and manage scheduled background tasks</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">Total Jobs</div>
          <div className="text-2xl font-bold text-gray-900">{jobs.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">Healthy</div>
          <div className="text-2xl font-bold text-green-600">
            {jobs.filter(j => j.lastRun?.status === "success").length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">Failed / Never Run</div>
          <div className="text-2xl font-bold text-amber-600">
            {jobs.filter(j => !j.lastRun || j.lastRun.status === "failed").length}
          </div>
        </div>
      </div>

      {/* Job List */}
      <div className="space-y-3">
        {jobs.map(job => (
          <div key={job.name} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Job Row */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">{job.label}</h3>
                  {getStatusBadge(job.lastRun?.status)}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{job.description}</p>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{parseCron(job.schedule)}</span>
                  <span className="flex items-center gap-1"><Timer className="w-3 h-3" />Last: {formatTime(job.lastRun?.startedAt ?? null)}</span>
                  {job.lastRun?.durationMs && (
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{formatDuration(job.lastRun.durationMs)}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTrigger(job.name)}
                  disabled={triggeringJob === job.name}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 disabled:opacity-50 transition-colors"
                >
                  {triggeringJob === job.name ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  Run Now
                </button>
                <button
                  onClick={() => loadHistory(job.name)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100"
                >
                  History
                  {expandedJob === job.name ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Error message if last run failed */}
            {job.lastRun?.status === "failed" && job.lastRun.error && (
              <div className="mx-5 mb-3 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 mb-0.5">
                  <AlertTriangle className="w-3 h-3" /> Last Error
                </div>
                <p className="text-xs text-red-500 font-mono">{job.lastRun.error}</p>
              </div>
            )}

            {/* History Panel */}
            {expandedJob === job.name && (
              <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Run History</h4>
                {historyLoading ? (
                  <div className="py-4 text-center"><Loader2 className="w-4 h-4 animate-spin text-gray-400 mx-auto" /></div>
                ) : history.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">No run history recorded yet</p>
                ) : (
                  <div className="space-y-2">
                    {history.map((run: any) => (
                      <div key={run.id} className="flex items-center gap-4 px-3 py-2 bg-white rounded-lg border border-gray-100">
                        {getStatusBadge(run.status)}
                        <span className="text-xs text-gray-500">{formatTime(run.startedAt)}</span>
                        <span className="text-xs text-gray-400">{formatDuration(run.durationMs)}</span>
                        {run.error && <span className="text-xs text-red-500 truncate max-w-xs">{run.error}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
