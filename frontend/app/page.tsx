"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { DistributionInfo, CategoryType } from "@/types/distribution";
import { getDistributions } from "@/lib/api";
import { CATEGORY_LABELS } from "@/types/distribution";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SkeletonCard } from "@/components/Skeleton";

const CATEGORY_COLORS: Record<string, { border: string; badge: string }> = {
  continuous: { border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  discrete: { border: "border-violet-200", badge: "bg-violet-100 text-violet-700" },
  multivariate: { border: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
  ml_regression: { border: "border-blue-200", badge: "bg-blue-100 text-blue-700" },
  ml_classification: { border: "border-rose-200", badge: "bg-rose-100 text-rose-700" },
  ml_clustering: { border: "border-teal-200", badge: "bg-teal-100 text-teal-700" },
};

const CATEGORY_ICONS: Record<string, string> = {
  continuous: "M7 12l3-3 3 3 4-4",
  discrete: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  multivariate: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
  ml_regression: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  ml_classification: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  ml_clustering: "M17.657 18.657A8 8 0 016.343 7.343S7 9.828 7 12a5 5 0 005 5c2.172 0 4.172-.828 5.657-2.343z",
};

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.continuous;
}

export default function Home() {
  const [distributions, setDistributions] = useState<DistributionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchDistributions = async () => {
      try {
        const data = await getDistributions();
        setDistributions(data);
      } catch {
        toast.error("データの取得に失敗しました。バックエンドサーバーが起動しているか確認してください。");
      } finally {
        setLoading(false);
      }
    };
    fetchDistributions();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    distributions.forEach((d) => cats.add(d.category));
    return Array.from(cats);
  }, [distributions]);

  const filteredDistributions = useMemo(() => {
    return distributions.filter((dist) => {
      if (selectedCategory !== "all" && dist.category !== selectedCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          dist.name.toLowerCase().includes(q) ||
          dist.description.toLowerCase().includes(q) ||
          dist.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [distributions, selectedCategory, searchQuery]);

  const groupedDistributions = useMemo(() => {
    const grouped: Partial<Record<CategoryType, DistributionInfo[]>> = {};
    filteredDistributions.forEach((dist) => {
      if (!grouped[dist.category]) grouped[dist.category] = [];
      grouped[dist.category]!.push(dist);
    });
    return grouped;
  }, [filteredDistributions]);

  const distCount = distributions.filter((d) => !d.category.startsWith("ml_")).length;
  const mlCount = distributions.filter((d) => d.category.startsWith("ml_")).length;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50">
        {/* ヒーローセクション */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
                Data Science
                <span className="block text-emerald-400">Knowledge Visualization</span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
                確率分布と機械学習モデルをインタラクティブに可視化。
                パラメータをリアルタイムに操作しながら、数理モデルの挙動を直感的に理解できます。
              </p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                  </svg>
                  <span className="font-semibold">{distCount}</span>
                  <span className="text-slate-300">確率分布</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="font-semibold">{mlCount}</span>
                  <span className="text-slate-300">MLモデル</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ヘッダー: 検索 + カテゴリタブ */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 py-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="分布名やキーワードで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="分布を検索"
                  className="w-full px-4 py-2.5 pl-10 text-sm bg-slate-100 border-2 border-transparent rounded-xl
                           focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10
                           transition-all duration-200 placeholder-slate-400 text-slate-700"
                />
                <svg className="absolute left-3 top-3 h-5 w-5 text-slate-400"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                    selectedCategory === "all"
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  すべて
                </button>
                {categories.map((cat) => {
                  const colors = getCategoryColor(cat);
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                        isActive
                          ? `${colors.badge} shadow-md`
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={CATEGORY_ICONS[cat] || CATEGORY_ICONS.continuous} />
                      </svg>
                      {CATEGORY_LABELS[cat as CategoryType]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {loading && (
            <div className="space-y-16">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-7 w-40 bg-slate-200 rounded animate-pulse" />
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                </div>
              </div>
            </div>
          )}

          {!loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <div className="space-y-14">
                {Object.entries(groupedDistributions).map(([category, items]) => {
                  const colors = getCategoryColor(category);
                  return (
                    <motion.section
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${colors.badge}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={CATEGORY_ICONS[category] || CATEGORY_ICONS.continuous} />
                          </svg>
                          <h2 className="text-sm font-bold">
                            {CATEGORY_LABELS[category as CategoryType]}
                          </h2>
                        </div>
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                          {items!.length}件
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items!.map((dist, index) => {
                          const cardColors = getCategoryColor(dist.category);
                          return (
                            <motion.div
                              key={dist.type}
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: index * 0.06 }}
                            >
                              <Link
                                href={`/${dist.type}`}
                                className={`group relative block bg-white rounded-xl border ${cardColors.border} p-6
                                         hover:shadow-xl hover:shadow-slate-200/50
                                         hover:-translate-y-1 transition-all duration-300 ease-out h-full`}
                              >
                                <div className="flex flex-col h-full">
                                  <div className="flex items-start justify-between mb-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${cardColors.badge}`}>
                                      {CATEGORY_LABELS[dist.category as CategoryType]}
                                    </span>
                                    <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-primary-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-primary-600">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </div>
                                  </div>
                                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary-700 transition-colors mb-2">
                                    {dist.name}
                                  </h3>
                                  <p className="text-sm text-slate-500 leading-relaxed mb-5 line-clamp-3 flex-grow">
                                    {dist.description}
                                  </p>
                                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                                    <div className="flex flex-wrap gap-1.5">
                                      {dist.tags.slice(0, 3).map((tag) => (
                                        <span key={tag} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[11px] font-medium">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                    <span className="text-xs font-semibold text-primary-600 group-hover:text-primary-700 flex items-center gap-1 transition-colors">
                                      詳細
                                      <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </span>
                                  </div>
                                </div>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.section>
                  );
                })}
              </div>

              {Object.keys(groupedDistributions).length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">条件に一致する分布が見つかりません</h3>
                  <p className="text-slate-500 mb-6 max-w-sm">検索キーワードを変更するか、フィルターを解除してみてください。</p>
                  {(selectedCategory !== "all" || searchQuery) && (
                    <button
                      onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
                      className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold shadow-md shadow-primary-500/30"
                    >
                      すべてのフィルターをクリア
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
