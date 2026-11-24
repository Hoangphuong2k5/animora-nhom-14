/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Info, Lock, Pencil } from "lucide-react";
import { useExpert } from "@/components/expert/ExpertProvider";
import { DataTable, ColumnDef } from "@/components/expert/DataTable";
import { ClientPetDrawer } from "@/components/expert/clients/ClientPetDrawer";
import { ClientPetFormModal } from "@/components/expert/clients/ClientPetFormModal";
import { ExpertPet } from "@/types/expert.type";
import { PET_SPECIES_LABELS } from "@/constants/expert.constant";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SPECIES_FILTER_ITEMS: Record<string, string> = {
  all: "Loài: Tất cả",
  ...PET_SPECIES_LABELS,
};

export default function ExpertClientsPage() {
  const {
    profile,
    isVet,
    scopedPets,
    store,
    allOwners,
    allServices,
    updatePet,
    confirmCustomerNoteToMedicalProfile,
  } = useExpert();

  const [filterSpecies, setFilterSpecies] = useState<string>("all");
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [petModalOpen, setPetModalOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);

  const selectedPet = useMemo(
    () => (selectedPetId ? scopedPets.find((p) => p.id === selectedPetId) ?? null : null),
    [scopedPets, selectedPetId]
  );

  const editingPet = useMemo(
    () => (editingPetId ? scopedPets.find((p) => p.id === editingPetId) ?? null : null),
    [scopedPets, editingPetId]
  );

  // Filter scoped pets
  const filteredPets = useMemo(() => {
    return scopedPets.filter((p) => {
      if (filterSpecies !== "all" && p.species !== filterSpecies) return false;
      return true;
    });
  }, [scopedPets, filterSpecies]);

  // Compute sessions count & last session for each pet
  const petSessionStats = useMemo(() => {
    const map: Record<string, { count: number; lastDate: string }> = {};

    store.appointments.forEach((a) => {
      if (a.expertId !== profile.id) return;
      if (!map[a.petId]) {
        map[a.petId] = { count: 0, lastDate: a.startAt };
      }
      map[a.petId].count++;
      if (new Date(a.startAt) > new Date(map[a.petId].lastDate)) {
        map[a.petId].lastDate = a.startAt;
      }
    });

    return map;
  }, [store.appointments, profile.id]);

  // Appointment history for selected pet with this expert
  const selectedPetAppointments = useMemo(() => {
    if (!selectedPet) return [];
    return store.appointments.filter(
      (a) => a.petId === selectedPet.id && a.expertId === profile.id
    );
  }, [selectedPet, store.appointments, profile.id]);

  const selectedOwner = selectedPet
    ? allOwners.find((o) => o.id === selectedPet.ownerId)
    : null;

  const columns: ColumnDef<ExpertPet>[] = [
    {
      key: "pet",
      header: "Thú cưng",
      sortable: true,
      sortValue: (p) => p.name,
      render: (p) => (
        <div className="flex items-center gap-3">
          <img
            src={p.photo}
            alt={p.name}
            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-zinc-200 dark:border-border"
          />
          <div>
            <div className="font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-1.5 flex-wrap">
              <span>{p.name}</span>
              <span className="text-[10px] text-zinc-400 font-normal">
                ({p.gender === "male" ? "Đực" : "Cái"})
              </span>
              {p.medicalLocked && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <Lock className="w-2.5 h-2.5" />
                  <span>BS đã khóa y tế</span>
                </span>
              )}
            </div>
            <div className="text-[11px] text-zinc-400 font-medium">
              {p.breed} • {p.weightKg} kg
              {p.isNeutered !== undefined
                ? ` • ${p.isNeutered ? "Đã triệt sản" : "Chưa triệt sản"}`
                : ""}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "species",
      header: "Loài",
      sortable: true,
      sortValue: (p) => p.species,
      render: (p) => (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-muted text-zinc-700 dark:text-foreground/80">
          {PET_SPECIES_LABELS[p.species] || p.species}
        </span>
      ),
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
      key: "sessions",
      header: "Số lần phục vụ",
      sortable: true,
      sortValue: (p) => petSessionStats[p.id]?.count || 0,
      render: (p) => (
        <span className="font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
          {petSessionStats[p.id]?.count || 0} lần
        </span>
      ),
    },
    {
      key: "lastDate",
      header: "Lần gần nhất",
      sortable: true,
      sortValue: (p) => petSessionStats[p.id]?.lastDate || "",
      render: (p) => {
        const last = petSessionStats[p.id]?.lastDate;
        return (
          <span className="text-zinc-600 dark:text-foreground/80 font-medium">
            {last ? last.split("T")[0] : "—"}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (p) => {
        return (
          <div className="flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedPetId(p.id)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold border border-zinc-200 dark:border-border hover:bg-zinc-100 dark:hover:bg-muted transition-colors cursor-pointer"
            >
              {isVet ? "Hồ sơ & Log y tế" : "Xem hồ sơ (Chỉ xem)"}
            </button>
            {isVet && (
              <>
                <Link
                  href={`/expert/health-records?petId=${p.id}`}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B] hover:bg-[#6B1F2E]/20 transition-colors"
                >
                  Sổ SK
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPetId(p.id);
                    setPetModalOpen(true);
                  }}
                  title="Cập nhật cân nặng, dị ứng, hành vi, triệt sản & khóa dữ liệu y tế"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-border text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-muted transition-colors cursor-pointer"
                >
                  <Pencil className="w-3 h-3 text-[#6B1F2E] dark:text-[#FF7F6B]" />
                  <span>Cập nhật y tế</span>
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-zinc-900 dark:text-foreground">
            Khách Hàng & Thú Cưng Đã Phục Vụ
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isVet
              ? "Danh mục thú cưng thăm khám với Bác sĩ. Bác sĩ làm chủ dữ liệu y tế (Cân nặng, Dị ứng, Hành vi, Triệt sản) và khóa với khách hàng sau lần cập nhật đầu tiên."
              : "Danh mục thú cưng và chủ nuôi đã từng đặt dịch vụ với chuyên viên (Chỉ xem)."}
          </p>
        </div>
      </div>

      {/* Scope Disclaimer Banner */}
      <div className="p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/70 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2.5">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <span>
          <strong>Phân quyền Hồ sơ thú cưng (v1.4):</strong> Hồ sơ thú cưng do Khách hàng hoặc Lễ tân tại quầy tạo mới.{" "}
          {isVet
            ? "Bác sĩ cập nhật Cân nặng thực tế, Dị ứng, Hành vi, Triệt sản, xác nhận ghi chú bổ sung từ khách và khóa dữ liệu y tế (ghi Audit Log mọi lần sửa)."
            : "Nhân viên chăm sóc chỉ xem hồ sơ thú cưng để phục vụ an toàn."}
        </span>
      </div>

      {/* Table */}
      <DataTable
        data={filteredPets}
        columns={columns}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Tìm theo tên thú cưng, giống loài hoặc tên chủ..."
        searchFilter={(p, q) => {
          const o = allOwners.find((ow) => ow.id === p.ownerId);
          return (
            p.name.toLowerCase().includes(q) ||
            p.breed.toLowerCase().includes(q) ||
            (o?.fullName || "").toLowerCase().includes(q)
          );
        }}
        onRowClick={(p) => setSelectedPetId(p.id)}
        emptyTitle="Chưa có thú cưng nào"
        emptyDescription="Hiện chưa có thú cưng nào hoàn tất hoặc đặt lịch với chuyên viên."
        extraFilters={
          <Select
            value={filterSpecies}
            onValueChange={(val) => {
              if (val !== null) setFilterSpecies(val);
            }}
            items={SPECIES_FILTER_ITEMS}
          >
            <SelectTrigger className="h-9! min-w-[150px] rounded-xl border-zinc-200 dark:border-border bg-white dark:bg-card px-3 text-xs font-semibold text-zinc-700 dark:text-foreground/80 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Loài: Tất cả</SelectItem>
              <SelectItem value="dog">Chó</SelectItem>
              <SelectItem value="cat">Mèo</SelectItem>
              <SelectItem value="rabbit">Thỏ</SelectItem>
              <SelectItem value="hamster">Chuột cảnh</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* Slide-over Pet Detail Drawer (Sub-Component) */}
      <ClientPetDrawer
        pet={selectedPet}
        owner={selectedOwner}
        appointments={selectedPetAppointments}
        services={allServices}
        isVet={isVet}
        onEdit={(pet) => {
          setEditingPetId(pet.id);
          setPetModalOpen(true);
        }}
        onConfirmCustomerNote={confirmCustomerNoteToMedicalProfile}
        onClose={() => setSelectedPetId(null)}
      />

      {isVet && petModalOpen && editingPet && (
        <ClientPetFormModal
          key={`edit-${editingPet.id}`}
          isOpen={petModalOpen}
          editingPet={editingPet}
          owners={allOwners}
          onClose={() => {
            setPetModalOpen(false);
            setEditingPetId(null);
          }}
          onConfirmCustomerNote={confirmCustomerNoteToMedicalProfile}
          onSave={(data) => {
            updatePet(editingPet.id, data);
          }}
        />
      )}
    </div>
  );
}
