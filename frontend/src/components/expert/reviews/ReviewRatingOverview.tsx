"use client";

import React from "react";
import { Star } from "lucide-react";

interface ReviewRatingOverviewProps {
  avgRating: string;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export function ReviewRatingOverview({
  avgRating,
  totalReviews,
  ratingDistribution,
}: ReviewRatingOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Big Average Score */}
      <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Điểm Đánh Giá Trung Bình
        </span>
        <div className="text-5xl font-extrabold font-heading text-[#6B1F2E] dark:text-[#FF7F6B]">
          {avgRating}
        </div>
        <div className="flex items-center gap-1 text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-current" />
          ))}
        </div>
        <p className="text-xs text-zinc-400">Dựa trên {totalReviews} lượt đánh giá thực tế</p>
      </div>

      {/* 1-5 Star Progress Distribution */}
      <div className="md:col-span-2 rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-6 space-y-2.5 justify-center flex flex-col">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
          Phân Bố Số Sao Đánh Giá
        </span>
        {([5, 4, 3, 2, 1] as const).map((stars) => {
          const count = ratingDistribution[stars] || 0;
          const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
          return (
            <div key={stars} className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 w-12 shrink-0 font-bold text-zinc-700 dark:text-foreground/80">
                <span>{stars}</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
              <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-muted overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="w-16 text-right font-medium text-zinc-400 text-[11px]">
                {count} ({percent}%)
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

