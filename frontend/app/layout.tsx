import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import Footer from "@/components/Footer";
import "./globals.css";
import "katex/dist/katex.min.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Data Science Knowledge Visualization",
  description: "確率分布と機械学習モデルをインタラクティブに可視化・学習するプラットフォーム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <div className="flex-1">
          {children}
        </div>
        <Footer />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
