import { Suspense } from "react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { refreshPostsCacheAction } from "@/actions/post.action";
import { Button } from "@/components/ui/button";
import { CONFIG } from "@/constants/config.constant";
import PostsInfiniteList, { type PostsPageResponse } from "./PostsInfiniteList";

const INITIAL_POSTS_LIMIT = 6;

export const metadata: Metadata = {
  title: "Bài viết mẫu (Cache Components + Infinite Scroll)",
};

async function getCachedInitialPosts(): Promise<{
  initialData: PostsPageResponse;
  cachedAt: string;
}> {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts:list");

  const res = await fetch(
    `${CONFIG.POSTS_API_URL}/posts?limit=${INITIAL_POSTS_LIMIT}&skip=0`
  );
  if (!res.ok) {
    throw new Error("Không thể tải danh sách bài viết");
  }
  const data: PostsPageResponse = await res.json();
  return {
    initialData: {
      posts: data.posts ?? [],
      total: data.total ?? 0,
      skip: data.skip ?? 0,
      limit: data.limit ?? INITIAL_POSTS_LIMIT,
    },
    cachedAt: new Date().toLocaleTimeString("vi-VN"),
  };
}

async function PostsList() {
  const { initialData, cachedAt } = await getCachedInitialPosts();

  return <PostsInfiniteList initialData={initialData} cachedAt={cachedAt} />;
}

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Danh Sách Bài Viết</h1>
          <p className="text-sm text-zinc-500">
            Kết hợp <code>&quot;use cache&quot;</code> (init = 6) + TanStack{" "}
            <code>useInfiniteQuery</code> (step = 4)
          </p>
        </div>

        <form action={refreshPostsCacheAction}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="cursor-pointer"
          >
            Làm mới Cache ngay
          </Button>
        </form>
      </div>

      <Suspense
        fallback={
          <p className="text-sm text-zinc-500">
            Đang tải danh sách bài viết...
          </p>
        }
      >
        <PostsList />
      </Suspense>
    </div>
  );
}
