"use server";

import { updateTag } from "next/cache";

export async function refreshPostsCacheAction(): Promise<void> {
  // Xóa ngay lập tức vùng cache gắn nhãn "posts:list" (Read-your-own-writes)
  updateTag("posts:list");
}
