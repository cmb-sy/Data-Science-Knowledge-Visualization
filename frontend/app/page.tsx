/**
 * トップページ - 確率分布・機械学習モデル一覧
 * カテゴリごとに階層的に表示し、タグでフィルタリング可能
 */
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
          "確率分布の取得に失敗しました。バックエンドが起動しているか確認してください。"
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
      // タグフィルタリング
      if (selectedTags.length > 0) {
        const hasSelectedTag = selectedTags.some((tag) =>
          dist.tags.includes(tag)
        );
        if (!hasSelectedTag) return false;
      }

      // 検索クエリフィルタリング
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="確率分布を読み込み中..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <main className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダー */}
          <header className="mb-12 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              数理・統計・機械学習モデル可視化システム
            </h1>
          </header>

          {/* エラー表示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* 検索とフィルタリング */}
          <div className="mb-8 space-y-4">
            {/* 検索ボックス */}
            <div>
              <input
                type="text"
                placeholder="名前やタグで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* タグフィルター */}
            {allTags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  タグでフィルター:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-primary-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 選択中のタグを表示 */}
            {selectedTags.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">選択中:</span>
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => toggleTag(tag)}
                      className="hover:text-primary-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  すべてクリア
                </button>
              </div>
            )}
          </div>

          {/* カテゴリごとに分類表示 */}
          <div className="space-y-8">
            {Object.entries(groupedDistributions).map(([category, items]) => (
              <section key={category}>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-primary-500">
                  {CATEGORY_LABELS[category as CategoryType]}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({items.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((dist) => (
                    <Link
                      key={dist.type}
                      href={`/${dist.type}`}
                      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-primary-400 transform hover:-translate-y-1"
                    >
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {dist.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {dist.description}
                        </p>
                        {/* タグ表示 */}
                        {dist.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {dist.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* 結果が0件の場合 */}
          {Object.keys(groupedDistributions).length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                条件に一致する分布・モデルが見つかりませんでした。
              </p>
              {(selectedTags.length > 0 || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedTags([]);
                    setSearchQuery("");
                  }}
                  className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  フィルターをクリア
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </ErrorBoundary>
  );
}
