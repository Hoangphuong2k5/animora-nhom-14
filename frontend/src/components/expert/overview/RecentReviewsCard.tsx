"use client";

import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { ROUTES } from "@/constants/config.constant";
import { ExpertPetOwner, ExpertReview } from "@/types/expert.type";

interface RecentReviewsCardProps {
  reviews: ExpertReview[];
  owners: ExpertPetOwner[];
}

export function RecentReviewsCard({ reviews, owners }: RecentReviewsCardProps) {
  return (
    <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <h3 className="font-heading font-extrabold text-sm text-zinc-900 dark:text-foreground">
            Đánh Giá Mới Nhất Từ Khách Hàng
          </h3>
        </div>
        <Link
          href={ROUTES.EXPERT_REVIEWS}
          className="text-xs font-bold text-[#6B1F2E] dark:text-[#FF7F6B] hover:underline"
        >
          Xem tất cả đánh giá →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {reviews.map((rev) => {
          const owner = owners.find((o) => o.id === rev.ownerId);
          return (
            <div
              key={rev.id}
              className="p-3.5 rounded-2xl bg-zinc-50/70 dark:bg-muted/60 border border-zinc-100 dark:border-border space-y-2 text-xs flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 dark:text-foreground">
                    {owner?.fullName || "Khách hàng"}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-zinc-600 dark:text-foreground/80 leading-relaxed italic line-clamp-3">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>
              <span className="text-[10px] text-zinc-400">{rev.createdAt}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

