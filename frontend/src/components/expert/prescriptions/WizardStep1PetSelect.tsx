"use client";

import React, { useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { ExpertAppointment, ExpertPet, ExpertPetOwner } from "@/types/expert.type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WizardStep1PetSelectProps {
  pets: ExpertPet[];
  owners: ExpertPetOwner[];
  appointments: ExpertAppointment[];
  selectedPetId: string;
  onSelectPet: (id: string) => void;
  selectedApptId: string;
  onSelectAppt: (id: string) => void;
}

export function WizardStep1PetSelect({
  pets,
  owners,
  appointments,
  selectedPetId,
  onSelectPet,
  selectedApptId,
  onSelectAppt,
}: WizardStep1PetSelectProps) {
  const filteredAppointments = useMemo(
    () => appointments.filter((a) => !selectedPetId || a.petId === selectedPetId),
    [appointments, selectedPetId]
  );

  const apptItems = useMemo(() => {
    const map: Record<string, string> = {
      __empty__: "-- Không gắn ca khám cụ thể --",
    };
    appointments.forEach((a) => {
      map[a.id] = `${a.code} - ${a.startAt.replace("T", " ")}`;
    });
    return map;
  }, [appointments]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="font-bold text-zinc-700 dark:text-foreground/80">
          Chọn bé thú cưng cần kê đơn *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
          {pets.map((p) => {
            const owner = owners.find((o) => o.id === p.ownerId);
            const isSelected = selectedPetId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => onSelectPet(p.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "border-[#6B1F2E] dark:border-[#FF7F6B] bg-[#6B1F2E]/5 dark:bg-[#FF7F6B]/10 shadow-xs"
                    : "border-zinc-200 dark:border-border hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={p.photo}
                    alt={p.name}
                    className="w-9 h-9 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <div className="font-extrabold text-zinc-900 dark:text-foreground">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {p.breed} • Chủ: {owner?.fullName}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B] shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-1 pt-2">
        <label className="font-bold text-zinc-700 dark:text-foreground/80">
          Liên kết ca khám / lịch hẹn gần nhất (không bắt buộc)
        </label>
        <Select
          value={selectedApptId || "__empty__"}
          onValueChange={(val) => {
            if (val !== null) onSelectAppt(val === "__empty__" ? "" : val);
          }}
          items={apptItems}
        >
          <SelectTrigger className="w-full h-10! px-3 rounded-xl border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs text-zinc-800 dark:text-foreground/90 cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__empty__">-- Không gắn ca khám cụ thể --</SelectItem>
            {filteredAppointments.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.code} - {a.startAt.replace("T", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

