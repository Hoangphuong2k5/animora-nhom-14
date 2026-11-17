"use client";

import React, { useState, useEffect } from "react";
import {
    Users,
    Shield,
    Search,
    KeyRound,
    Lock,
    Unlock,
    Sparkles,
    Phone,
    Mail,
    Plus,
    Building2,
    Package,
    Stethoscope,
    Scissors,
    HeartHandshake,
    UserCheck,
    CheckCircle2,
    ChevronRight,
    Filter,
} from "lucide-react";
import { toast } from "sonner";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { TablePagination, usePagination } from "@/components/ui/table-pagination";

export type SystemRole =
    | "admin"
    | "manager"
    | "vet"
    | "care_staff"
    | "user"
    | "supplier"
    | "shelter";

export interface AdminUserItem {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    role: SystemRole;
    status: "active" | "locked";
    createdAt: string;
    supplierCode?: string;
    supplyCategory?: string;
}

export const ROLE_DETAILS: Record<
    SystemRole,
    { label: string; badgeClass: string; desc: string; icon: React.ElementType }
> = {
    admin: {
        label: "Quản trị viên (Admin)",
        badgeClass:
            "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-900",
        desc: "Cấu hình hệ thống, quản lý tài khoản, cấp quyền NCC",
        icon: Shield,
    },
    manager: {
        label: "Quản lý (Manager)",
        badgeClass:
            "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900",
        desc: "Vận hành lịch hẹn, nhân sự, kho bãi, duyệt ca",
        icon: UserCheck,
    },
    vet: {
        label: "Bác sĩ thú y",
        badgeClass:
            "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-900",
        desc: "Khám chữa bệnh, tiêm chủng, kê đơn thú cưng",
        icon: Stethoscope,
    },
    care_staff: {
        label: "Nhân viên CS / Groomer",
        badgeClass:
            "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900",
        desc: "Spa, tắm sấy, cắt tỉa grooming, chăm sóc nội trú",
        icon: Scissors,
    },
    user: {
        label: "Khách hàng",
        badgeClass:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900",
        desc: "Đặt lịch, mua sắm phụ kiện, nộp hồ sơ nhận nuôi",
        icon: Users,
    },
    supplier: {
        label: "Nhà cung cấp (Supplier)",
        badgeClass:
            "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900",
        desc: "Cung ứng thức ăn, thuốc thú y, dụng cụ y tế",
        icon: Building2,
    },
    shelter: {
        label: "Trạm cứu hộ",
        badgeClass:
            "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900",
        desc: "Đối tác liên kết nhận nuôi và cứu trợ động vật",
        icon: HeartHandshake,
    },
};

const DEFAULT_7_ROLES_ACCOUNTS: AdminUserItem[] = [
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
        id: "manager-root",
        fullName: "Animora Manager",
        email: "manager@animora.vn",
        phone: "0908888999",
        role: "manager",
        status: "active",
        createdAt: "2026-01-05",
    },
    {
        id: "vet-hoang",
        fullName: "BS. Lê Huy Hoàng",
        email: "vet.hoang@animora.vn",
        phone: "0918234567",
        role: "vet",
        status: "active",
        createdAt: "2026-01-08",
    },
    {
        id: "vet-toan",
        fullName: "BS. Ngô Phước Toàn",
        email: "vet.toan@animora.vn",
        phone: "0977889900",
        role: "vet",
        status: "active",
        createdAt: "2026-01-08",
    },
    {
        id: "vet-phuong",
        fullName: "BS. Nguyễn Thúc Hoàng Phương",
        email: "vet.phuong@animora.vn",
        phone: "0905667889",
        role: "vet",
        status: "active",
        createdAt: "2026-01-09",
    },
    {
        id: "care-thuy",
        fullName: "Phan Thị Đình Thùy",
        email: "care.thuy@animora.vn",
        phone: "0909112233",
        role: "care_staff",
        status: "active",
        createdAt: "2026-01-12",
    },
    {
        id: "care-tuananh",
        fullName: "Nguyễn Văn Tuấn Anh",
        email: "care.tuananh@animora.vn",
        phone: "0934556778",
        role: "care_staff",
        status: "active",
        createdAt: "2026-01-12",
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
        id: "user-minhanh",
        fullName: "Nguyễn Minh Anh",
        email: "minhanh@animora.vn",
        phone: "0901234567",
        role: "user",
        status: "active",
        createdAt: "2026-02-01",
    },
    {
        id: "sup-royal",
        fullName: "Công ty TNHH Royal Canin Việt Nam",
        email: "partner@royalcanin.vn",
        phone: "0283999888",
        role: "supplier",
        status: "active",
        createdAt: "2026-01-20",
        supplierCode: "SUP-ROYAL",
        supplyCategory: "Thức ăn dinh dưỡng & Hạt cao cấp",
    },
    {
        id: "sup-vemedim",
        fullName: "Công ty CP Dược Thú Y Vemedim",
        email: "distribution@vemedim.vn",
        phone: "0292388899",
        role: "supplier",
        status: "active",
        createdAt: "2026-01-22",
        supplierCode: "SUP-VMD",
        supplyCategory: "Thuốc thú y & Vaccine phòng bệnh",
    },
    {
        id: "shelter-sgtime",
        fullName: "Trạm Cứu Hộ Chó Mèo Sài Gòn Time",
        email: "sgtime.shelter@gmail.com",
        phone: "0987654321",
        role: "shelter",
        status: "active",
        createdAt: "2026-01-25",
    },
];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUserItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");

    // Supplier Creation Modal
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [supplierName, setSupplierName] = useState("");
    const [supplierCode, setSupplierCode] = useState("");
    const [supplierEmail, setSupplierEmail] = useState("");
    const [supplierPhone, setSupplierPhone] = useState("");
    const [supplyCategory, setSupplyCategory] = useState("Thức ăn dinh dưỡng");
    const [supplierPassword, setSupplierPassword] = useState("supplier123");

    // Edit Role Modal
    const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
    const [targetRole, setTargetRole] = useState<SystemRole>("user");

    useEffect(() => {
        let cancelled = false;
        queueMicrotask(() => {
            if (cancelled) return;
            const saved = safeGetStorage<AdminUserItem[]>(
                "animora_admin_user_list_v3",
                [],
            );
            if (Array.isArray(saved) && saved.length >= 7) {
                setUsers(saved);
            } else {
                setUsers(DEFAULT_7_ROLES_ACCOUNTS);
                safeSetStorage(
                    "animora_admin_user_list_v3",
                    DEFAULT_7_ROLES_ACCOUNTS,
                );
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const saveUsers = (updated: AdminUserItem[]) => {
        setUsers(updated);
        safeSetStorage("animora_admin_user_list_v3", updated);
    };

    const handleToggleLock = (userId: string) => {
        const target = users.find((u) => u.id === userId);
        if (!target || target.role === "admin") {
            toast.error("Không thể khóa tài khoản Quản trị viên (Admin).");
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

    const handleOpenEditRole = (user: AdminUserItem) => {
        if (user.role === "admin" || user.role === "manager") {
            toast.error(
                "Không thể thay đổi vai trò tài khoản Admin hoặc Manager.",
            );
            return;
        }
        setEditingUser(user);
        setTargetRole(user.role);
    };

    const handleSaveRole = () => {
        if (!editingUser) return;
        const updated = users.map((u) => {
            if (u.id === editingUser.id) {
                return { ...u, role: targetRole };
            }
            return u;
        });
        saveUsers(updated);
        toast.success(
            `Đã cập nhật vai trò của ${editingUser.fullName} thành ${ROLE_DETAILS[targetRole].label}!`,
        );
        setEditingUser(null);
    };

    const handleCreateSupplier = (e: React.FormEvent) => {
        e.preventDefault();
        if (!supplierName.trim() || !supplierEmail.trim()) {
            toast.error(
                "Vui lòng nhập đầy đủ tên nhà cung cấp và email đăng nhập!",
            );
            return;
        }

        const newSup: AdminUserItem = {
            id: `sup-${Date.now()}`,
            fullName: supplierName.trim(),
            email: supplierEmail.trim().toLowerCase(),
            phone: supplierPhone.trim() || undefined,
            role: "supplier",
            status: "active",
            createdAt: new Date().toISOString().split("T")[0],
            supplierCode:
                supplierCode.trim() ||
                `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
            supplyCategory,
        };

        const updated = [newSup, ...users];
        saveUsers(updated);
        toast.success(
            `Đã cấp tài khoản Supplier thành công cho ${newSup.fullName}! Mật khẩu khởi tạo: ${supplierPassword}`,
        );

        // Reset form
        setSupplierName("");
        setSupplierCode("");
        setSupplierEmail("");
        setSupplierPhone("");
        setSupplierPassword("supplier123");
        setIsSupplierModalOpen(false);
    };

    const filteredUsers = users.filter((u) => {
        const q = searchQuery.toLowerCase().trim();
        const matchSearch =
            !q ||
            u.fullName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.phone && u.phone.includes(q)) ||
            (u.supplierCode && u.supplierCode.toLowerCase().includes(q));

        const matchRole =
            selectedRoleFilter === "all" || u.role === selectedRoleFilter;

        return matchSearch && matchRole;
    });

    const {
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedItems: paginatedUsers,
    } = usePagination(filteredUsers, 5);

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* 1. Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
                        <Users className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
                        Người Dùng & Phân Quyền Hệ Thống
                    </h1>
                    <p className="text-xs text-zinc-500 mt-1">
                        Quản trị 7 nhóm người dùng: Khách hàng, Bác sĩ, Nhân
                        viên chăm sóc, Quản lý, Admin, Supplier & Trạm cứu hộ
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => setIsSupplierModalOpen(true)}
                        className="px-4 py-2.5 rounded-2xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Cấp tài khoản Supplier</span>
                    </button>
                </div>
            </div>

            {/* 2. Search, Role Filter & Count */}
            <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Tìm theo họ tên, email, số điện thoại, mã NCC..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF7F6B]"
                        />
                    </div>

                    <Select
                        value={selectedRoleFilter}
                        onValueChange={(val) => {
                            if (val) {
                                setSelectedRoleFilter(val);
                                setCurrentPage(1);
                            }
                        }}
                        items={{
                            all: "Tất cả vai trò",
                            ...Object.fromEntries(
                                (Object.keys(ROLE_DETAILS) as SystemRole[]).map((r) => [
                                    r,
                                    ROLE_DETAILS[r].label.split(" (")[0],
                                ]),
                            ),
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[210px] h-9 rounded-xl bg-zinc-50 dark:bg-muted border-zinc-200 dark:border-border text-xs font-semibold px-3">
                            <div className="flex items-center gap-2 truncate">
                                <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                Tất cả vai trò
                            </SelectItem>
                            {(Object.keys(ROLE_DETAILS) as SystemRole[]).map((r) => (
                                <SelectItem key={r} value={r}>
                                    {ROLE_DETAILS[r].label.split(" (")[0]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="text-xs text-zinc-500 shrink-0">
                    Hiển thị <strong>{filteredUsers.length}</strong> /{" "}
                    {users.length} tài khoản
                </div>
            </div>

            {/* 4. Users Table */}
            <div className="rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
                <Table className="w-full text-left text-xs">
                    <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200/80 dark:border-border">
                        <TableRow className="hover:bg-transparent border-zinc-200/80 dark:border-border">
                            <TableHead className="py-3 px-4 text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                                Tài Khoản / Chủ Sở Hữu
                            </TableHead>
                            <TableHead className="py-3 px-4 text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                                Số Điện Thoại
                            </TableHead>
                            <TableHead className="py-3 px-4 text-center text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                                Vai Trò
                            </TableHead>
                            <TableHead className="py-3 px-4 text-center text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                                Trạng Thái
                            </TableHead>
                            <TableHead className="py-3 px-4 text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                                Ngày Tạo
                            </TableHead>
                            <TableHead className="py-3 px-4 text-center text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                                Thao Tác Admin
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-zinc-100 dark:divide-border">
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="py-12 text-center text-zinc-400"
                                >
                                    Không tìm thấy tài khoản nào phù hợp với bộ
                                    lọc hiện tại.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedUsers.map((u) => {
                                const roleMeta =
                                    ROLE_DETAILS[u.role] || ROLE_DETAILS.user;
                                const RoleIcon = roleMeta.icon;

                                return (
                                    <TableRow
                                        key={u.id}
                                        className="hover:bg-zinc-50/60 dark:hover:bg-muted/40 border-zinc-100 dark:border-border transition-colors"
                                    >
                                        <TableCell className="py-3.5 px-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                                        u.role === "admin"
                                                            ? "bg-red-500 text-white"
                                                            : u.role ===
                                                                "manager"
                                                              ? "bg-indigo-600 text-white"
                                                              : u.role ===
                                                                  "supplier"
                                                                ? "bg-purple-600 text-white"
                                                                : "bg-[#6B1F2E] text-white"
                                                    }`}
                                                >
                                                    {u.fullName
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-800 dark:text-foreground flex items-center gap-1.5">
                                                        <span>
                                                            {u.fullName}
                                                        </span>
                                                        {u.supplierCode && (
                                                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                                                                {u.supplierCode}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                                                        <Mail className="w-3 h-3 text-zinc-400" />
                                                        <span>{u.email}</span>
                                                    </div>
                                                    {u.supplyCategory && (
                                                        <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                                                            Cung cấp:{" "}
                                                            {u.supplyCategory}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4 text-zinc-600 dark:text-foreground/80">
                                            {u.phone ? (
                                                <span className="flex items-center gap-1 font-mono text-[11px]">
                                                    <Phone className="w-3 h-3 text-zinc-400" />
                                                    {u.phone}
                                                </span>
                                            ) : (
                                                <span className="text-zinc-400 italic">
                                                    Chưa cập nhật
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4 text-center">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${roleMeta.badgeClass}`}
                                            >
                                                <RoleIcon className="w-3 h-3" />
                                                <span>{roleMeta.label}</span>
                                            </span>
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4 text-center">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                    u.status === "active"
                                                        ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900"
                                                        : "text-red-700 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900"
                                                }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                        u.status === "active"
                                                            ? "bg-emerald-500"
                                                            : "bg-red-500"
                                                    }`}
                                                />
                                                {u.status === "active"
                                                    ? "Đang hoạt động"
                                                    : "Đã khóa"}
                                            </span>
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4 text-zinc-400 text-[11px] font-mono">
                                            {formatDateDdMmYyyy(u.createdAt)}
                                        </TableCell>

                                        <TableCell className="py-3.5 px-4 text-center">
                                            <div className="inline-flex items-center justify-center gap-1.5">
                                                {u.role !== "admin" &&
                                                    u.role !== "manager" && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleOpenEditRole(
                                                                    u,
                                                                )
                                                            }
                                                            title="Đổi phân quyền người dùng"
                                                            className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-border hover:bg-zinc-100 dark:hover:bg-muted text-[11px] font-bold text-zinc-700 dark:text-foreground cursor-pointer transition-colors"
                                                        >
                                                            Đổi vai trò
                                                        </button>
                                                    )}

                                                {u.role !== "admin" && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleToggleLock(
                                                                u.id,
                                                            )
                                                        }
                                                        title={
                                                            u.status ===
                                                            "active"
                                                                ? "Khóa tài khoản"
                                                                : "Mở khóa tài khoản"
                                                        }
                                                        className={`p-1.5 rounded-lg border border-zinc-200 dark:border-border hover:bg-zinc-100 dark:hover:bg-muted transition-colors cursor-pointer ${
                                                            u.status ===
                                                            "locked"
                                                                ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                                                                : "text-zinc-500"
                                                        }`}
                                                    >
                                                        {u.status ===
                                                        "active" ? (
                                                            <Lock className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                                        )}
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleResetPassword(
                                                            u.email,
                                                        )
                                                    }
                                                    title="Đặt lại mật khẩu mặc định (123456)"
                                                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-border hover:bg-zinc-100 dark:hover:bg-muted text-zinc-500 cursor-pointer transition-colors"
                                                >
                                                    <KeyRound className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    tone="manager"
                    className="px-4 pb-4 mt-0"
                />
            </div>

            {/* MODAL 1: Cấp tài khoản Supplier */}
            <Dialog
                open={isSupplierModalOpen}
                onOpenChange={setIsSupplierModalOpen}
            >
                <DialogContent className="max-w-md p-6 bg-white dark:bg-card border-border rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
                            Cấp Tài Khoản Nhà Cung Cấp (Supplier)
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-500">
                            Cung cấp thông tin đối tác cung ứng thuốc, thức ăn
                            và vật tư cho hệ sinh thái Animora.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleCreateSupplier}
                        className="space-y-4 pt-2"
                    >
                        <div>
                            <label className="text-xs font-bold text-zinc-700 dark:text-foreground block mb-1">
                                Tên công ty / Doanh nghiệp đối tác{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={supplierName}
                                onChange={(e) =>
                                    setSupplierName(e.target.value)
                                }
                                placeholder="VD: Công ty TNHH Vemedim Thú Y"
                                className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF7F6B]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-zinc-700 dark:text-foreground block mb-1">
                                    Mã NCC (Code)
                                </label>
                                <input
                                    type="text"
                                    value={supplierCode}
                                    onChange={(e) =>
                                        setSupplierCode(
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="VD: SUP-VMD"
                                    className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-[#FF7F6B]"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-zinc-700 dark:text-foreground block mb-1">
                                    Số điện thoại đối tác
                                </label>
                                <input
                                    type="tel"
                                    value={supplierPhone}
                                    onChange={(e) =>
                                        setSupplierPhone(e.target.value)
                                    }
                                    placeholder="VD: 0292388899"
                                    className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF7F6B]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-zinc-700 dark:text-foreground block mb-1">
                                Email đăng nhập{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                required
                                value={supplierEmail}
                                onChange={(e) =>
                                    setSupplierEmail(e.target.value)
                                }
                                placeholder="VD: partner@vemedim.vn"
                                className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF7F6B]"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-zinc-700 dark:text-foreground block mb-1">
                                Nhóm hàng cung ứng chính
                            </label>
                            <Select
                                value={supplyCategory}
                                onValueChange={(val) => {
                                    if (val) setSupplyCategory(val);
                                }}
                            >
                                <SelectTrigger className="w-full text-xs">
                                    <SelectValue placeholder="Chọn nhóm hàng" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Thức ăn dinh dưỡng">
                                        Thức ăn dinh dưỡng & Hạt thú cưng
                                    </SelectItem>
                                    <SelectItem value="Thuốc thú y & Vaccine">
                                        Thuốc thú y, Kháng sinh & Vaccine
                                    </SelectItem>
                                    <SelectItem value="Phụ kiện & Đồ chơi">
                                        Phụ kiện dắt, lồng chuồng & Đồ chơi
                                    </SelectItem>
                                    <SelectItem value="Dụng cụ y tế & Spa">
                                        Dụng cụ y tế thú y & Hóa mỹ phẩm Spa
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-zinc-700 dark:text-foreground block mb-1">
                                Mật khẩu khởi tạo ban đầu
                            </label>
                            <input
                                type="text"
                                value={supplierPassword}
                                onChange={(e) =>
                                    setSupplierPassword(e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-[#FF7F6B]"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3">
                            <button
                                type="button"
                                onClick={() => setIsSupplierModalOpen(false)}
                                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-border text-xs font-bold text-zinc-600 dark:text-foreground hover:bg-zinc-50 dark:hover:bg-muted cursor-pointer"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white text-xs font-bold shadow-md cursor-pointer"
                            >
                                Cấp tài khoản Supplier
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL 2: Thay đổi phân quyền Role */}
            <Dialog
                open={!!editingUser}
                onOpenChange={(open) => !open && setEditingUser(null)}
            >
                <DialogContent className="max-w-md p-6 bg-white dark:bg-card border-border rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2">
                            <Shield className="w-5 h-5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
                            Phân Quyền Người Dùng
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-500">
                            Chọn một trong 7 vai trò hệ thống quy định trong tài
                            liệu nghiệp vụ Animora.
                        </DialogDescription>
                    </DialogHeader>

                    {editingUser && (
                        <div className="space-y-4 pt-2">
                            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted border border-zinc-200 dark:border-border">
                                <div className="font-bold text-xs text-zinc-900 dark:text-foreground">
                                    {editingUser.fullName}
                                </div>
                                <div className="text-[11px] text-zinc-400">
                                    {editingUser.email}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-zinc-700 dark:text-foreground block mb-1">
                                    Chọn vai trò mới:
                                </label>
                                <Select
                                    value={targetRole}
                                    onValueChange={(val) => {
                                        if (val)
                                            setTargetRole(val as SystemRole);
                                    }}
                                >
                                    <SelectTrigger className="w-full text-xs">
                                        <SelectValue placeholder="Chọn vai trò" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(
                                            Object.keys(
                                                ROLE_DETAILS,
                                            ) as SystemRole[]
                                        ).map((r) => (
                                            <SelectItem key={r} value={r}>
                                                <div className="flex flex-col">
                                                    <span className="font-bold">
                                                        {ROLE_DETAILS[r].label}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-400">
                                                        {ROLE_DETAILS[r].desc}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-border text-xs font-bold text-zinc-600 dark:text-foreground hover:bg-zinc-50 dark:hover:bg-muted cursor-pointer"
                                >
                                    Đóng
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveRole}
                                    className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white text-xs font-bold shadow-md cursor-pointer"
                                >
                                    Lưu thay đổi vai trò
                                </button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
