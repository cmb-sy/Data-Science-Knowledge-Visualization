/**
 * トップページ: 分布一覧 → 各分布ページへ遷移
 */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DistributionInfo } from "@/types/distribution";
import { getDistributions } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Home() {
  const [distributions, setDistributions] = useState<DistributionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getDistributions();
        setDistributions(data);
      } catch (err) {
        console.error(err);
        setError("分布一覧の取得に失敗しました。APIを確認してください。");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ErrorBoundary>
      <main className="min-h-screen p-6">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              確率分布を選択
            </h1>
            <p className="text-gray-600">
              一覧から分布を選ぶと、詳細ページ（例: 一様分布）へ遷移します。
            </p>
          </header>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {loading && <LoadingSpinner message="分布を読み込み中..." />}

          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {distributions.map((dist) => (
                <Link
                  key={dist.type}
                  href={`/${dist.type}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition"
                >
                  <h2 className="text-xl font-semibold text-gray-900">
                    {dist.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                    {dist.description}
                  </p>
                  <span className="text-primary-600 text-sm mt-2 inline-flex items-center gap-1">
                    ページへ移動 →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </ErrorBoundary>
  );
}
