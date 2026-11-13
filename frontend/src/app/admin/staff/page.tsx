"use client";

import React, { useState } from "react";
import {
  UserCheck,
  Star,
  Award,
  DollarSign,
  Download,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  Calendar,
  ShieldCheck,
  Briefcase,
  Sparkles,
  Phone,
  Mail,
  Building2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export interface StaffItem {
  id: string;
  name: string;
  avatar: string;
  roleType: "Bác sĩ thú y" | "Chuyên viên Spa/Grooming" | "Chăm sóc nội trú" | "Điều dưỡng";
  specialty: string;
  experience: string;
  rating: number;
  reviewCount: number;
  monthlyCases: number;
  status: "active" | "busy" | "leave";
  phone: string;
  email: string;
  certificates: string[];
  scheduleShifts: string[];
  recentReviews: {
    customerName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

export interface PayrollItem {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  baseSalary: number;
  commission: number;
  ratingBonus: number;
  deduction: number;
  netSalary: number;
  status: "paid" | "pending";
}

const INITIAL_STAFF: StaffItem[] = [
  {
    id: "st-1",
    name: "BS. CKI Nguyễn Quốc Hùng",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    roleType: "Bác sĩ thú y",
    specialty: "Phẫu thuật Ngoại khoa & Chẩn đoán hình ảnh",
    experience: "8 năm kinh nghiệm",
    rating: 4.95,
    reviewCount: 86,
    monthlyCases: 142,
    status: "active",
    phone: "0918.234.567",
    email: "quochung.vet@animora.vn",
    certificates: [
      "Bằng Bác Sĩ Thú Y CKI - ĐH Nông Lâm TP.HCM",
      "Chứng chỉ Siêu âm & X-Quang thú nhỏ chuyên sâu (ISFM)",
      "Chứng chỉ Cấp cứu hồi sức thú y quốc tế (VECCS)",
    ],
    scheduleShifts: ["Thứ 2 - Thứ 6 (08:00 - 17:00)", "Thứ 7 (08:00 - 12:00)"],
    recentReviews: [
      { customerName: "Phan Thị Đinh Thùy", rating: 5, comment: "BS Hùng siêu mát tay, mổ triệt sản bé Bơ đường khâu cực đẹp!", date: "2026-11-01" },
      { customerName: "Hoàng Văn Tuấn", rating: 5, comment: "Bác sĩ nhiệt tình, giải thích cặn kẽ tình trạng viêm khớp của Rex.", date: "2026-10-22" },
    ],
  },
  {
    id: "st-2",
    name: "Trần Thảo Vy",
    avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&auto=format&fit=crop&q=80",
    roleType: "Chuyên viên Spa/Grooming",
    specialty: "Master Groomer Cắt tỉa tạo hình thẩm mỹ Poodle & Bichon",
    experience: "5 năm kinh nghiệm",
    rating: 4.92,
    reviewCount: 94,
    monthlyCases: 168,
    status: "active",
    phone: "0909.112.233",
    email: "thaovy.grooming@animora.vn",
    certificates: [
      "Master Groomer Certification Level A (KGA)",
      "Chứng chỉ Nhuộm lông & Phục hồi da lông thảo mộc tự nhiên",
    ],
    scheduleShifts: ["Thứ 3 - Chủ Nhật (09:00 - 18:00)"],
    recentReviews: [
      { customerName: "Nguyễn Minh Anh", rating: 5, comment: "Vy cắt form mặt tròn cho bé Mochi đẹp xuất sắc, ai cũng khen!", date: "2026-10-29" },
    ],
  },
  {
    id: "st-3",
    name: "Lê Hoàng Toàn",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    roleType: "Chuyên viên Spa/Grooming",
    specialty: "Spa Trị liệu Da & Tắm Thủy Lực Vi Bọt Khí",
    experience: "4 năm kinh nghiệm",
    rating: 4.88,
    reviewCount: 62,
    monthlyCases: 115,
    status: "active",
    phone: "0934.556.778",
    email: "hoangtoan.spa@animora.vn",
    certificates: [
      "Chứng chỉ Thủy liệu pháp thú y Hydrotherapy",
    ],
    scheduleShifts: ["Thứ 2 - Thứ 6 (08:30 - 17:30)"],
    recentReviews: [
      { customerName: "Đỗ Quốc Bảo", rating: 5, comment: "Bé Kuro rất nhát nước nhưng anh Toàn tắm êm ru, không hề gầm gừ.", date: "2026-10-30" },
    ],
  },
  {
    id: "st-4",
    name: "BS. Hoàng Thị Mai",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    roleType: "Bác sĩ thú y",
    specialty: "Nội khoa Thú nhỏ & Tiêm chủng Vaccine",
    experience: "6 năm kinh nghiệm",
    rating: 4.91,
    reviewCount: 78,
    monthlyCases: 130,
    status: "leave",
    phone: "0977.889.900",
    email: "hoangmai.vet@animora.vn",
    certificates: [
      "Bác Sĩ Thú Y - Học Viện Nông Nghiệp Việt Nam",
      "Chứng chỉ Kiểm soát Dịch bệnh Thú cưng (CDC VET)",
    ],
    scheduleShifts: ["Nghỉ phép thường niên đến 08/11"],
    recentReviews: [
      { customerName: "Trần Thùy Linh", rating: 5, comment: "Bác sĩ Mai tiêm nhẹ nhàng, mèo nhà mình không khóc tí nào.", date: "2026-10-18" },
    ],
  },
];

const INITIAL_PAYROLL: PayrollItem[] = [
  {
    id: "pay-1",
    staffId: "st-1",
    staffName: "BS. CKI Nguyễn Quốc Hùng",
    role: "Bác sĩ Thú Y CKI",
    baseSalary: 18000000,
    commission: 7100000,
    ratingBonus: 1500000,
    deduction: 0,
    netSalary: 26600000,
    status: "paid",
  },
  {
    id: "pay-2",
    staffId: "st-2",
    staffName: "Trần Thảo Vy",
    role: "Master Groomer",
    baseSalary: 12000000,
    commission: 8400000,
    ratingBonus: 1500000,
    deduction: 0,
    netSalary: 21900000,
    status: "paid",
  },
  {
    id: "pay-3",
    staffId: "st-3",
    staffName: "Lê Hoàng Toàn",
    role: "Chuyên viên Spa",
    baseSalary: 10000000,
    commission: 5750000,
    ratingBonus: 1000000,
    deduction: 0,
    netSalary: 16750000,
    status: "pending",
  },
  {
    id: "pay-4",
    staffId: "st-4",
    staffName: "BS. Hoàng Thị Mai",
    role: "Bác sĩ Thú Y",
    baseSalary: 16000000,
    commission: 6500000,
    ratingBonus: 1500000,
    deduction: 0,
    netSalary: 24000000,
    status: "pending",
  },
];

export default function AdminStaffPage() {
  const [activeTab, setActiveTab] = useState<"directory" | "payroll" | "accounts">("directory");
  const [staffList, setStaffList] = useState<StaffItem[]>(INITIAL_STAFF);
  const [payrolls, setPayrolls] = useState<PayrollItem[]>(INITIAL_PAYROLL);
  const [selectedStaff, setSelectedStaff] = useState<StaffItem | null>(null);

  // Form tạo tài khoản
  const [newAccName, setNewAccName] = useState("");
  const [newAccEmail, setNewAccEmail] = useState("");
  const [newAccPhone, setNewAccPhone] = useState("");
  const [newAccType, setNewAccType] = useState<"staff" | "supplier">("staff");
  const [newAccSpecialty, setNewAccSpecialty] = useState("");
  const [newSupplierCompany, setNewSupplierCompany] = useState("");

  const handleExportPayroll = () => {
    toast.success("Đã xuất bảng lương tháng 10/2026 sang định dạng Excel thành công!");
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName || !newAccEmail) {
      toast.error("Vui lòng điền đủ họ tên và email!");
      return;
    }

    if (newAccType === "staff") {
      const createdStaff: StaffItem = {
        id: `st-${Date.now()}`,
        name: newAccName,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        roleType: "Chuyên viên Spa/Grooming",
        specialty: newAccSpecialty || "Chăm sóc thú cưng tổng quát",
        experience: "1 năm kinh nghiệm",
        rating: 5.0,
        reviewCount: 0,
        monthlyCases: 0,
        status: "active",
        phone: newAccPhone || "0900.000.000",
        email: newAccEmail,
        certificates: ["Chứng chỉ Thực hành Animora Internal"],
        scheduleShifts: ["Thứ 2 - Thứ 6"],
        recentReviews: [],
      };
      setStaffList((prev) => [createdStaff, ...prev]);
      toast.success(`Đã cấp tài khoản chuyên viên mới cho ${newAccName}!`);
    } else {
      toast.success(`Đã tạo tài khoản Nhà cung cấp cho đối tác: ${newSupplierCompany || newAccName}!`);
    }

    // Reset form
    setNewAccName("");
    setNewAccEmail("");
    setNewAccPhone("");
    setNewAccSpecialty("");
    setNewSupplierCompany("");
  };

  const totalPayrollAmount = payrolls.reduce((acc, p) => acc + p.netSalary, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          if (val) setActiveTab(val as "directory" | "payroll" | "accounts");
        }}
        className="gap-6"
      >
        {/* 1. Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
              <UserCheck className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              Chuyên Viên, Nhân Sự & Bảng Lương
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Đội ngũ bác sĩ, chuyên viên grooming, tính hoa hồng hiệu suất và cấp tài khoản đối tác
            </p>
          </div>

          {/* Tab switchers */}
          <TabsList className="h-auto! flex-wrap gap-1.5 bg-[#FBF6F7] dark:bg-muted/80 p-1 rounded-2xl self-start sm:self-auto">
            <TabsTrigger
              value="directory"
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
            >
              Đội ngũ chuyên viên
            </TabsTrigger>
            <TabsTrigger
              value="payroll"
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
            >
              Lương & Thưởng
            </TabsTrigger>
            <TabsTrigger
              value="accounts"
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
            >
              Cấp tài khoản mới
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: Danh sách chuyên viên */}
        <TabsContent value="directory" className="space-y-4">
          <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
            <Table className="w-full text-left text-xs">
              <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
                <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Chuyên viên</TableHead>
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Vị trí & Chuyên môn</TableHead>
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Kinh nghiệm</TableHead>
                  <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Đánh giá TB</TableHead>
                  <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Số ca tháng này</TableHead>
                  <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Trạng thái</TableHead>
                  <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Chi tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
                {staffList.map((st) => (
                  <TableRow
                    key={st.id}
                    className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors group"
                  >
                    {/* Name & Avatar */}
                    <TableCell className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.avatar}
                          alt={st.name}
                          className="w-11 h-11 rounded-2xl object-cover border border-zinc-200 dark:border-border shrink-0"
                        />
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-foreground text-sm">
                            {st.name}
                          </div>
                          <div className="text-[11px] text-zinc-400">{st.phone}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role & Specialty */}
                    <TableCell className="py-3.5 px-3 max-w-[240px] whitespace-normal">
                      <div className="font-bold text-[#6B1F2E] dark:text-[#FF7F6B]">{st.roleType}</div>
                      <div className="text-[11px] text-zinc-500">
                        {st.specialty}
                      </div>
                    </TableCell>

                    {/* Exp */}
                    <TableCell className="py-3.5 px-3 text-zinc-600 dark:text-muted-foreground font-medium">
                      {st.experience}
                    </TableCell>

                    {/* Rating */}
                    <TableCell className="py-3.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1 font-extrabold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{st.rating}</span>
                        <span className="text-[10px] text-zinc-400 font-normal">
                          ({st.reviewCount})
                        </span>
                      </div>
                    </TableCell>

                    {/* Monthly Cases */}
                    <TableCell className="py-3.5 px-3 text-center font-bold text-zinc-900 dark:text-foreground">
                      {st.monthlyCases} ca
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          st.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : st.status === "busy"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-zinc-100 dark:bg-muted text-zinc-400"
                        }`}
                      >
                        {st.status === "active"
                          ? "Đang nhận lịch"
                          : st.status === "busy"
                          ? "Đang làm ca"
                          : "Nghỉ phép"}
                      </span>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedStaff(st)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-muted dark:hover:bg-muted font-bold text-zinc-700 dark:text-foreground/80 transition-colors cursor-pointer"
                      >
                        Hồ sơ & Đánh giá
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* TAB 2: Lương & Thưởng (Payroll) */}
        <TabsContent value="payroll" className="space-y-5">
          {/* Summary Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-[#6B1F2E]/10 via-[#FF7F6B]/10 to-transparent border border-[#6B1F2E]/20">
            <div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
                Tổng quỹ lương & hoa hồng tháng này
              </span>
              <span className="text-2xl font-extrabold font-heading text-[#6B1F2E] dark:text-[#FF7F6B]">
                {totalPayrollAmount.toLocaleString("vi-VN")}₫
              </span>
              <p className="text-xs text-zinc-400 mt-0.5">
                Đã tính lương cố định + hoa hồng số booking thực tế + thưởng KPI đánh giá ⭐ &gt;= 4.8
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportPayroll}
              className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Bảng Lương (Excel)</span>
            </button>
          </div>

          {/* Table */}
          <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
            <Table className="w-full text-left text-xs">
              <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
                <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Nhân sự</TableHead>
                  <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Chức danh</TableHead>
                  <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Lương cơ bản</TableHead>
                  <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Hoa hồng Booking</TableHead>
                  <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Thưởng Đánh Giá ⭐</TableHead>
                  <TableHead className="py-3 px-3 text-right font-bold text-zinc-900 dark:text-foreground uppercase tracking-wider text-[11px]">
                    Tổng thực nhận
                  </TableHead>
                  <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Trạng thái chi trả</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
                {payrolls.map((p) => (
                  <TableRow
                    key={p.id}
                    className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors"
                  >
                    <TableCell className="py-3.5 px-3 font-bold text-zinc-900 dark:text-foreground whitespace-normal">
                      {p.staffName}
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-zinc-500">{p.role}</TableCell>
                    <TableCell className="py-3.5 px-3 text-right font-medium">
                      {p.baseSalary.toLocaleString("vi-VN")}₫
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                      +{p.commission.toLocaleString("vi-VN")}₫
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-right font-medium text-amber-600 dark:text-amber-400">
                      +{p.ratingBonus.toLocaleString("vi-VN")}₫
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-right font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {p.netSalary.toLocaleString("vi-VN")}₫
                    </TableCell>
                    <TableCell className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {p.status === "paid" ? "Đã chi trả" : "Chờ duyệt chi"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* TAB 3: Cấp tài khoản chuyên viên & Nhà cung cấp */}
        <TabsContent value="accounts" className="w-full">
          <div className="max-w-2xl mx-auto p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#FF7F6B]" />
                Cấp Quyền & Tạo Tài Khoản Mới
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Do tính bảo mật, Nhà cung cấp (Supplier) và Chuyên viên nội bộ không tự đăng ký tài khoản mà phải được Quản trị viên khởi tạo trực tiếp.
              </p>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              {/* Account type switch */}
              <div>
                <label className="font-semibold text-zinc-500 block mb-1.5">Loại tài khoản:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewAccType("staff")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      newAccType === "staff"
                        ? "border-[#6B1F2E] bg-[#6B1F2E]/5 text-[#6B1F2E] dark:text-[#FF7F6B] font-bold"
                        : "border-zinc-200 dark:border-border text-zinc-600 dark:text-muted-foreground"
                    }`}
                  >
                    <UserCheck className="w-4 h-4 mb-1" />
                    <div>Chuyên viên & Nhân sự</div>
                    <div className="text-[10px] font-normal text-zinc-400">Bác sĩ, Groomer, Kỹ thuật viên</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewAccType("supplier")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      newAccType === "supplier"
                        ? "border-[#6B1F2E] bg-[#6B1F2E]/5 text-[#6B1F2E] dark:text-[#FF7F6B] font-bold"
                        : "border-zinc-200 dark:border-border text-zinc-600 dark:text-muted-foreground"
                    }`}
                  >
                    <Building2 className="w-4 h-4 mb-1" />
                    <div>Nhà cung cấp (Supplier)</div>
                    <div className="text-[10px] font-normal text-zinc-400">Đơn vị phân phối thuốc, thức ăn, phụ kiện</div>
                  </button>
                </div>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-500 block mb-1">
                    {newAccType === "staff" ? "Họ và tên nhân sự:" : "Người đại diện liên hệ:"}
                  </label>
                  <input
                    type="text"
                    required
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    placeholder="Nguyễn Văn A..."
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-500 block mb-1">Email đăng nhập:</label>
                  <input
                    type="email"
                    required
                    value={newAccEmail}
                    onChange={(e) => setNewAccEmail(e.target.value)}
                    placeholder="nhansu@animora.vn..."
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-500 block mb-1">Số điện thoại liên hệ:</label>
                  <input
                    type="text"
                    value={newAccPhone}
                    onChange={(e) => setNewAccPhone(e.target.value)}
                    placeholder="0901234567..."
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
                  />
                </div>

                {newAccType === "staff" ? (
                  <div>
                    <label className="font-semibold text-zinc-500 block mb-1">Chuyên môn chính:</label>
                    <input
                      type="text"
                      value={newAccSpecialty}
                      onChange={(e) => setNewAccSpecialty(e.target.value)}
                      placeholder="Bác sĩ thú y / Master Grooming..."
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="font-semibold text-zinc-500 block mb-1">Tên công ty / Đơn vị cung cấp:</label>
                    <input
                      type="text"
                      value={newSupplierCompany}
                      onChange={(e) => setNewSupplierCompany(e.target.value)}
                      placeholder="Royal Canin VN, Purina, Virbac..."
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Khởi tạo tài khoản & Cấp mã truy cập</span>
                </button>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>

      {/* Drawer Chi tiết hồ sơ chuyên viên */}
      <Sheet
        open={Boolean(selectedStaff)}
        onOpenChange={(open) => {
          if (!open) setSelectedStaff(null);
        }}
      >
        <SheetContent
          side="right"
          showCloseButton={true}
          className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-lg p-0 gap-0 flex flex-col h-full bg-popover text-popover-foreground border-l border-border shadow-2xl"
        >
          {selectedStaff && (
            <>
              {/* Header */}
              <SheetHeader className="px-6 py-4 border-b border-border shrink-0 pr-12">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedStaff.avatar}
                    alt={selectedStaff.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#FF7F6B] shrink-0"
                  />
                  <div className="min-w-0">
                    <SheetTitle className="text-base font-bold text-zinc-900 dark:text-foreground">
                      {selectedStaff.name}
                    </SheetTitle>
                    <SheetDescription className="text-xs text-[#6B1F2E] dark:text-[#FF7F6B] font-semibold mt-0.5">
                      {selectedStaff.roleType}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Body */}
              <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                <div className="p-6 space-y-5 text-xs">
                  {/* Rating & Cases Metric */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-muted/60 border border-zinc-100 dark:border-border">
                      <span className="text-[11px] text-zinc-400 block font-medium">Điểm đánh giá TB</span>
                      <div className="flex items-center gap-1.5 text-lg font-extrabold text-amber-500 mt-0.5">
                        <Star className="w-4 h-4 fill-amber-500" />
                        <span>{selectedStaff.rating}/5.0</span>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-muted/60 border border-zinc-100 dark:border-border">
                      <span className="text-[11px] text-zinc-400 block font-medium">Số ca chăm sóc</span>
                      <span className="text-lg font-extrabold text-zinc-900 dark:text-foreground">
                        {selectedStaff.monthlyCases} ca/tháng
                      </span>
                    </div>
                  </div>

                  {/* Chứng chỉ & Bằng cấp */}
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Chứng Chỉ Hành Nghề & Bằng Cấp
                    </h4>
                    <div className="space-y-1.5">
                      {selectedStaff.certificates.map((cert, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300 flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lịch làm việc */}
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#FF7F6B]" />
                      Khung Ca Làm Việc Trong Tuần
                    </h4>
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted/60 border border-zinc-100 dark:border-border space-y-1">
                      {selectedStaff.scheduleShifts.map((sh, idx) => (
                        <div key={idx} className="font-semibold text-zinc-800 dark:text-foreground/90">
                          • {sh}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Đánh giá từ khách hàng */}
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2 flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      Đánh Giá Từ Khách Hàng Gần Nhất
                    </h4>
                    <div className="space-y-2">
                      {selectedStaff.recentReviews.map((rev, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-900 dark:text-foreground">
                              {rev.customerName}
                            </span>
                            <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                              <Star className="w-3 h-3 fill-amber-500" />
                              <span>{rev.rating}</span>
                            </div>
                          </div>
                          <p className="text-zinc-600 dark:text-foreground/80 italic">"{rev.comment}"</p>
                          <div className="text-[10px] text-zinc-400">{rev.date}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

