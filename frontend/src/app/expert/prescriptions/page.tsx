"use client";

import React from "react";
import Link from "next/link";
import { Pill, Plus, ShieldAlert } from "lucide-react";
import { useExpert } from "@/components/expert/ExpertProvider";
import { DataTable, ColumnDef } from "@/components/expert/DataTable";
import { StatusBadge } from "@/components/expert/StatusBadge";
import { VetRouteGuard } from "@/components/expert/VetOnly";
import { PrescriptionDetailModal } from "@/components/expert/prescriptions/PrescriptionDetailModal";
import { usePrescriptionFilters } from "@/hooks/expert/usePrescriptionFilters";
import { Prescription } from "@/types/expert.type";
import { ROUTES } from "@/constants/config.constant";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SEVERITY_FILTER_ITEMS: Record<string, string> = {
  all: "Mức độ bệnh: Tất cả",
  mild: "Bệnh nhẹ (Có thể mua lại)",
  severe: "Bệnh nặng (Cần khám lại)",
};

const STATUS_FILTER_ITEMS: Record<string, string> = {
  all: "Trạng thái: Tất cả",
  active: "Còn lượt mua lại",
  exhausted: "Hết lượt mua lại",
  needs_revisit: "Cần tái khám trực tiếp",
};

export default function ExpertPrescriptionsPage() {
  const { store, allPets, allOwners } = useExpert();

  const {
    filterSeverity,
    setFilterSeverity,
    filterStatus,
    setFilterStatus,
    selectedRx,
    setSelectedRx,
    filteredList,
  } = usePrescriptionFilters(store.prescriptions);

  const columns: ColumnDef<Prescription>[] = [
    {
      key: "code",
      header: "Mã đơn thuốc",
      sortable: true,
      sortValue: (p) => p.code,
      render: (p) => (
        <span className="font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
          {p.code}
        </span>
      ),
    },
    {
      key: "pet",
      header: "Thú cưng",
      sortable: true,
      sortValue: (p) => {
        const pet = allPets.find((pt) => pt.id === p.petId);
        return pet?.name || "";
      },
      render: (p) => {
        const pet = allPets.find((pt) => pt.id === p.petId);
        return (
          <div className="flex items-center gap-2">
            <img
              src={pet?.photo}
              alt={pet?.name}
              className="w-7 h-7 rounded-lg object-cover shrink-0 border border-zinc-200 dark:border-border"
            />
            <div className="font-bold text-zinc-900 dark:text-foreground">
              {pet?.name}
            </div>
          </div>
        );
      },
    },
    {
      key: "owner",
      header: "Chủ nuôi",
      sortable: true,
      sortValue: (p) => {
        const o = allOwners.find((ow) => ow.id === p.ownerId);
        return o?.fullName || "";
      },
      render: (p) => {
        const o = allOwners.find((ow) => ow.id === p.ownerId);
        return (
          <div>
            <div className="font-bold text-zinc-900 dark:text-foreground">{o?.fullName}</div>
            <div className="text-[11px] text-zinc-400">{o?.phone}</div>
          </div>
        );
      },
    },
    {
      key: "date",
      header: "Ngày kê",
      sortable: true,
      sortValue: (p) => p.issuedAt,
      render: (p) => (
        <span className="text-zinc-600 dark:text-muted-foreground font-medium">{p.issuedAt}</span>
      ),
    },
    {
      key: "diagnosis",
      header: "Chẩn đoán bệnh",
      render: (p) => (
        <div className="max-w-[200px] truncate font-bold text-zinc-800 dark:text-foreground/90">
          {p.diagnosis}
        </div>
      ),
    },
    {
      key: "severity",
      header: "Mức độ",
      render: (p) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            p.severity === "mild"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          {p.severity === "mild" ? "Nhẹ (Cho mua lại)" : "Nặng (Khám lại)"}
        </span>
      ),
    },
    {
      key: "refills",
      header: "Mua lại còn lại",
      render: (p) => {
        if (p.severity === "severe") {
          return (
            <span className="text-rose-600 dark:text-rose-400 font-extrabold text-[11px]">
              0 (Khóa)
            </span>
          );
        }
        const remaining = Math.max(0, p.refillsAllowed - p.refillsUsed);
        return (
          <span
            className={`font-bold text-xs ${
              remaining === 0
                ? "text-rose-500 font-extrabold"
                : "text-emerald-600 dark:text-emerald-400 font-extrabold"
            }`}
          >
            {remaining} / {p.refillsAllowed} lượt
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (p) => {
        if (p.severity === "severe") {
          return <StatusBadge status="needs_revisit" size="sm" />;
        }
        if (p.refillsUsed >= p.refillsAllowed) {
          return <StatusBadge status="exhausted" size="sm" />;
        }
        return <StatusBadge status="active" size="sm" />;
      },
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (p) => (
        <button
          type="button"
          onClick={() => setSelectedRx(p)}
          className="px-2.5 py-1 rounded-lg text-xs font-bold border border-zinc-200 dark:border-border hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer"
        >
          Chi tiết
        </button>
      ),
    },
  ];

  return (
    <VetRouteGuard>
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold font-heading text-zinc-900 dark:text-foreground">
                Quản Lý Đơn Thuốc Điện Tử [Bác Sĩ]
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B]">
                <Pill className="w-3.5 h-3.5" />
                <span>Đơn thuốc Bác sĩ</span>
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Kê đơn thuốc từ kho dược Animora, kiểm soát quyền mua lại theo mức độ bệnh tật và an toàn thú y.
            </p>
          </div>

          <Link
            href={ROUTES.EXPERT_PRESCRIPTIONS_NEW}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors cursor-pointer shadow-sm shadow-[#6B1F2E]/20"
          >
            <Plus className="w-4 h-4 text-[#FF7F6B]" />
            <span>Kê đơn thuốc mới</span>
          </Link>
        </div>

        {/* Regulatory Banner */}
        <div className="p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong>Quy chuẩn an toàn dược thú y Animora:</strong>
            <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
              - <strong>Bệnh nhẹ:</strong> Bác sĩ có thể ấn định 1 đến 3 lượt mua lại trực tuyến. Khi hết lượt, hệ thống chỉ nhắc khách đặt lịch khám mới, bác sĩ <em>không gia hạn từ xa</em> mà phải khám trực tiếp.
              <br />
              - <strong>Bệnh nặng:</strong> Hệ thống tự động khóa 0 lượt mua lại để đảm bảo thú cưng được theo dõi diễn tiến lâm sàng tại phòng khám.
            </p>
          </div>
        </div>

        {/* Table with Filters */}
        <DataTable
          data={filteredList}
          columns={columns}
          keyExtractor={(p) => p.id}
          searchPlaceholder="Tìm theo mã đơn thuốc, tên thú cưng hoặc chẩn đoán..."
          searchFilter={(p, q) => {
            const pet = allPets.find((pt) => pt.id === p.petId);
            const o = allOwners.find((ow) => ow.id === p.ownerId);
            return (
              p.code.toLowerCase().includes(q) ||
              p.diagnosis.toLowerCase().includes(q) ||
              (pet?.name || "").toLowerCase().includes(q) ||
              (o?.fullName || "").toLowerCase().includes(q)
            );
          }}
          onRowClick={(p) => setSelectedRx(p)}
          extraFilters={
            <>
              {/* Filter Severity */}
              <Select
                value={filterSeverity}
                onValueChange={(val) => {
                  if (val !== null) setFilterSeverity(val);
                }}
                items={SEVERITY_FILTER_ITEMS}
              >
                <SelectTrigger className="h-9! min-w-[185px] rounded-xl border-zinc-200 dark:border-border bg-white dark:bg-card px-3 text-xs font-semibold text-zinc-700 dark:text-foreground/80 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Mức độ bệnh: Tất cả</SelectItem>
                  <SelectItem value="mild">Bệnh nhẹ (Có thể mua lại)</SelectItem>
                  <SelectItem value="severe">Bệnh nặng (Cần khám lại)</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter Status */}
              <Select
                value={filterStatus}
                onValueChange={(val) => {
                  if (val !== null) setFilterStatus(val);
                }}
                items={STATUS_FILTER_ITEMS}
              >
                <SelectTrigger className="h-9! min-w-[180px] rounded-xl border-zinc-200 dark:border-border bg-white dark:bg-card px-3 text-xs font-semibold text-zinc-700 dark:text-foreground/80 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Trạng thái: Tất cả</SelectItem>
                  <SelectItem value="active">Còn lượt mua lại</SelectItem>
                  <SelectItem value="exhausted">Hết lượt mua lại</SelectItem>
                  <SelectItem value="needs_revisit">Cần tái khám trực tiếp</SelectItem>
                </SelectContent>
              </Select>
            </>
          }
        />

        {/* Prescription Detail Modal (Sub-Component) */}
        {selectedRx && (
          <PrescriptionDetailModal
            rx={selectedRx}
            onClose={() => setSelectedRx(null)}
          />
        )}
      </div>
    </VetRouteGuard>
  );
}
