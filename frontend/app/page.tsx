"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import type { DistributionInfo, CategoryType } from "@/types/distribution";
import { getDistributions } from "@/lib/api";
import { CATEGORY_LABELS } from "@/types/distribution";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Home() {
  const [distributions, setDistributions] = useState<DistributionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // 分布リストの取得
  useEffect(() => {
    const fetchDistributions = async () => {
      try {
        const data = await getDistributions();
        setDistributions(data);
      } catch (err) {
        console.error("Failed to fetch distributions:", err);
        setError(
          "データの取得に失敗しました。バックエンドサーバーが起動しているか確認してください。"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDistributions();
  }, []);

  // 全てのユニークなタグを取得
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    distributions.forEach((dist) => {
      dist.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [distributions]);

  // カテゴリごとにグループ化
  const groupedDistributions = useMemo(() => {
    const filtered = distributions.filter((dist) => {
      if (selectedTags.length > 0) {
        const hasSelectedTag = selectedTags.some((tag) =>
          dist.tags.includes(tag)
        );
        if (!hasSelectedTag) return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          dist.name.toLowerCase().includes(query) ||
          dist.description.toLowerCase().includes(query) ||
          dist.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });

    const grouped: Record<CategoryType, DistributionInfo[]> = {} as any;
    filtered.forEach((dist) => {
      if (!grouped[dist.category]) {
        grouped[dist.category] = [];
      }
      grouped[dist.category].push(dist);
    });

    return grouped;
  }, [distributions, selectedTags, searchQuery]);

  // タグの選択/解除
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="読み込み中..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {/* エラー表示 - 右上固定ポップアップ */}
      {error && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in-right max-w-md w-full">
          <div className="bg-white border-l-4 border-red-500 rounded-r-lg shadow-lg p-4 flex items-start gap-3">
            <div className="flex-shrink-0 text-red-500 mt-0.5">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-slate-50">
        {/* ヘッダー */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20">
            <div className="flex items-center justify-between h-full gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg shadow-sm flex items-center justify-center text-white">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                  確率分布可視化
                  <span className="hidden sm:inline text-slate-400 font-normal ml-2">
                    Visualizer
                  </span>
                </h1>
              </div>

              {/* 検索ボックス */}
              <div className="flex-1 max-w-lg">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="分布名やキーワードで検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 pl-11 text-sm bg-slate-100 border-2 border-transparent rounded-full 
                             focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 
                             transition-all duration-200 placeholder-slate-400 text-slate-700"
                  />
                  <svg
                    className="absolute left-3.5 top-3 h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* タグフィルター */}
          {allTags.length > 0 && (
            <div className="mb-10 animate-fade-in">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-500 mr-2">
                  フィルター:
                </span>
                {allTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`
                        px-3.5 py-1.5 text-sm rounded-full transition-all duration-200 border
                        ${
                          isSelected
                            ? "bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/20"
                            : "bg-white text-slate-600 border-slate-200 hover:border-primary-400 hover:text-primary-600"
                        }
                      `}
                    >
                      {tag}
                    </button>
                  );
                })}

                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="ml-2 text-sm text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    クリア
                  </button>
                )}
              </div>
            </div>
          )}

          {/* カテゴリごとに分類表示 */}
          <div className="space-y-16">
            {Object.entries(groupedDistributions).map(([category, items]) => (
              <section key={category} className="animate-fade-in-up">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    {CATEGORY_LABELS[category as CategoryType]}
                  </h2>
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {items.length}件
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((dist) => (
                    <Link
                      key={dist.type}
                      href={`/${dist.type}`}
                      className="group relative bg-white rounded-xl border border-slate-200 p-6 
                               hover:border-primary-400 hover:shadow-xl hover:shadow-primary-500/5 
                               hover:-translate-y-1 transition-all duration-300 ease-out"
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary-700 transition-colors">
                            {dist.name}
                          </h3>
                          <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-primary-600">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed mb-6 line-clamp-2 flex-grow">
                          {dist.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-auto">
                          {dist.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-100 rounded-md text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* 結果が0件の場合 */}
          {Object.keys(groupedDistributions).length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                条件に一致する分布が見つかりません
              </h3>
              <p className="text-slate-500 mb-6 max-w-sm">
                検索キーワードを変更するか、フィルターを解除してみてください。
              </p>
              {(selectedTags.length > 0 || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedTags([]);
                    setSearchQuery("");
                  }}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                           transition-colors text-sm font-semibold shadow-md shadow-primary-500/30"
                >
                  すべてのフィルターをクリア
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
