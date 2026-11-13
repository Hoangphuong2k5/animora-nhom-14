import { Suspense } from "react";
import type { Metadata } from "next";
import { getCurrentUser } from "@/services/auth.service";
import { UserProfileCard } from "@/components/user/UserProfileCard";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân",
};

async function ProfileDetails() {
  const user = await getCurrentUser();
  return <UserProfileCard user={user} />;
}

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hồ Sơ Cá Nhân (Protected Route) 🔒</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Trang này được bảo vệ ngay từ tầng <code>src/proxy.ts</code>. Chỉ người dùng có phiên hợp lệ mới truy cập được.
        </p>
      </div>

      <Suspense fallback={<p className="text-sm text-zinc-500">Đang đọc thông tin hồ sơ...</p>}>
        <ProfileDetails />
      </Suspense>
    </div>
  );
}
