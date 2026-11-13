"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ServiceNoteModalProps {
  petName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, detail: string) => void;
}

export function ServiceNoteModal({
  petName,
  isOpen,
  onClose,
  onSave,
}: ServiceNoteModalProps) {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title, detail);
    setTitle("");
    setDetail("");
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl border border-zinc-200 dark:border-border bg-white dark:bg-background text-zinc-900 dark:text-foreground p-6 gap-4 shadow-2xl text-xs"
      >
        <DialogHeader className="pr-8">
          <DialogTitle className="font-heading font-extrabold text-base text-zinc-900 dark:text-foreground">
            Thêm Ghi Chú Sau Dịch Vụ Cho Bé {petName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Nhập tiêu đề và chi tiết theo dõi sau dịch vụ chăm sóc thú cưng
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-foreground/80">
              Tiêu đề ghi chú *
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Tình trạng da lông sau buổi tắm thảo mộc"
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-foreground/80">
              Chi tiết theo dõi
            </label>
            <Textarea
              rows={3}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Lông sạch, da không bị kích ứng, móng đã mài gọn..."
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-500 hover:text-zinc-700 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] cursor-pointer"
            >
              Lưu ghi chú
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

