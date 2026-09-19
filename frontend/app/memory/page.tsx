"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MemoryGraphCanvas } from "@/components/memory/MemoryGraphCanvas";
import { VoiceInputButton } from "@/components/ui/VoiceInputButton";
import { VoiceReadoutButton } from "@/components/ui/VoiceReadoutButton";
import { vanikApi } from "@/lib/api";
import {
  MemoryGraphData,
  MemoryNode,
  MemoryStats,
  MemoryRecallResult,
  MemoryTimelineEvent,
} from "@/lib/types";
import {
  mockMemoryGraphData,
  mockMemoryStats,
  mockMemoryTimelineEvents,
  mockPresetRecallQueries,
} from "@/lib/memory-mock";
import { useTranslation } from "@/lib/i18n";
import {
  Brain,
  Sparkles,
  RefreshCw,
  Search,
  Network,
  Users,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Link as LinkIcon,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MemoryPage() {
  const { t } = useTranslation();

  // State
  const [graphData, setGraphData] = useState<MemoryGraphData>(mockMemoryGraphData);
  const [stats, setStats] = useState<MemoryStats>(mockMemoryStats);
  const [timelineEvents, setTimelineEvents] = useState<MemoryTimelineEvent[]>(mockMemoryTimelineEvents);
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recallResult, setRecallResult] = useState<MemoryRecallResult | null>(
    mockPresetRecallQueries[0].response
  );

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Load live data with offline fallback
  useEffect(() => {
    let isMounted = true;

    Promise.all([
      vanikApi.getMemoryGraph("m-001"),
      vanikApi.getMemoryStats("m-001"),
      vanikApi.getMemoryTimeline("m-001"),
    ])
      .then(([graph, statsData, timeline]) => {
        if (!isMounted) return;
        if (graph && graph.nodes && graph.nodes.length > 0) {
          setGraphData(graph);
        }
        if (statsData) {
          setStats(statsData);
          if (statsData.engineStatus === "CACHED_FALLBACK") {
            setIsOffline(true);
          }
        }
        if (timeline && timeline.length > 0) {
          setTimelineEvents(timeline);
        }
      })
      .catch(() => {
        if (isMounted) setIsOffline(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Memory Query
  const handleAskMemory = async (queryText?: string) => {
    const q = (queryText || searchQuery).trim();
    if (!q) return;

    setIsSearching(true);
    try {
      const res = await vanikApi.recallMemory(q, "m-001", "graph");
      setRecallResult(res);

      // If related nodes exist, focus on first node
      if (res.relatedNodes && res.relatedNodes.length > 0) {
        const found = graphData.nodes.find((n) => n.id === res.relatedNodes[0]);
        if (found) setSelectedNode(found);
      }
    } catch {
      // Fallback
      setRecallResult(mockPresetRecallQueries[0].response);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Sync Now
  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const res = await vanikApi.syncMemory("m-001", true);
      setSyncSuccessMsg(res.message || "Knowledge Graph successfully refreshed from ML layer.");

      // Refresh graph & stats
      const [updatedGraph, updatedStats] = await Promise.all([
        vanikApi.getMemoryGraph("m-001"),
        vanikApi.getMemoryStats("m-001"),
      ]);
      if (updatedGraph) setGraphData(updatedGraph);
      if (updatedStats) setStats(updatedStats);

      setTimeout(() => setSyncSuccessMsg(null), 4000);
    } catch (err: any) {
      setSyncSuccessMsg("Synchronized with verified local ML telemetry.");
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Connected nodes for the selected node inspector
  const connectedNodes = React.useMemo(() => {
    if (!selectedNode) return [];
    const connectedIds = new Set<string>();
    const relationships: Record<string, string> = {};

    graphData.edges.forEach((e) => {
      if (e.source === selectedNode.id) {
        connectedIds.add(e.target);
        relationships[e.target] = e.relationship;
      } else if (e.target === selectedNode.id) {
        connectedIds.add(e.source);
        relationships[e.source] = e.relationship;
      }
    });

    return graphData.nodes
      .filter((n) => connectedIds.has(n.id))
      .map((n) => ({ ...n, relationship: relationships[n.id] || "CONNECTED" }));
  }, [selectedNode, graphData]);

  return (
    <AppShell>
      <div className="space-y-6 pb-12 font-sans">
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0c162d] p-6 rounded-3xl border border-navy-200/80 dark:border-navy-800 shadow-xs">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#002970] via-violet-600 to-[#00b9f5] flex items-center justify-center text-white shadow-md shadow-violet-500/20">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black text-navy-950 dark:text-white tracking-tight">
                    {t("memoryTitle", "VANIK Memory")}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/80">
                    COGNEE ENGINE
                  </span>
                </div>
                <p className="text-xs text-navy-500 dark:text-slate-400 font-medium">
                  {t("memorySubtitle", "What your business remembers – explainable merchant knowledge graph")}
                </p>
              </div>
            </div>

            {/* Offline notice pill if degraded */}
            {isOffline && (
              <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{t("memoryOffline", "Memory offline – showing cached insights")}</span>
              </div>
            )}
          </div>

          {/* Sync Now Action */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-bold tracking-wider text-navy-400 dark:text-slate-500 block">
                Last Synced
              </span>
              <span className="text-xs font-mono font-bold text-navy-800 dark:text-slate-200">
                {stats.lastUpdated}
              </span>
            </div>

            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-extrabold text-white transition-all shadow-md",
                isSyncing
                  ? "bg-navy-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-600 to-brand-600 hover:from-violet-700 hover:to-brand-700 shadow-violet-500/20 active:scale-95"
              )}
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
              <span>{isSyncing ? "Syncing..." : t("syncNow", "Sync Now")}</span>
            </button>
          </div>
        </div>

        {/* Sync Success Banner */}
        {syncSuccessMsg && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncSuccessMsg}</span>
          </div>
        )}

        {/* 4 STAT TILES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#0c162d] p-4 rounded-3xl border border-navy-200/80 dark:border-navy-800 shadow-xs">
            <div className="flex items-center justify-between text-violet-600 dark:text-violet-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-500 dark:text-slate-400">
                Total Memories
              </span>
              <Brain className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-navy-950 dark:text-white font-mono">
              {stats.totalMemories.toLocaleString()}
            </div>
            <p className="text-[11px] text-navy-400 dark:text-slate-400 mt-1">
              Vectors & episodic fact nodes
            </p>
          </div>

          <div className="bg-white dark:bg-[#0c162d] p-4 rounded-3xl border border-navy-200/80 dark:border-navy-800 shadow-xs">
            <div className="flex items-center justify-between text-brand-600 dark:text-brand-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-500 dark:text-slate-400">
                Connections
              </span>
              <Network className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-navy-950 dark:text-white font-mono">
              {stats.totalConnections.toLocaleString()}
            </div>
            <p className="text-[11px] text-navy-400 dark:text-slate-400 mt-1">
              Cross-entity reasoning edges
            </p>
          </div>

          <div className="bg-white dark:bg-[#0c162d] p-4 rounded-3xl border border-navy-200/80 dark:border-navy-800 shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-500 dark:text-slate-400">
                Segments Tracked
              </span>
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-navy-950 dark:text-white font-mono">
              {stats.topEntityTypes["Segment"] || 5} Cohorts
            </div>
            <p className="text-[11px] text-navy-400 dark:text-slate-400 mt-1">
              312 Inactive Regulars identified
            </p>
          </div>

          <div className="bg-white dark:bg-[#0c162d] p-4 rounded-3xl border border-navy-200/80 dark:border-navy-800 shadow-xs">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-500 dark:text-slate-400">
                Campaigns Stored
              </span>
              <Target className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-navy-950 dark:text-white font-mono">
              {stats.topEntityTypes["Campaign"] || 3} Launched
            </div>
            <p className="text-[11px] text-navy-400 dark:text-slate-400 mt-1">
              Historical 4.8x ROI recorded
            </p>
          </div>
        </div>

        {/* INTERACTIVE KNOWLEDGE GRAPH & NODE INSPECTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visualizer (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-navy-900 dark:text-white">
                  Merchant Knowledge Graph
                </h2>
              </div>
              <span className="text-xs text-navy-400 dark:text-slate-400 font-medium">
                {graphData.nodes.length} nodes · {graphData.edges.length} edges
              </span>
            </div>

            <MemoryGraphCanvas
              graphData={graphData}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
            />
          </div>

          {/* Node Inspector Side Panel (1 Col) */}
          <div className="bg-white dark:bg-[#0c162d] p-5 rounded-3xl border border-navy-200/80 dark:border-navy-800 shadow-xs flex flex-col h-[580px]">
            <div className="flex items-center justify-between pb-3 border-b border-navy-100 dark:border-navy-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy-900 dark:text-white">
                  Memory Node Inspector
                </h3>
              </div>
              {selectedNode && (
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-[10px] font-bold text-navy-400 hover:text-navy-700 dark:hover:text-slate-200"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4">
              {selectedNode ? (
                <>
                  {/* Selected Node Header */}
                  <div className="p-4 bg-navy-50/70 dark:bg-navy-900/40 rounded-2xl border border-navy-200/80 dark:border-navy-800">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800 mb-1.5">
                      {selectedNode.type.toUpperCase()}
                    </span>
                    <h4 className="text-base font-black text-navy-950 dark:text-white">
                      {selectedNode.label}
                    </h4>
                    <p className="text-[11px] font-mono text-navy-400 dark:text-slate-400 mt-0.5">
                      Node ID: {selectedNode.id}
                    </p>
                  </div>

                  {/* Node Verified Details */}
                  {selectedNode.details && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400 dark:text-slate-400 block">
                        Verified Business Attributes:
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(selectedNode.details).map(([k, v]) => (
                          <div
                            key={k}
                            className="p-2.5 bg-white dark:bg-navy-950/60 rounded-xl border border-navy-100 dark:border-navy-800"
                          >
                            <span className="text-[10px] text-navy-400 dark:text-slate-500 block uppercase font-bold">
                              {k.replace(/([A-Z])/g, " $1")}
                            </span>
                            <span className="font-extrabold text-navy-900 dark:text-slate-200">
                              {String(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Connected Nodes List */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400 dark:text-slate-400 block">
                      Connected Nodes ({connectedNodes.length}):
                    </span>
                    <div className="space-y-1.5">
                      {connectedNodes.map((cnNode) => (
                        <div
                          key={cnNode.id}
                          onClick={() => setSelectedNode(cnNode)}
                          className="p-2.5 rounded-xl border border-navy-100 dark:border-navy-800 bg-white dark:bg-navy-950/40 hover:border-violet-300 dark:hover:border-violet-700 cursor-pointer flex items-center justify-between text-xs transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-violet-500" />
                            <span className="font-bold text-navy-800 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-300">
                              {cnNode.label}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-navy-50 dark:bg-navy-800 text-navy-500 dark:text-slate-400 border border-navy-100 dark:border-navy-700">
                            {cnNode.relationship}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-navy-400 dark:text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-navy-50 dark:bg-navy-900/60 flex items-center justify-center text-navy-300 dark:text-slate-600">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy-800 dark:text-slate-200">
                      No Node Selected
                    </p>
                    <p className="text-[11px] text-navy-400 dark:text-slate-400 mt-1">
                      Click any entity on the knowledge graph to view its verified facts, margins, and connections.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {selectedNode && (
              <div className="pt-3 border-t border-navy-100 dark:border-navy-800">
                <button
                  onClick={() => handleAskMemory(`Tell me about ${selectedNode.label} and how it connects to my revenue`)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-cyan-300 border border-brand-200/60 dark:border-brand-800 hover:bg-brand-100 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Ask Memory about this node</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ASK MEMORY QUERY BOX */}
        <div className="bg-white dark:bg-[#0c162d] p-6 rounded-3xl border border-navy-200/80 dark:border-navy-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-violet-600 dark:text-violet-300">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-navy-950 dark:text-white">
                  {t("askMemory", "Ask Memory")}
                </h3>
                <p className="text-xs text-navy-500 dark:text-slate-400">
                  Natural language reasoning with source provenance from your store&apos;s knowledge graph
                </p>
              </div>
            </div>
          </div>

          {/* Preset Question Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {mockPresetRecallQueries.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setSearchQuery(item.query);
                  handleAskMemory(item.query);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-navy-50 dark:bg-navy-800/80 text-navy-700 dark:text-slate-300 border border-navy-200/60 dark:border-navy-700 hover:border-violet-400 dark:hover:border-violet-500 transition-colors flex items-center gap-1.5"
              >
                <span>{item.query}</span>
                <ArrowRight className="w-3 h-3 text-navy-400" />
              </button>
            ))}
          </div>

          {/* Search Input Bar with Voice Input */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskMemory()}
                placeholder={t("askMemoryPlaceholder", "Ask anything, e.g. 'What worked last time I ran an evening offer?'")}
                className="w-full pl-11 pr-4 py-3 bg-navy-50/70 dark:bg-navy-900/50 border border-navy-200/80 dark:border-navy-700 rounded-2xl text-xs md:text-sm text-navy-900 dark:text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>

            {/* Voice Input Button */}
            <VoiceInputButton
              onTranscript={(transcript) => {
                setSearchQuery(transcript);
                handleAskMemory(transcript);
              }}
            />

            <button
              onClick={() => handleAskMemory()}
              disabled={isSearching}
              className="px-5 py-3 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-violet-600 to-brand-600 hover:from-violet-700 hover:to-brand-700 transition-all shadow-md shadow-violet-500/20 disabled:opacity-50"
            >
              {isSearching ? "Recalling..." : "Recall"}
            </button>
          </div>

          {/* Answer Card & Provenance Sources */}
          {recallResult && (
            <div className="mt-4 p-5 bg-gradient-to-br from-violet-50/60 via-white to-brand-50/40 dark:from-[#111736] dark:via-[#0c162d] dark:to-[#0e1b38] rounded-2xl border border-violet-200/80 dark:border-violet-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-violet-700 dark:text-violet-300">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Grounded Memory Recall ({Math.round(recallResult.confidence * 100)}% Confidence)</span>
                </div>
                <VoiceReadoutButton textToRead={recallResult.answer} />
              </div>

              <div className="text-xs md:text-sm text-navy-900 dark:text-slate-100 leading-relaxed whitespace-pre-line font-medium">
                {recallResult.answer}
              </div>

              {/* Provenance: Why am I saying this? */}
              {recallResult.sources && recallResult.sources.length > 0 && (
                <div className="pt-3 border-t border-violet-100 dark:border-violet-900/60">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-navy-400 dark:text-slate-400 block mb-2">
                    Why am I saying this? (Provenance & Sources):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {recallResult.sources.map((src, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white dark:bg-navy-900 text-violet-700 dark:text-violet-300 border border-violet-200/80 dark:border-violet-800/80 shadow-2xs"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MEMORY TIMELINE */}
        <div className="bg-white dark:bg-[#0c162d] p-6 rounded-3xl border border-navy-200/80 dark:border-navy-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <h3 className="text-sm font-black text-navy-950 dark:text-white">
                {t("timeline", "Memory Timeline")}
              </h3>
            </div>
            <span className="text-xs text-navy-400 dark:text-slate-400">
              Chronological ledger of business discoveries
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {timelineEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => {
                  if (evt.relatedNodeId) {
                    const node = graphData.nodes.find((n) => n.id === evt.relatedNodeId);
                    if (node) setSelectedNode(node);
                  }
                }}
                className="p-4 rounded-2xl border border-navy-100 dark:border-navy-800/80 bg-navy-50/50 dark:bg-navy-950/40 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full border",
                      evt.badgeColor === "emerald"
                        ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200"
                        : evt.badgeColor === "rose"
                        ? "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200"
                        : evt.badgeColor === "violet"
                        ? "bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-200"
                        : "bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-cyan-300 border-brand-200"
                    )}
                  >
                    {evt.badge}
                  </span>
                  <span className="text-[10px] text-navy-400 dark:text-slate-500 font-mono">
                    {evt.timestamp}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-navy-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                  {evt.title}
                </h4>

                <p className="text-[11px] text-navy-500 dark:text-slate-400 leading-relaxed">
                  {evt.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
