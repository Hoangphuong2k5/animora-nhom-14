"use client";

import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { CONFIG } from "@/constants/config.constant";
import { QUERY_KEYS } from "@/constants/query-keys.constant";

const INITIAL_POSTS_LIMIT = 6;
const POSTS_STEP_LIMIT = 4;

export interface PostItem {
  id: number;
  title: string;
  body: string;
}

export interface PostsPageResponse {
  posts: PostItem[];
  total: number;
  skip: number;
  limit: number;
}

interface PostsInfiniteListProps {
  initialData: PostsPageResponse;
  cachedAt: string;
}

export default function PostsInfiniteList({
  initialData,
  cachedAt,
}: PostsInfiniteListProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    // Đính kèm cachedAt để khi bấm "Làm mới Cache ngay" trên Server, danh sách tự động đồng bộ lại từ đầu
    queryKey: [...QUERY_KEYS.posts.infinite, cachedAt],
    initialPageParam: { skip: 0, limit: INITIAL_POSTS_LIMIT },
    initialData: {
      pages: [initialData],
      pageParams: [{ skip: 0, limit: INITIAL_POSTS_LIMIT }],
    },
    queryFn: async ({ pageParam }) => {
      const res = await fetch(
        `${CONFIG.POSTS_API_URL}/posts?limit=${pageParam.limit}&skip=${pageParam.skip}`
      );
      if (!res.ok) {
        throw new Error("Không thể tải thêm bài viết");
      }
      return res.json() as Promise<PostsPageResponse>;
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (sum, page) => sum + page.posts.length,
        0
      );
      if (loadedCount >= lastPage.total) {
        return undefined;
      }
      return {
        skip: loadedCount,
        limit: POSTS_STEP_LIMIT,
      };
    },
  });

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const allPosts = data.pages.flatMap((page) => page.posts);
  const totalPosts = data.pages[0]?.total ?? allPosts.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
        <p>
          6 bài đầu phục vụ từ <code>&quot;use cache&quot;</code> (lúc:{" "}
          <strong>{cachedAt}</strong>)
        </p>
        <p>
          Đang hiển thị <strong>{allPosts.length}</strong> /{" "}
          <strong>{totalPosts}</strong> bài viết (init = {INITIAL_POSTS_LIMIT},
          step = {POSTS_STEP_LIMIT})
        </p>
      </div>

      <div className="space-y-3">
        {allPosts.map((post) => (
          <article key={post.id} className="p-4 rounded-xl border space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">{post.title}</h2>
              <span className="text-xs font-mono text-zinc-400">
                #{post.id}
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
              {post.body}
            </p>
          </article>
        ))}
      </div>

      <div ref={loadMoreRef} className="py-4 flex justify-center">
        {isFetchingNextPage ? (
          <div className="inline-flex items-center gap-2 text-xs text-zinc-500">
            <Spinner className="w-4 h-4" />
            <span>Đang tải thêm {POSTS_STEP_LIMIT} bài viết...</span>
          </div>
        ) : !hasNextPage ? (
          <p className="text-xs text-zinc-400">
            Đã hiển thị toàn bộ {totalPosts} bài viết.
          </p>
        ) : null}
      </div>
    </div>
  );
}
