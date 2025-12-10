/**
 * 数式表示コンポーネント
 * LaTeX形式の数式をKaTeXで描画
 */
"use client";

import { useEffect, useRef } from "react";
import katex from "katex";

interface FormulaDisplayProps {
  formula: string;
  label: string;
  displayMode?: boolean;
}

export default function FormulaDisplay({
  formula,
  label,
  displayMode = true,
}: FormulaDisplayProps) {
  const formulaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formulaRef.current && formula) {
      try {
        katex.render(formula, formulaRef.current, {
          displayMode,
          throwOnError: false,
          trust: true,
        });
      } catch (error) {
        console.error("KaTeX rendering error:", error);
      }
    }
  }, [formula, displayMode]);

  return (
    <div className="">
      {label && (
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <svg
            className="w-4 h-4 text-primary-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          {label}
        </h3>
      )}
      <div
        ref={formulaRef}
        className="text-slate-800"
        style={{ fontSize: "1.3em" }}
      />
    </div>
  );
}
