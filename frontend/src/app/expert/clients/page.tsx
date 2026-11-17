"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Info, Pencil, Plus, Trash2 } from "lucide-react";
import { useExpert } from "@/components/expert/ExpertProvider";
import { DataTable, ColumnDef } from "@/components/expert/DataTable";
import { ClientPetDrawer } from "@/components/expert/clients/ClientPetDrawer";
import { ClientPetFormModal } from "@/components/expert/clients/ClientPetFormModal";
import { ExpertPet, PetSpeciesCode } from "@/types/expert.type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SPECIES_FILTER_ITEMS: Record<string, string> = {
  all: "Loài: Tất cả",
  dog: "Chó",
  cat: "Mèo",
  rabbit: "Thỏ",
  hamster: "Chuột cảnh",
};

export default function ExpertClientsPage() {
  const {
    profile,
    isVet,
    scopedPets,
    store,
    allOwners,
    allServices,
    addPet,
    updatePet,
    deletePet,
  } = useExpert();

  const [filterSpecies, setFilterSpecies] = useState<string>("all");
  const [selectedPet, setSelectedPet] = useState<ExpertPet | null>(null);
  const [petModalOpen, setPetModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<ExpertPet | null>(null);

  const hasLinkedRecords = (petId: string): boolean => {
    return (
      store.appointments.some((a) => a.petId === petId) ||
      store.medicalRecords.some((r) => r.petId === petId)
    );
  };

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
            <div className="font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-1.5">
              <span>{p.name}</span>
              <span className="text-[10px] text-zinc-400 font-normal">
                ({p.gender === "male" ? "Đực" : "Cái"})
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 font-medium">
              {p.breed} • {p.weightKg} kg
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
      render: (p) => {
        const labels: Record<PetSpeciesCode, string> = {
          dog: "Chó",
          cat: "Mèo",
          rabbit: "Thỏ",
          hamster: "Chuột cảnh",
        };
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-muted text-zinc-700 dark:text-foreground/80">
            {labels[p.species] || p.species}
          </span>
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
        const blockedDelete = hasLinkedRecords(p.id);
        return (
          <div className="flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedPet(p)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold border border-zinc-200 dark:border-border hover:bg-zinc-100 dark:hover:bg-muted transition-colors cursor-pointer"
            >
              Chi tiết
            </button>
            <Link
              href={`/expert/health-records?petId=${p.id}`}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B] hover:bg-[#6B1F2E]/20 transition-colors"
            >
              Sổ SK
            </Link>
            {isVet && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPet(p);
                    setPetModalOpen(true);
                  }}
                  title="Sửa thông tin thú cưng"
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-border text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-muted transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={blockedDelete}
                  onClick={() => {
                    const res = deletePet(p.id);
                    if (res.ok && selectedPet?.id === p.id) {
                      setSelectedPet(null);
                    }
                  }}
                  title={
                    blockedDelete
                      ? "Không thể xóa thú cưng đang có lịch hẹn hoặc bệnh án"
                      : "Xóa hồ sơ thú cưng"
                  }
                  className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
            Danh mục thú cưng và chủ nuôi đã từng đặt dịch vụ hoặc thăm khám với chuyên viên.
          </p>
        </div>

        {isVet && (
          <button
            type="button"
            onClick={() => {
              setEditingPet(null);
              setPetModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-[#FF7F6B]" />
            <span>Thêm thú cưng</span>
          </button>
        )}
      </div>

      {/* Scope Disclaimer Banner */}
      <div className="p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/70 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2.5">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <span>
          <strong>Phạm vi dữ liệu:</strong> Để đảm bảo tính bảo mật và quyền riêng tư của khách
          hàng, danh sách này chỉ hiển thị những bé thú cưng đã có ít nhất một lịch hẹn với tài
          khoản của bạn.
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
        onRowClick={(p) => setSelectedPet(p)}
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
        hasLinkedRecords={selectedPet ? hasLinkedRecords(selectedPet.id) : false}
        onEdit={(pet) => {
          setEditingPet(pet);
          setPetModalOpen(true);
        }}
        onDelete={(pet) => {
          const res = deletePet(pet.id);
          if (res.ok) setSelectedPet(null);
        }}
        onClose={() => setSelectedPet(null)}
      />

      {isVet && petModalOpen && (
        <ClientPetFormModal
          key={editingPet ? `edit-${editingPet.id}` : "create-pet"}
          isOpen={petModalOpen}
          editingPet={editingPet}
          owners={allOwners}
          onClose={() => {
            setPetModalOpen(false);
            setEditingPet(null);
          }}
          onSave={(data) => {
            if (editingPet) {
              updatePet(editingPet.id, data);
              if (selectedPet?.id === editingPet.id) {
                setSelectedPet({ ...editingPet, ...data });
              }
            } else {
              addPet(data);
            }
          }}
        />
      )}
    </div>
  );
}
