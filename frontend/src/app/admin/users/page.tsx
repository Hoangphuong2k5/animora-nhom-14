"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Shield,
  UserCheck,
  Search,
  KeyRound,
  Lock,
  Unlock,
  Sparkles,
  Phone,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import { UserAccount } from "@/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface AdminUserItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "admin" | "user";
  status: "active" | "locked";
  createdAt: string;
}

const DEFAULT_ACCOUNTS: AdminUserItem[] = [
  {
    id: "admin-root",
    fullName: "Animora Administrator",
    email: "admin@animora.vn",
    phone: "0900000001",
    role: "admin",
    status: "active",
    createdAt: "2026-01-01",
  },
  {
    id: "user-demo",
    fullName: "Animora User",
    email: "user@animora.vn",
    phone: "0900000002",
    role: "user",
    status: "active",
    createdAt: "2026-01-10",
  },
  {
    id: "user-thuy",
    fullName: "Phan Thị Đinh Thùy",
    email: "phanthidinhthuy6@gmail.com",
    phone: "0337203332",
    role: "user",
    status: "active",
    createdAt: "2026-01-15",
  },
  {
    id: "user-minhanh",
    fullName: "Nguyễn Minh Anh",
    email: "minhanh@animora.vn",
    phone: "0901234567",
    role: "user",
    status: "active",
    createdAt: "2026-02-01",
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const saved = safeGetStorage<AdminUserItem[]>("animora_admin_user_list", []);
    if (Array.isArray(saved) && saved.length > 0) {
      setUsers(saved);
    } else {
      setUsers(DEFAULT_ACCOUNTS);
      safeSetStorage("animora_admin_user_list", DEFAULT_ACCOUNTS);
    }
  }, []);

  const saveUsers = (updated: AdminUserItem[]) => {
    setUsers(updated);
    safeSetStorage("animora_admin_user_list", updated);
  };

  const handleToggleRole = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target?.email === "admin@animora.vn") {
      toast.error("Không thể hạ quyền tài khoản Root Administrator mặc định.");
      return;
    }

    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextRole = u.role === "admin" ? "user" : "admin";
        return { ...u, role: nextRole as "admin" | "user" };
      }
      return u;
    });

    saveUsers(updated);
    toast.success("Đã cập nhật phân quyền tài khoản thành công!");
  };

  const handleToggleLock = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target?.email === "admin@animora.vn") {
      toast.error("Không thể khóa tài khoản Root Administrator.");
      return;
    }

    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextStatus = u.status === "active" ? "locked" : "active";
        return { ...u, status: nextStatus as "active" | "locked" };
      }
      return u;
    });

    saveUsers(updated);
    toast.success("Đã thay đổi trạng thái tài khoản!");
  };

  const handleResetPassword = (email: string) => {
    toast.success(`Đã đặt lại mật khẩu của ${email} về '123456'!`);
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone && u.phone.includes(q));
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#6B1F2E] dark:text-[#F4B6C2]" />
            Quản Lý Người Dùng & Phân Quyền
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Quản lý tài khoản quản trị viên và khách hàng trong hệ sinh thái Animora
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm theo họ tên, email, số điện thoại..."
          className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-zinc-200 dark:border-border bg-white dark:bg-card text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF7F6B]"
        />
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
        <Table className="w-full text-left text-xs">
          <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200/80 dark:border-border">
            <TableRow className="hover:bg-transparent border-zinc-200/80 dark:border-border">
              <TableHead className="py-3 px-4 text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wider text-[11px]">Tài Khoản</TableHead>
              <TableHead className="py-3 px-4 text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wider text-[11px]">Số Điện Thoại</TableHead>
              <TableHead className="py-3 px-4 text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wider text-[11px]">Vai Trò (Role)</TableHead>
              <TableHead className="py-3 px-4 text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wider text-[11px]">Trạng Thái</TableHead>
              <TableHead className="py-3 px-4 text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wider text-[11px]">Ngày Tạo</TableHead>
              <TableHead className="py-3 px-4 text-right text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wider text-[11px]">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-zinc-100 dark:divide-border">
            {filteredUsers.map((u) => (
              <TableRow key={u.id} className="hover:bg-zinc-50/60 dark:hover:bg-muted/40 border-zinc-100 dark:border-border">
                <TableCell className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        u.role === "admin"
                          ? "bg-red-500 text-white"
                          : "bg-[#6B1F2E] text-white"
                      }`}
                    >
                      {u.fullName.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <div className="font-bold text-zinc-800 dark:text-foreground/90">{u.fullName}</div>
                      <div className="text-[11px] text-zinc-400">{u.email}</div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-3.5 px-4 text-zinc-600 dark:text-foreground/80">
                  {u.phone || "Chưa cập nhật"}
                </TableCell>

                <TableCell className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      u.role === "admin"
                        ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    {u.role.toUpperCase()}
                  </span>
                </TableCell>

                <TableCell className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.status === "active"
                        ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                        : "text-red-600 bg-red-50 dark:bg-red-950/40"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        u.status === "active" ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                    {u.status === "active" ? "Hoạt động" : "Bị khóa"}
                  </span>
                </TableCell>

                <TableCell className="py-3.5 px-4 text-zinc-400 text-[11px] font-mono">
                  {u.createdAt}
                </TableCell>

                <TableCell className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleRole(u.id)}
                      title={u.role === "admin" ? "Hạ quyền xuống User" : "Nâng quyền lên Admin"}
                      className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-border hover:bg-zinc-50 dark:hover:bg-muted text-[11px] font-bold cursor-pointer"
                    >
                      {u.role === "admin" ? "Hạ User" : "Lên Admin"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleLock(u.id)}
                      title={u.status === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-border hover:bg-zinc-50 dark:hover:bg-muted text-zinc-500 cursor-pointer"
                    >
                      {u.status === "active" ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleResetPassword(u.email)}
                      title="Đặt lại mật khẩu mặc định"
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-border hover:bg-zinc-50 dark:hover:bg-muted text-zinc-500 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
