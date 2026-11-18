import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  ExternalLink,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Calendar,
  Building,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { Scan, Repository } from '../types';

interface ReportsPageProps {
  scan: Scan;
  repo: Repository;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ scan, repo }) => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('all');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await api.getReport(scan.id);
        setReportData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [scan.id]);

  const handlePrint = () => {
    const htmlUrl = api.getReportHtmlUrl(scan.id);
    const printWindow = window.open(htmlUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleDownload = (format: 'html' | 'json') => {
    const url = api.getReportDownloadUrl(scan.id, format);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-sentinel-border p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Audit Documentation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-sentinel-text">
            Autonomous Engineering Audit Report
          </h1>
          <p className="text-xs text-sentinel-secondary mt-1">
            Comprehensive compliance, security, missingness, and patch verification report ready for engineering leadership.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-sentinel-text border border-sentinel-border text-xs font-semibold shadow-subtle flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
          <button
            onClick={() => handleDownload('html')}
            className="px-3.5 py-2 rounded-xl bg-sentinel-softBlue hover:bg-blue-100 text-sentinel-accent border border-blue-200 text-xs font-semibold shadow-subtle flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export HTML</span>
          </button>
          <button
            onClick={() => handleDownload('json')}
            className="px-3.5 py-2 rounded-xl bg-sentinel-accent hover:bg-sentinel-accentHover text-white text-xs font-semibold shadow-subtle flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Embedded Printable Preview */}
      <div className="bg-white rounded-2xl border border-sentinel-border shadow-subtle p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-sentinel-border">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sentinel-text uppercase tracking-wider">
              Live Audit Preview
            </span>
            <span className="text-xs text-sentinel-secondary">&bull; Standardized Format</span>
          </div>
          <a
            href={api.getReportHtmlUrl(scan.id)}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-sentinel-accent font-semibold hover:underline flex items-center gap-1"
          >
            <span>Open Standalone Report</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <iframe
          src={api.getReportHtmlUrl(scan.id)}
          title="Audit Report Preview"
          className="w-full h-[650px] border border-sentinel-border rounded-xl bg-[#F7F9FC]"
        />
      </div>
    </div>
  );
};
