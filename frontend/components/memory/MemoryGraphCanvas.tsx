"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { MemoryGraphData, MemoryNode, MemoryEdge, MemoryNodeType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ZoomIn, ZoomOut, RotateCcw, Filter, Sparkles, Layers, Info } from "lucide-react";

interface MemoryGraphCanvasProps {
  graphData: MemoryGraphData;
  selectedNode: MemoryNode | null;
  onSelectNode: (node: MemoryNode | null) => void;
  className?: string;
}

const TYPE_COLORS: Record<MemoryNodeType, { fill: string; border: string; glow: string; text: string; bg: string }> = {
  Merchant: {
    fill: "#1e3a8a",
    border: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.4)",
    text: "text-blue-200",
    bg: "bg-blue-900/60",
  },
  Product: {
    fill: "#065f46",
    border: "#10b981",
    glow: "rgba(16, 185, 129, 0.4)",
    text: "text-emerald-200",
    bg: "bg-emerald-900/60",
  },
  "Time Slot": {
    fill: "#92400e",
    border: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.4)",
    text: "text-amber-200",
    bg: "bg-amber-900/60",
  },
  Segment: {
    fill: "#0369a1",
    border: "#00b9f5",
    glow: "rgba(0, 185, 245, 0.4)",
    text: "text-cyan-200",
    bg: "bg-cyan-900/60",
  },
  Campaign: {
    fill: "#581c87",
    border: "#a855f7",
    glow: "rgba(168, 85, 247, 0.4)",
    text: "text-purple-200",
    bg: "bg-purple-900/60",
  },
  Insight: {
    fill: "#881337",
    border: "#f43f5e",
    glow: "rgba(244, 63, 94, 0.4)",
    text: "text-rose-200",
    bg: "bg-rose-900/60",
  },
};

export const MemoryGraphCanvas: React.FC<MemoryGraphCanvasProps> = ({
  graphData,
  selectedNode,
  onSelectNode,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [filterType, setFilterType] = useState<string>("ALL");
  const [hoveredNode, setHoveredNode] = useState<MemoryNode | null>(null);

  // Position nodes radially / topologically around merchant_root
  const positionedNodes = useMemo(() => {
    const nodes = graphData.nodes || [];
    const width = 800;
    const height = 540;
    const centerX = width / 2;
    const centerY = height / 2;

    return nodes.map((node, index) => {
      if (node.id === "merchant_root") {
        return { ...node, x: centerX, y: centerY };
      }

      // Group into orbits by type
      let radius = 170;
      let angleOffset = 0;

      if (node.type === "Product") {
        radius = 140;
        angleOffset = 0;
      } else if (node.type === "Time Slot") {
        radius = 210;
        angleOffset = Math.PI / 4;
      } else if (node.type === "Segment") {
        radius = 260;
        angleOffset = Math.PI / 2;
      } else if (node.type === "Campaign") {
        radius = 200;
        angleOffset = (3 * Math.PI) / 4;
      } else if (node.type === "Insight") {
        radius = 230;
        angleOffset = Math.PI;
      }

      const sameTypeNodes = nodes.filter((n) => n.type === node.type);
      const subIndex = sameTypeNodes.findIndex((n) => n.id === node.id);
      const angleStep = (2 * Math.PI) / Math.max(1, sameTypeNodes.length);
      const angle = angleOffset + subIndex * angleStep;

      return {
        ...node,
        x: centerX + Math.cos(angle) * radius + (index % 2 === 0 ? 10 : -10),
        y: centerY + Math.sin(angle) * radius + (index % 3 === 0 ? 10 : -10),
      };
    });
  }, [graphData.nodes]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, typeof positionedNodes[0]>();
    positionedNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [positionedNodes]);

  // Filtered nodes and edges
  const filteredNodes = useMemo(() => {
    if (filterType === "ALL") return positionedNodes;
    return positionedNodes.filter((n) => n.type === filterType || n.id === "merchant_root");
  }, [positionedNodes, filterType]);

  const filteredEdges = useMemo(() => {
    const visibleIds = new Set(filteredNodes.map((n) => n.id));
    return (graphData.edges || []).filter(
      (e) => visibleIds.has(e.source) && visibleIds.has(e.target)
    );
  }, [graphData.edges, filteredNodes]);

  // Connected node IDs for highlighted paths
  const activeConnectedNodeIds = useMemo(() => {
    const targetId = hoveredNode?.id || selectedNode?.id;
    if (!targetId) return new Set<string>();
    const connected = new Set<string>([targetId]);
    (graphData.edges || []).forEach((e) => {
      if (e.source === targetId) connected.add(e.target);
      if (e.target === targetId) connected.add(e.source);
    });
    return connected;
  }, [hoveredNode, selectedNode, graphData.edges]);

  // Pan interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    onSelectNode(null);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[540px] bg-[#070e1e] rounded-3xl border border-navy-800 overflow-hidden select-none cursor-grab active:cursor-grabbing",
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Floating Control Bar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#0c162d]/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-navy-700/80 shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
          title="Zoom In"
          className="p-1.5 rounded-xl hover:bg-navy-800 text-slate-300 hover:text-white transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
          title="Zoom Out"
          className="p-1.5 rounded-xl hover:bg-navy-800 text-slate-300 hover:text-white transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          title="Reset View"
          className="p-1.5 rounded-xl hover:bg-navy-800 text-slate-300 hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-navy-700 mx-1" />
        <span className="text-[11px] font-mono font-bold text-cyan-400">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Filter by Entity Type Pills */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-[#0c162d]/90 backdrop-blur-md p-1.5 rounded-2xl border border-navy-700/80 shadow-lg overflow-x-auto max-w-[calc(100%-180px)]">
        {["ALL", "Product", "Time Slot", "Segment", "Campaign", "Insight"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={cn(
              "px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all shrink-0",
              filterType === type
                ? "bg-brand-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-navy-800/60"
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Main SVG Graph Surface */}
      <svg
        className="w-full h-full"
        viewBox="0 0 800 540"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 0.15s ease-out",
        }}
      >
        <defs>
          <radialGradient id="merchantGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00b9f5" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#002970" stopOpacity="0" />
          </radialGradient>
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        <g className="edges">
          {filteredEdges.map((edge, i) => {
            const source = nodeMap.get(edge.source);
            const target = nodeMap.get(edge.target);
            if (!source || !target) return null;

            const isHighlighted =
              activeConnectedNodeIds.has(edge.source) && activeConnectedNodeIds.has(edge.target);

            return (
              <g key={`edge-${i}`} className="transition-opacity duration-200">
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={isHighlighted ? "#00b9f5" : "#1e293b"}
                  strokeWidth={isHighlighted ? 2.2 : 1.2}
                  strokeDasharray={edge.relationship === "IMPACTS" ? "4,4" : undefined}
                  opacity={activeConnectedNodeIds.size > 0 && !isHighlighted ? 0.2 : 0.8}
                />
                {isHighlighted && (
                  <text
                    x={(source.x + target.x) / 2}
                    y={(source.y + target.y) / 2 - 4}
                    fill="#38bdf8"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {edge.relationship}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Nodes */}
        <g className="nodes">
          {filteredNodes.map((node) => {
            const colorConfig = TYPE_COLORS[node.type] || TYPE_COLORS.Merchant;
            const isSelected = selectedNode?.id === node.id;
            const isHovered = hoveredNode?.id === node.id;
            const isConnected = activeConnectedNodeIds.has(node.id);
            const isDimmed = activeConnectedNodeIds.size > 0 && !isConnected;

            const baseRadius = node.id === "merchant_root" ? 28 : 16 + (node.weight || 1) * 3;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(selectedNode?.id === node.id ? null : node);
                }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer transition-transform duration-200"
                style={{
                  opacity: isDimmed ? 0.25 : 1,
                }}
              >
                {/* Selection Halo */}
                {(isSelected || isHovered) && (
                  <circle
                    r={baseRadius + 8}
                    fill="none"
                    stroke={colorConfig.border}
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    className="animate-spin"
                    style={{ animationDuration: "8s" }}
                  />
                )}

                {/* Node Main Circle */}
                <circle
                  r={baseRadius}
                  fill={colorConfig.fill}
                  stroke={isSelected ? "#ffffff" : colorConfig.border}
                  strokeWidth={isSelected ? 3 : 2}
                  filter={isSelected || isHovered ? "url(#nodeGlow)" : undefined}
                />

                {/* Pulsing indicator for active root or anomalies */}
                {(node.type === "Insight" || node.id === "merchant_root") && (
                  <circle
                    r={baseRadius - 4}
                    fill="none"
                    stroke={colorConfig.border}
                    strokeWidth="1.5"
                    className="animate-ping"
                    style={{ animationDuration: "3s" }}
                  />
                )}

                {/* Node Label Text */}
                <text
                  y={baseRadius + 14}
                  fill={isSelected ? "#ffffff" : "#cbd5e1"}
                  fontSize={node.id === "merchant_root" ? "11" : "9"}
                  fontWeight="bold"
                  textAnchor="middle"
                  className="pointer-events-none drop-shadow-md"
                >
                  {node.label.length > 20 ? node.label.substring(0, 18) + "…" : node.label}
                </text>

                {/* Node Type Pill */}
                <text
                  y={baseRadius + 24}
                  fill={colorConfig.border}
                  fontSize="7"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="pointer-events-none opacity-80"
                >
                  {node.type.toUpperCase()}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Legend Footer */}
      <div className="absolute bottom-3 left-4 z-10 flex items-center gap-3 bg-[#0c162d]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-navy-800 text-[10px] text-slate-400">
        <span className="font-extrabold uppercase text-slate-500 tracking-wider">Legend:</span>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.border }} />
            <span>{type}</span>
          </div>
        ))}
      </div>

      {/* Click Hint */}
      <div className="absolute bottom-3 right-4 z-10 flex items-center gap-1.5 text-[10px] text-slate-400 font-medium bg-[#0c162d]/80 px-2.5 py-1 rounded-xl border border-navy-800">
        <Info className="w-3 h-3 text-cyan-400" />
        <span>Click node to view connected memories</span>
      </div>
    </div>
  );
};
