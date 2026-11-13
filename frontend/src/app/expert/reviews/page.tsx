"use client";

import React, { useState, useMemo } from "react";
import {
  Flag,
  Search,
  Star,
} from "lucide-react";
import { useExpert } from "@/components/expert/ExpertProvider";
import { ReviewRatingOverview } from "@/components/expert/reviews/ReviewRatingOverview";
import { ReviewReportModal } from "@/components/expert/reviews/ReviewReportModal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpertReview } from "@/types/expert.type";
import { toast } from "sonner";

const RATING_FILTER_TABS = [
  { val: "all", label: "Tất cả" },
  { val: "5", label: "5 sao" },
  { val: "4", label: "4 sao" },
  { val: "3", label: "3 sao" },
  { val: "2", label: "2 sao" },
  { val: "1", label: "1 sao" },
];

export default function ExpertReviewsPage() {
  const { store, allOwners, allServices } = useExpert();

  const [filterRating, setFilterRating] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Report violation modal
  const [reportingReview, setReportingReview] = useState<ExpertReview | null>(null);

  // Review statistics
  const totalReviews = store.reviews.length;
  const avgRating =
    totalReviews > 0
      ? (
          store.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        ).toFixed(1)
      : "5.0";

  const ratingDistribution = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    store.reviews.forEach((r) => {
      if (counts[r.rating] !== undefined) counts[r.rating]++;
    });
    return counts;
  }, [store.reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return store.reviews.filter((r) => {
      if (filterRating !== "all" && r.rating !== parseInt(filterRating)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const o = allOwners.find((ow) => ow.id === r.ownerId);
        return (
          r.comment.toLowerCase().includes(q) ||
          (o?.fullName || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [store.reviews, filterRating, searchQuery, allOwners]);

  const handleSendReport = (reason: string) => {
    if (!reportingReview) return;

    reportingReview.reported = {
      reason,
      at: new Date().toISOString().slice(0, 10),
      status: "sent",
    };

    toast.success("Đã gửi báo cáo vi phạm tới Ban Quản trị Animora!");
    setReportingReview(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-zinc-900 dark:text-foreground">
          Đánh Giá & Nhận Xét Từ Khách Hàng
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Theo dõi độ hài lòng của khách hàng và gửi báo cáo khi phát hiện nhận xét sai phạm.
        </p>
      </div>

      {/* Summary Score & Distribution Cards (Sub-Component) */}
      <ReviewRatingOverview
        avgRating={avgRating}
        totalReviews={totalReviews}
        ratingDistribution={ratingDistribution}
      />

      {/* Filter and Reviews List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Star Filter */}
          <Tabs
            value={filterRating}
            onValueChange={(val) => {
              if (val !== null && val !== undefined) setFilterRating(String(val));
            }}
          >
            <TabsList className="h-auto flex-wrap justify-start gap-1.5 p-1 rounded-2xl bg-zinc-100/80 dark:bg-card/80 border border-zinc-200/80 dark:border-border">
              {RATING_FILTER_TABS.map((f) => (
                <TabsTrigger
                  key={f.val}
                  value={f.val}
                  className="h-auto px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E] data-active:text-white dark:data-active:bg-[#6B1F2E] dark:data-active:text-white data-active:shadow-sm transition-all"
                >
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Search by content */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo nội dung nhận xét..."
              className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-zinc-900 dark:text-foreground"
            />
          </div>
        </div>

        {/* Reviews Cards List */}
        <div className="space-y-3">
          {filteredReviews.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-400 rounded-3xl border border-dashed border-zinc-200 dark:border-border">
              Không tìm thấy đánh giá nào phù hợp với bộ lọc.
            </div>
          ) : (
            filteredReviews.map((rev) => {
              const owner = allOwners.find((o) => o.id === rev.ownerId);
              const service = allServices.find((s) => s.id === rev.serviceId);

              return (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B] font-bold flex items-center justify-center">
                        {owner?.fullName?.charAt(0) || "K"}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-foreground">
                          {owner?.fullName || "Khách hàng"}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          Dịch vụ: {service?.name.vi} • Ngày: {rev.createdAt}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>

                      {/* Report button */}
                      {rev.reported ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                          Đã gửi Admin xem xét
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReportingReview(rev)}
                          title="Báo cáo đánh giá sai phạm cho Admin"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-zinc-700 dark:text-foreground/80 leading-relaxed text-xs pl-10">
                    {rev.comment}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Báo Cáo Đánh Giá Cho Admin (Sub-Component) */}
      <ReviewReportModal
        review={reportingReview}
        onClose={() => setReportingReview(null)}
        onSubmit={handleSendReport}
      />
    </div>
  );
}
