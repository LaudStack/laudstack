"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown,
  TrendingUp, TrendingDown, Minus, Star, Eye, MousePointerClick,
  Bookmark, ThumbsUp, MessageSquare, ChevronLeft, ChevronRight,
  Info, Loader2, Settings2, BarChart3
} from "lucide-react";
import { getRankings, getAlgorithmWeights, triggerRankingRecalculation } from "@/app/actions/admin-system";
import { toast } from "sonner";

type ToolRow = {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  category: string;
  rankScore: number;
  averageRating: number;
  reviewCount: number;
  upvoteCount: number;
  saveCount: number;
  viewCount: number;
  outboundClickCount: number;
  weeklyRankChange: number | null;
  isFeatured: boolean;
  isSpotlighted: boolean;
  launchedAt: Date;
};

type AlgorithmWeight = {
  name: string;
  label: string;
  value: number;
  description: string;
  hasOverride: boolean;
};

type SortField = "rankScore" | "name" | "averageRating" | "reviewCount" | "upvoteCount" | "saveCount" | "viewCount" | "outboundClickCount" | "weeklyRankChange";

export default function RankingsPage() {
  const [tools, setTools] = useState<ToolRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortField>("rankScore");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [weights, setWeights] = useState<AlgorithmWeight[]>([]);
  const [showWeights, setShowWeights] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolRow | null>(null);
  const limit = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRankings({ search, sort, order, page, limit });
      setTools(data.tools as ToolRow[]);
      setTotal(data.total);
    } catch (e) {
      toast.error("Failed to load rankings");
    }
    setLoading(false);
  }, [search, sort, order, page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    getAlgorithmWeights().then(w => setWeights(w as AlgorithmWeight[])).catch(() => {});
  }, []);

  const handleSort = (field: SortField) => {
    if (sort === field) {
      setOrder(o => o === "desc" ? "asc" : "desc");
    } else {
      setSort(field);
      setOrder("desc");
    }
    setPage(1);
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const result = await triggerRankingRecalculation();
      if (result.success) {
        toast.success(`Rankings recalculated for ${result.updatedCount} tools`);
        load();
      } else {
        toast.error(result.message || "Recalculation failed");
      }
    } catch {
      toast.error("Failed to trigger recalculation");
    }
    setRecalculating(false);
  };

  const SortHeader = ({ field, label, icon: Icon }: { field: SortField; label: string; icon?: React.ElementType }) => (
    <th
      className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none whitespace-nowrap"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
        {sort === field ? (
          order === "desc" ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-30" />
        )}
      </div>
    </th>
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rankings</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor tool rankings, score breakdowns, and algorithm configuration</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWeights(!showWeights)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            Algorithm Weights
          </button>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${recalculating ? "animate-spin" : ""}`} />
            {recalculating ? "Recalculating..." : "Recalculate Now"}
          </button>
        </div>
      </div>

      {/* Algorithm Weights Panel */}
      {showWeights && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">Algorithm Weights</h2>
            <span className="text-xs text-gray-400 ml-2">These weights determine how each signal contributes to the final rank score</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {weights.map(w => (
              <div key={w.name} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{w.label}</span>
                    <span className="text-xs font-mono bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">×{w.value}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{w.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Final Score = (AvgRating × 25) + (Reviews × 15) + (Upvotes × 10) + (Saves × 8) + (Views × 0.1) + (Clicks × 5) + RecencyBoost + (Momentum × 20)
          </p>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search tools by name..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
        <span>{total} approved tools</span>
        <span className="text-gray-300">|</span>
        <span>Page {page} of {totalPages || 1}</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                <SortHeader field="name" label="Tool" />
                <SortHeader field="rankScore" label="Score" icon={BarChart3} />
                <SortHeader field="averageRating" label="Rating" icon={Star} />
                <SortHeader field="reviewCount" label="Reviews" icon={MessageSquare} />
                <SortHeader field="upvoteCount" label="Lauds" icon={ThumbsUp} />
                <SortHeader field="saveCount" label="Saves" icon={Bookmark} />
                <SortHeader field="viewCount" label="Views" icon={Eye} />
                <SortHeader field="outboundClickCount" label="Clicks" icon={MousePointerClick} />
                <SortHeader field="weeklyRankChange" label="Δ Week" icon={TrendingUp} />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-400 mt-2">Loading rankings...</p>
                  </td>
                </tr>
              ) : tools.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center text-sm text-gray-400">No tools found</td>
                </tr>
              ) : (
                tools.map((tool, i) => {
                  const rank = (page - 1) * limit + i + 1;
                  const change = tool.weeklyRankChange ?? 0;
                  return (
                    <tr
                      key={tool.id}
                      className="hover:bg-amber-50/30 cursor-pointer transition-colors"
                      onClick={() => setSelectedTool(selectedTool?.id === tool.id ? null : tool)}
                    >
                      <td className="px-3 py-3 text-sm font-mono text-gray-400">{rank}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {tool.logoUrl ? (
                            <img src={tool.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-gray-100" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                              {tool.name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                              {tool.name}
                              {tool.isFeatured && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">FEATURED</span>}
                              {tool.isSpotlighted && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">SPOTLIGHT</span>}
                            </div>
                            <div className="text-xs text-gray-400">{tool.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm font-semibold text-gray-900 font-mono">{tool.rankScore.toFixed(1)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm text-gray-700">{tool.averageRating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-700">{tool.reviewCount}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">{tool.upvoteCount}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">{tool.saveCount}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">{tool.viewCount.toLocaleString()}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">{tool.outboundClickCount}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          {change > 0 ? (
                            <>
                              <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                              <span className="text-sm font-medium text-green-600">+{change}</span>
                            </>
                          ) : change < 0 ? (
                            <>
                              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                              <span className="text-sm font-medium text-red-600">{change}</span>
                            </>
                          ) : (
                            <>
                              <Minus className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-sm text-gray-400">0</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Score Breakdown Panel */}
        {selectedTool && (
          <div className="border-t border-gray-200 bg-gray-50 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Score Breakdown — {selectedTool.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[
                { label: "Rating", value: selectedTool.averageRating, weight: 25, score: selectedTool.averageRating * 25 },
                { label: "Reviews", value: selectedTool.reviewCount, weight: 15, score: selectedTool.reviewCount * 15 },
                { label: "Lauds", value: selectedTool.upvoteCount, weight: 10, score: selectedTool.upvoteCount * 10 },
                { label: "Saves", value: selectedTool.saveCount, weight: 8, score: selectedTool.saveCount * 8 },
                { label: "Views", value: selectedTool.viewCount, weight: 0.1, score: selectedTool.viewCount * 0.1 },
                { label: "Clicks", value: selectedTool.outboundClickCount, weight: 5, score: selectedTool.outboundClickCount * 5 },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-lg border border-gray-100 p-3">
                  <div className="text-xs text-gray-500">{item.label} (×{item.weight})</div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">{item.score.toFixed(1)}</div>
                  <div className="text-xs text-gray-400">Raw: {typeof item.value === "number" ? item.value.toLocaleString() : item.value}</div>
                </div>
              ))}
              <div className="bg-amber-50 rounded-lg border border-amber-200 p-3">
                <div className="text-xs text-amber-600 font-medium">Total Score</div>
                <div className="text-lg font-bold text-amber-700 mt-1">{selectedTool.rankScore.toFixed(1)}</div>
                <div className="text-xs text-amber-500">+ recency & momentum</div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
