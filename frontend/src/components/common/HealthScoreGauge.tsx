import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';

interface HealthScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({
  score,
  size = 'md',
  showDetails = true,
}) => {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));

  const getColor = (val: number) => {
    if (val >= 80) return { stroke: '#16A085', bg: '#E7F7F0', text: 'text-emerald-700', label: 'Healthy Posture', grade: 'A' };
    if (val >= 60) return { stroke: '#D97706', bg: '#FFF3E5', text: 'text-amber-700', label: 'Elevated Risk', grade: 'B' };
    if (val >= 40) return { stroke: '#F59E0B', bg: '#FEF3C7', text: 'text-yellow-700', label: 'Significant Fragility', grade: 'C' };
    return { stroke: '#E11D48', bg: '#FDECEC', text: 'text-rose-700', label: 'Critical Exposure', grade: 'F' };
  };

  const theme = getColor(normalizedScore);

  const radius = size === 'lg' ? 64 : size === 'md' ? 48 : 32;
  const strokeWidth = size === 'lg' ? 10 : size === 'md' ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
  const dimension = (radius + strokeWidth) * 2;

  return (
    <div className="flex items-center gap-4">
      <div className="relative inline-flex items-center justify-center">
        <svg width={dimension} height={dimension} className="transform -rotate-90">
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="#E5EAF1"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-extrabold ${size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-lg'} text-sentinel-text`}>
            {normalizedScore}
          </span>
          <span className="text-[10px] text-sentinel-secondary font-medium uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>

      {showDetails && (
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${theme.bg} ${theme.text}`}>
              Grade {theme.grade}
            </span>
            <span className="text-xs text-sentinel-secondary font-medium">
              Deterministic Rating
            </span>
          </div>
          <h4 className="text-sm font-semibold text-sentinel-text mt-1">{theme.label}</h4>
          <p className="text-xs text-sentinel-secondary mt-0.5">
            Calculated from critical security, missing safeguards, and technical debt penalties.
          </p>
        </div>
      )}
    </div>
  );
};
