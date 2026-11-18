import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Cpu,
  ArrowRight,
  RefreshCw,
  FileCode,
  ShieldAlert,
  SearchCode,
  Sparkles,
  Network
} from 'lucide-react';
import { DottedNetworkBackground } from '../components/DottedNetworkBackground';
import { api } from '../services/api';
import { Scan, StageProgress } from '../types';

interface ScanningPageProps {
  scanId: string;
  onScanComplete: (scan: Scan) => void;
  onRetry: () => void;
}

export const ScanningPage: React.FC<ScanningPageProps> = ({
  scanId,
  onScanComplete,
  onRetry,
}) => {
  const [progressData, setProgressData] = useState<{
    id: string;
    status: string;
    progress: number;
    current_stage: string;
    stages: StageProgress[];
    files_analyzed: number;
    lines_of_code: number;
    health_score: number;
    error_message?: string;
  } | null>(null);

  const [pollError, setPollError] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;

    const poll = async () => {
      try {
        const data = await api.getScanProgress(scanId);
        setProgressData(data);

        if (data.status === 'completed') {
          clearInterval(interval);
          const fullScan = await api.getScan(scanId);
          setTimeout(() => {
            onScanComplete(fullScan);
          }, 800);
        } else if (data.status === 'failed') {
          clearInterval(interval);
        }
      } catch (err: any) {
        setPollError(err.message || 'Polling error');
      }
    };

    poll();
    interval = setInterval(poll, 700);

    return () => clearInterval(interval);
  }, [scanId, onScanComplete]);

  const stages = progressData?.stages || [];
  const isFailed = progressData?.status === 'failed';
  const isComplete = progressData?.status === 'completed';

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-sentinel-bg flex flex-col justify-center items-center px-4 py-12">
      <DottedNetworkBackground density="medium" interactive={true} />

      <div className="relative z-10 w-full max-w-3xl bg-white/95 backdrop-blur-md rounded-2xl border border-sentinel-border shadow-elevated p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sentinel-border gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sentinel-softBlue text-sentinel-accent border border-blue-200 text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-sentinel-accent animate-ping" />
              <span>Multi-Agent Audit Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-sentinel-text">
              {isComplete ? 'Repository Audit Complete' : isFailed ? 'Audit Run Failed' : 'Autonomous Codebase Inspection'}
            </h2>
            <p className="text-xs text-sentinel-secondary mt-1">
              Deterministic AST symbolic execution, missingness investigation, and workflow correlation.
            </p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-extrabold text-sentinel-accent">
              {progressData?.progress || 0}%
            </div>
            <span className="text-[11px] text-sentinel-secondary font-semibold uppercase tracking-wider">
              Scan Progress
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isFailed ? 'bg-rose-500' : isComplete ? 'bg-emerald-500' : 'bg-sentinel-accent'
            }`}
            style={{ width: `${progressData?.progress || 5}%` }}
          />
        </div>

        {/* Current Metrics Overview */}
        <div className="mt-6 grid grid-cols-3 gap-3 p-4 rounded-xl bg-sentinel-bg border border-sentinel-border">
          <div className="text-center">
            <span className="text-xs text-sentinel-secondary">Files Indexed</span>
            <div className="text-base font-bold text-sentinel-text mt-0.5">
              {progressData?.files_analyzed || 0}
            </div>
          </div>
          <div className="text-center border-x border-sentinel-border">
            <span className="text-xs text-sentinel-secondary">Lines of Code</span>
            <div className="text-base font-bold text-sentinel-text mt-0.5">
              {progressData?.lines_of_code || 0}
            </div>
          </div>
          <div className="text-center">
            <span className="text-xs text-sentinel-secondary">Current Stage</span>
            <div className="text-xs font-bold text-sentinel-accent truncate mt-0.5 px-2">
              {progressData?.current_stage || 'Initializing...'}
            </div>
          </div>
        </div>

        {/* 10-Stage Progression Stepper */}
        <div className="mt-8 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sentinel-secondary mb-2">
            Audit Pipeline Stages (10 / 10)
          </h3>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {stages.map((stage) => {
              const isDone = stage.status === 'completed';
              const isCurrent = stage.status === 'in_progress';
              const isError = stage.status === 'failed';

              return (
                <div key={stage.step} className="py-2.5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-sentinel-accent animate-spin" />
                      ) : isError ? (
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-sentinel-text">
                          Stage {stage.step}: {stage.name}
                        </span>
                        {stage.duration_ms > 0 && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {stage.duration_ms}ms
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-sentinel-secondary mt-0.5">
                        {stage.details || (isDone ? 'Completed successfully.' : isCurrent ? 'Analyzing code...' : 'Pending execution...')}
                      </p>
                    </div>
                  </div>

                  <div>
                    {isDone && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        Done
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 animate-pulse">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Failed Action */}
        {isFailed && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
            <div className="text-xs text-red-700">
              <span className="font-bold">Execution Failed:</span> {progressData?.error_message || 'An error occurred during stage execution.'}
            </div>
            <button
              onClick={onRetry}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
            >
              Retry Scan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
