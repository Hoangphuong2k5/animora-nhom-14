"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  Scissors,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Save,
  Clock,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Building,
  KeyRound,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { SERVICE_PAYMENT_SETTINGS_KEY } from "@/data/servicesData";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface ServiceSettingItem {
  id: string;
  serviceId?: "checkup" | "spa" | "training" | "boarding" | "dental";
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
  allowPayLater: boolean;
}

interface CancellationTier {
  id: string;
  timeframe: string;
  feePercent: number;
  description: string;
}

const INITIAL_SERVICE_SETTINGS: ServiceSettingItem[] = [
  {
    id: "svc-1",
    serviceId: "spa",
    name: "Spa & tắm (Spa Cắt Tỉa Lông & Tắm Thảo Dược)",
    category: "Spa & Grooming",
    price: 490000,
    durationMinutes: 90,
    allowPayLater: true,
  },
  {
    id: "svc-2",
    serviceId: "checkup",
    name: "Khám tổng quát & Siêu âm",
    category: "Khám bệnh",
    price: 590000,
    durationMinutes: 45,
    allowPayLater: true,
  },
  {
    id: "svc-3",
    serviceId: "training",
    name: "Huấn luyện hành vi tích cực",
    category: "Huấn luyện",
    price: 690000,
    durationMinutes: 60,
    allowPayLater: true,
  },
  {
    id: "svc-4",
    serviceId: "dental",
    name: "Nha khoa & Chăm sóc Thú nhỏ",
    category: "Nha khoa",
    price: 550000,
    durationMinutes: 50,
    allowPayLater: false, // Bắt buộc trả trước giữ chỗ máy móc
  },
  {
    id: "svc-5",
    serviceId: "boarding",
    name: "Lưu trú 24/7",
    category: "Lưu trú",
    price: 390000,
    durationMinutes: 1440,
    allowPayLater: false,
  },
];

const INITIAL_CANCELLATION_TIERS: CancellationTier[] = [
  {
    id: "tier-1",
    timeframe: "Hủy trước giờ hẹn (Thanh toán trước)",
    feePercent: 0,
    description: "Miễn phí 100%. Toàn bộ số tiền khách đã trả trước được hoàn lại về phương thức thanh toán ban đầu.",
  },
  {
    id: "tier-2",
    timeframe: "Hủy trước giờ hẹn (Thanh toán sau tại quầy)",
    feePercent: 0,
    description: "Miễn phí 100%. Khách chủ động hủy lịch trực tuyến trên hệ thống, không phát sinh bất kỳ khoản phí nào.",
  },
  {
    id: "tier-3",
    timeframe: "Quá giờ hẹn chưa thực hiện",
    feePercent: 0,
    description: "Quản lý liên hệ hỗ trợ điều phối đổi lịch mới hoặc hủy theo yêu cầu của khách hàng.",
  },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"services" | "cancellation" | "system">("services");
  const [services, setServices] = useState<ServiceSettingItem[]>(INITIAL_SERVICE_SETTINGS);
  const [tiers, setTiers] = useState<CancellationTier[]>(INITIAL_CANCELLATION_TIERS);

  // System contact info
  const [hotline, setHotline] = useState("0337 203 332");
  const [supportEmail, setSupportEmail] = useState("support@animora.vn");
  const [clinicAddress, setClinicAddress] = useState("Số 88 Nguyễn Gia Trí, Phường 25, Bình Thạnh, TP.HCM");
  const [openingHours, setOpeningHours] = useState("08:00 - 20:00 (Tất cả các ngày trong tuần)");

  useEffect(() => {
    const saved = safeGetStorage<Record<string, "prepaid" | "postpaid">>(
      SERVICE_PAYMENT_SETTINGS_KEY,
      {}
    );
    if (saved && Object.keys(saved).length > 0) {
      setServices((prev) =>
        prev.map((s) => {
          const timing = s.serviceId ? saved[s.serviceId] : undefined;
          return timing ? { ...s, allowPayLater: timing === "postpaid" } : s;
        })
      );
    }
  }, []);

  const handleTogglePayLater = (serviceId: string, nextChecked: boolean) => {
    setServices((prev) => {
      const next = prev.map((s) =>
        s.id === serviceId ? { ...s, allowPayLater: nextChecked } : s
      );
      const timingMap: Record<string, "prepaid" | "postpaid"> = {};
      for (const item of next) {
        if (item.serviceId) {
          timingMap[item.serviceId] = item.allowPayLater ? "postpaid" : "prepaid";
        }
      }
      safeSetStorage(SERVICE_PAYMENT_SETTINGS_KEY, timingMap);
      return next;
    });
    toast.success("Đã cập nhật hình thức thanh toán (Trả trước / Trả sau) đồng bộ sang trang đặt lịch!");
  };

  const handleSavePolicy = () => {
    toast.success("Đã lưu khung chính sách hủy lịch hẹn vào hệ sinh thái Animora!");
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Đã cập nhật thông tin liên hệ hệ thống hiển thị trên website chính!");
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => {
        if (val) setActiveTab(val as "services" | "cancellation" | "system");
      }}
      className="gap-6 animate-fade-in pb-12"
    >
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            Cài Đặt Hệ Thống, Dịch Vụ & Chính Sách
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Cấu hình bật/tắt trả sau từng dịch vụ, khung phí hủy lịch và thông tin hiển thị toàn trang
          </p>
        </div>

        {/* Tab switchers */}
        <TabsList className="h-auto! flex-wrap gap-1.5 bg-[#FBF6F7] dark:bg-muted/80 p-1 rounded-2xl self-start sm:self-auto">
          <TabsTrigger
            value="services"
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
          >
            Cấu hình Dịch vụ
          </TabsTrigger>
          <TabsTrigger
            value="cancellation"
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
          >
            Chính sách hủy lịch (50%)
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
          >
            Hệ thống & Liên hệ
          </TabsTrigger>
        </TabsList>
      </div>

      {/* TAB 1: CẤU HÌNH DỊCH VỤ & BẬT/TẮT TRẢ SAU */}
      <TabsContent value="services" className="space-y-4">
        <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
                <Scissors className="w-5 h-5 text-[#FF7F6B]" />
                Danh Mục Dịch Vụ & Tùy Chọn Thanh Toán Trả Sau
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Quản trị viên có thể bật hoặc tắt quyền "Thanh toán sau tại quầy (Pay Later)" cho từng gói dịch vụ đặc thù
              </p>
            </div>
          </div>

          <Table className="w-full text-left text-xs">
            <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
              <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                <TableHead className="py-3 px-4 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Tên dịch vụ</TableHead>
                <TableHead className="py-3 px-4 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Phân loại</TableHead>
                <TableHead className="py-3 px-4 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Đơn giá niêm yết</TableHead>
                <TableHead className="py-3 px-4 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Thời lượng dự kiến</TableHead>
                <TableHead className="py-3 px-4 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Cho phép trả sau tại quầy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
              {services.map((s) => (
                <TableRow key={s.id} className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors">
                  <TableCell className="py-3.5 px-4 font-bold text-zinc-900 dark:text-foreground text-sm whitespace-normal">
                    {s.name}
                  </TableCell>
                  <TableCell className="py-3.5 px-4 text-zinc-500 font-medium">{s.category}</TableCell>
                  <TableCell className="py-3.5 px-4 text-right font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                    {s.price.toLocaleString("vi-VN")}₫
                  </TableCell>
                  <TableCell className="py-3.5 px-4 text-center font-semibold text-zinc-600 dark:text-muted-foreground">
                    {s.durationMinutes} phút
                  </TableCell>
                  <TableCell className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center justify-center gap-2.5">
                      <Switch
                        checked={s.allowPayLater}
                        onCheckedChange={(checked) => handleTogglePayLater(s.id, Boolean(checked))}
                      />
                      <Badge
                        variant="outline"
                        className={`h-auto px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          s.allowPayLater
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {s.allowPayLater ? "Bật (Cho phép)" : "Tắt (Bắt buộc trả trước)"}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      {/* TAB 2: CHÍNH SÁCH HỦY LỊCH (50% FEE) */}
      <TabsContent value="cancellation" className="w-full">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                Khung Thời Gian & Mức Phí Phạt Hủy Lịch
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Animora áp dụng quy tắc khấu trừ minh bạch nhằm bảo vệ ca làm của bác sĩ và chuyên viên spa.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`p-4 rounded-2xl border space-y-2 ${
                    tier.feePercent === 50
                      ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                      : "bg-zinc-50 dark:bg-muted/50 border-zinc-200 dark:border-border"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-zinc-900 dark:text-foreground text-sm">
                      {tier.timeframe}
                    </span>
                    <Badge
                      className={`h-auto px-3 py-1 rounded-xl font-extrabold text-xs border-0 ${
                        tier.feePercent === 50
                          ? "bg-rose-600 text-white"
                          : tier.feePercent === 0
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      Khấu trừ {tier.feePercent}% phí
                    </Badge>
                  </div>
                  <p className="text-zinc-600 dark:text-muted-foreground">{tier.description}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSavePolicy}
                className="px-5 py-2.5 rounded-2xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thay đổi chính sách</span>
              </button>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* TAB 3: HỆ THỐNG & LIÊN HỆ */}
      <TabsContent value="system" className="w-full">
        <div className="max-w-2xl mx-auto p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
              <Building className="w-5 h-5 text-[#FF7F6B]" />
              Thông Tin Liên Hệ Hiển Thị Trên Website
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Thông tin đường dây nóng, email hỗ trợ khách hàng và địa chỉ cơ sở phòng khám chính
            </p>
          </div>

          <form onSubmit={handleSaveContact} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Hotline CSKH & Cấp cứu 24/7:</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={hotline}
                  onChange={(e) => setHotline(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Email hỗ trợ khách hàng:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Địa chỉ phòng khám chính:</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Giờ mở cửa đón khách:</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Cập nhật thông tin hệ thống</span>
              </button>
            </div>
          </form>
        </div>
      </TabsContent>
    </Tabs>
  );
}

