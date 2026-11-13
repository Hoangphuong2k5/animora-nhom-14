"use client";

import React from "react";
import { AlertTriangle, Loader2, Save } from "lucide-react";

interface UnsavedChangesBarAndModalProps {
  isDirty: boolean;
  isSaving: boolean;
  lang: "vi" | "en";
  pendingNavHref: string | null;
  onDiscardChanges: () => void;
  onSaveClick: () => void;
  onCancelLeave: () => void;
  onConfirmLeaveWithoutSaving: () => void;
}

export function UnsavedChangesBarAndModal({
  isDirty,
  isSaving,
  lang,
  pendingNavHref,
  onDiscardChanges,
  onSaveClick,
  onCancelLeave,
  onConfirmLeaveWithoutSaving,
}: UnsavedChangesBarAndModalProps) {
  return (
    <>
      {/* Mục 23: Thanh lưu cố định ở đáy màn hình trên điện thoại khi có thay đổi chưa lưu */}
      {isDirty && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate">
              {lang === "en" ? "Unsaved changes" : "Có thay đổi chưa lưu"}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isSaving}
              onClick={onDiscardChanges}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-[#6B1F2E] text-[#6B1F2E] dark:border-zinc-600 dark:text-zinc-300 hover:bg-[#6B1F2E]/5 disabled:opacity-50 cursor-pointer"
            >
              {lang === "en" ? "Discard" : "Hoàn tác"}
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={onSaveClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-[#FF7F6B] animate-spin" />
                  <span>{lang === "en" ? "Saving..." : "Đang lưu..."}</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-[#FF7F6B]" />
                  <span>{lang === "en" ? "Save profile" : "Lưu hồ sơ"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Hộp thoại Cảnh báo rời trang khi có thay đổi chưa lưu (Mục 16) */}
      {pendingNavHref && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={onCancelLeave}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl p-6 space-y-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold font-heading text-zinc-900 dark:text-zinc-100">
                  {lang === "en"
                    ? "Unsaved profile changes"
                    : "Cảnh báo thay đổi chưa được lưu"}
                </h4>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {lang === "en"
                    ? "You have unsaved edits on your profile. If you leave this page now, your changes will be lost."
                    : "Bạn đang có thông tin chỉnh sửa trên hồ sơ cá nhân chưa được lưu. Nếu rời trang lúc này, các thay đổi sẽ bị mất."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onConfirmLeaveWithoutSaving}
                className="px-4 py-2 rounded-xl font-bold border border-[#6B1F2E] text-[#6B1F2E] dark:border-zinc-600 dark:text-zinc-300 hover:bg-[#6B1F2E]/5 transition-colors cursor-pointer"
              >
                {lang === "en"
                  ? "Leave without saving"
                  : "Rời trang và bỏ thay đổi"}
              </button>
              <button
                type="button"
                onClick={onCancelLeave}
                className="px-4 py-2 rounded-xl font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors cursor-pointer shadow-xs"
              >
                {lang === "en" ? "Stay on page" : "Ở lại trang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

