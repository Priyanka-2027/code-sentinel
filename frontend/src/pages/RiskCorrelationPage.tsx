import React, { useState, useRef } from 'react';
import {
  Network,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  ShieldAlert,
  SearchCode,
  FileCode,
  ArrowRight,
  ExternalLink,
  Layers,
  ChevronRight
} from 'lucide-react';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { RiskRelationship, GraphNode, GraphEdge, Finding } from '../types';

interface RiskCorrelationPageProps {
  relationships: RiskRelationship[];
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
  onNavigateToPatch: (finding: Finding) => void;
}

export const RiskCorrelationPage: React.FC<RiskCorrelationPageProps> = ({
  relationships,
  findings,
  onSelectFinding,
  onNavigateToPatch,
}) => {
  const [selectedClusterId, setSelectedClusterId] = useState<string>(
    relationships[0]?.id || ''
  );
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeCluster = relationships.find((r) => r.id === selectedClusterId) || relationships[0];
  const graph = activeCluster ? { nodes: activeCluster.nodes, edges: activeCluster.edges } : { nodes: [], edges: [] };

  // Calculate layout coordinates for SVG graph nodes
  const width = 760;
  const height = 480;
  const centerX = width / 2;
  const centerY = height / 2;

  const nodePositions: Record<string, { x: number; y: number }> = {};

  // Place central nodes (endpoints or files) in center, satellite finding nodes in orbit
  const centerNodes = graph.nodes.filter((n) => n.type === 'endpoint' || n.type === 'file');
  const satelliteNodes = graph.nodes.filter((n) => n.type !== 'endpoint' && n.type !== 'file');

  centerNodes.forEach((node, idx) => {
    const angle = (idx / Math.max(1, centerNodes.length)) * Math.PI * 2;
    const dist = centerNodes.length > 1 ? 80 : 0;
    nodePositions[node.id] = {
      x: centerX + Math.cos(angle) * dist,
      y: centerY + Math.sin(angle) * dist,
    };
  });

  satelliteNodes.forEach((node, idx) => {
    const angle = (idx / Math.max(1, satelliteNodes.length)) * Math.PI * 2 - Math.PI / 2;
    const radius = 170;
    nodePositions[node.id] = {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getNodeColor = (node: GraphNode) => {
    if (node.type === 'endpoint') return { fill: '#315EF5', stroke: '#1D4ED8', text: '#FFFFFF', icon: 'API' };
    if (node.type === 'file') return { fill: '#64748B', stroke: '#475569', text: '#FFFFFF', icon: 'FILE' };
    if (node.severity === 'critical') return { fill: '#FDECEC', stroke: '#E11D48', text: '#E11D48', icon: 'CRIT' };
    if (node.severity === 'high') return { fill: '#FFF3E5', stroke: '#D97706', text: '#D97706', icon: 'HIGH' };
    return { fill: '#EAF0FF', stroke: '#315EF5', text: '#315EF5', icon: 'FIND' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-sentinel-border p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold mb-2">
            <Network className="w-3.5 h-3.5" />
            <span>Workflow Risk Topology</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-sentinel-text">
            Cross-Issue Risk Correlation
          </h1>
          <p className="text-xs text-sentinel-secondary mt-1">
            Synthesizes discrete vulnerabilities, absent safeguards, and untested flows into actionable compound risk clusters.
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-extrabold text-purple-700">
            {relationships.length}
          </div>
          <span className="text-[11px] text-sentinel-secondary font-semibold uppercase tracking-wider">
            Risk Clusters Detected
          </span>
        </div>
      </div>

      {/* Cluster Selector Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {relationships.map((rel) => (
          <button
            key={rel.id}
            onClick={() => {
              setSelectedClusterId(rel.id);
              setSelectedNode(null);
            }}
            className={`px-4 py-3 rounded-2xl border text-left flex-shrink-0 transition-all ${
              selectedClusterId === rel.id
                ? 'bg-purple-50/70 border-purple-300 shadow-sm ring-1 ring-purple-200'
                : 'bg-white border-sentinel-border hover:border-slate-300 shadow-subtle'
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="text-xs font-bold text-sentinel-text">
                {rel.cluster_name}
              </span>
              <SeverityBadge severity={rel.severity} size="sm" />
            </div>
            <p className="text-[11px] text-sentinel-secondary">
              Workflow: {rel.affected_workflow}
            </p>
          </button>
        ))}
      </div>

      {activeCluster ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Graph Canvas */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-sentinel-border shadow-subtle p-4 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-sentinel-border mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-sentinel-text">
                  Interactive Risk Graph: {activeCluster.cluster_name}
                </span>
                <span className="text-[11px] text-sentinel-secondary">
                  ({graph.nodes.length} nodes &bull; {graph.edges.length} edges)
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2, z + 0.15))}
                  className="p-1.5 rounded-lg border border-sentinel-border hover:bg-slate-50 text-slate-700"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.15))}
                  className="p-1.5 rounded-lg border border-sentinel-border hover:bg-slate-50 text-slate-700"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
                  className="p-1.5 rounded-lg border border-sentinel-border hover:bg-slate-50 text-slate-700"
                  title="Reset View"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* SVG Visual Canvas */}
            <div
              className="w-full h-[480px] bg-slate-50/50 rounded-xl cursor-grab active:cursor-grabbing relative overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${width} ${height}`}
                className="select-none"
              >
                <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
                  {/* Edges */}
                  {graph.edges.map((edge, idx) => {
                    const p1 = nodePositions[edge.source] || { x: centerX, y: centerY };
                    const p2 = nodePositions[edge.target] || { x: centerX, y: centerY };

                    const midX = (p1.x + p2.x) / 2;
                    const midY = (p1.y + p2.y) / 2;

                    return (
                      <g key={idx}>
                        <line
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          stroke="#CBD5E1"
                          strokeWidth="1.8"
                          strokeDasharray={edge.relationship === 'missing_test_coverage' ? '4 4' : 'none'}
                        />
                        {/* Edge label pill */}
                        <rect
                          x={midX - 35}
                          y={midY - 9}
                          width="70"
                          height="18"
                          rx="4"
                          fill="#FFFFFF"
                          stroke="#E2E8F0"
                        />
                        <text
                          x={midX}
                          y={midY + 3}
                          textAnchor="middle"
                          fill="#64748B"
                          fontSize="9"
                          fontFamily="sans-serif"
                          fontWeight="bold"
                        >
                          {edge.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {graph.nodes.map((node) => {
                    const pos = nodePositions[node.id] || { x: centerX, y: centerY };
                    const style = getNodeColor(node);
                    const isSelected = selectedNode?.id === node.id;
                    const isCenter = node.type === 'endpoint' || node.type === 'file';

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNode(node);
                        }}
                        className="cursor-pointer transition-transform hover:scale-105"
                      >
                        {isCenter ? (
                          <rect
                            x="-50"
                            y="-25"
                            width="100"
                            height="50"
                            rx="12"
                            fill={style.fill}
                            stroke={isSelected ? '#172033' : style.stroke}
                            strokeWidth={isSelected ? '3' : '1.5'}
                            className="shadow-sm"
                          />
                        ) : (
                          <circle
                            r="28"
                            fill={style.fill}
                            stroke={isSelected ? '#172033' : style.stroke}
                            strokeWidth={isSelected ? '3' : '1.5'}
                            className="shadow-sm"
                          />
                        )}

                        <text
                          textAnchor="middle"
                          y={isCenter ? '5' : '4'}
                          fill={style.text}
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {node.label.length > 14 ? node.label.substring(0, 12) + '..' : node.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Legend Overlay */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm border border-sentinel-border rounded-lg p-2.5 shadow-sm text-[10px] space-y-1">
                <div className="font-bold text-slate-700">Topology Legend</div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded bg-blue-600" /> API / Endpoint Target
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-100 border border-red-500" /> Vulnerability / Missing Gap
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-0.5 border-t border-dashed border-slate-500" /> Missing Test Coverage Link
                </div>
              </div>
            </div>
          </div>

          {/* Right Narrative & Node Details */}
          <div className="lg:col-span-4 space-y-4">
            {/* Narrative Synthesis */}
            <div className="bg-white rounded-2xl border border-sentinel-border shadow-subtle p-5">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
                <Network className="w-4 h-4" />
                <span>Compound Risk Synthesis</span>
              </div>
              <h3 className="text-sm font-bold text-sentinel-text mb-3">
                {activeCluster.cluster_name}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {activeCluster.narrative}
              </p>
            </div>

            {/* Selected Node Details */}
            {selectedNode && (
              <div className="bg-white rounded-2xl border border-sentinel-border shadow-subtle p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sentinel-secondary">
                    Inspected Node
                  </span>
                  {selectedNode.severity && (
                    <SeverityBadge severity={selectedNode.severity} size="sm" />
                  )}
                </div>

                <h4 className="text-xs font-bold text-sentinel-text">
                  {selectedNode.label}
                </h4>

                <div className="text-xs text-sentinel-secondary">
                  Node Type: <strong className="capitalize">{selectedNode.type}</strong>
                </div>

                {selectedNode.details && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1">
                    {Object.entries(selectedNode.details).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-500">{k}:</span>
                        <span className="text-slate-800">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl border border-sentinel-border">
          <Network className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-sentinel-text">No Risk Clusters Detected</h3>
          <p className="text-xs text-sentinel-secondary mt-1">
            Zero multi-finding risk clusters identified in this scan.
          </p>
        </div>
      )}
    </div>
  );
};
