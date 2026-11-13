import React from "react";
import type { User } from "@/types/auth.type";
import { User as UserIcon, Mail, Shield, Key } from "lucide-react";

interface UserProfileCardProps {
  user: User | null;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  if (!user) {
    return (
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center text-zinc-500">
        Không tìm thấy thông tin người dùng hoặc phiên đăng nhập đã hết hạn.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-2xl border border-amber-200 dark:border-amber-800">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img loading="lazy" decoding="async"
              src={user.avatar}
              alt={user.fullName || "User Avatar"}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            user.fullName?.charAt(0)?.toUpperCase() || <UserIcon className="w-8 h-8" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {user.fullName || "Người dùng"}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
            <Mail className="w-3.5 h-3.5" />
            {user.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <Key className="w-3.5 h-3.5" />
            User ID
          </div>
          <div className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200 font-mono">
            {user.id}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            Vai trò (Role)
          </div>
          <div className="mt-1 text-sm font-medium">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
              {user.role || "USER"}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
          Dữ liệu JSON phiên hiện tại
        </h3>
        <pre className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 font-mono text-xs overflow-x-auto text-zinc-700 dark:text-zinc-300">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
}

