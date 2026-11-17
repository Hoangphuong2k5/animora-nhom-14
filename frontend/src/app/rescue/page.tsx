"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  HeartHandshake,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { TablePagination } from "@/components/ui/table-pagination";
import { AdoptionRequest } from "@/types";
import {
  canTransitionAdoptionRequest,
  getRequestStatusBadgeClass,
  getRequestStatusLabel,
} from "@/components/manager/adoptions/managerAdoptionsData";
import {
  ADOPTION_SYNC_EVENT,
  RescueAdoptionPet,
  loadRescuePets,
  loadRescueRequests,
  saveRescuePets,
  saveRescueRequests,
  syncAdoptedPetToCustomerProfiles,
  useActiveRescueShelterFilter,
} from "@/data/rescuePortalData";
import { pushManagerNotification } from "@/utils/clinicalSync";
import { formatDateDdMmYyyy, getTomorrowIso } from "@/utils/dateFormat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const PAGE_SIZE = 5;

function matchesShelterName(petShelter?: string, activeShelter?: string): boolean {
  if (!activeShelter || activeShelter === "all") return true;
  if (!petShelter) return false;
  const a = petShelter.toLowerCase();
  const b = activeShelter.toLowerCase();
  return (
    a === b ||
    b.includes(a) ||
    a.includes(b) ||
    (a.includes("hanoi") && b.includes("hanoi")) ||
    (a.includes("saigon") && b.includes("saigon")) ||
    (a.includes("yêu động vật") && b.includes("yêu động vật"))
  );
}

export default function RescueRequestsPage() {
  const [activeShelter] = useActiveRescueShelterFilter();
  const [pets, setPets] = useState<RescueAdoptionPet[]>([]);
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);

  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "reviewing" | "approved" | "completed" | "rejected"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedReq, setSelectedReq] = useState<AdoptionRequest | null>(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [reviewNote, setReviewNote] = useState("");

  useEffect(() => {
    const syncAll = () => {
      setPets(loadRescuePets());
      setRequests(loadRescueRequests());
    };
    syncAll();
    window.addEventListener(ADOPTION_SYNC_EVENT, syncAll);
    window.addEventListener("storage", syncAll);
    return () => {
      window.removeEventListener(ADOPTION_SYNC_EVENT, syncAll);
      window.removeEventListener("storage", syncAll);
    };
  }, []);

  const scopedRequests = useMemo(() => {
    if (activeShelter === "all") return requests;
    return requests.filter((r) => {
      const pet = pets.find((p) => p.id === r.petId);
      return matchesShelterName(pet?.shelterName, activeShelter);
    });
  }, [requests, pets, activeShelter]);

  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return scopedRequests.filter((r) => {
      const status = r.status || "pending";
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (q) {
        return (
          (r.requestCode || r.id).toLowerCase().includes(q) ||
          r.applicantName.toLowerCase().includes(q) ||
          r.petName.toLowerCase().includes(q) ||
          r.phone.includes(q)
        );
      }
      return true;
    });
  }, [scopedRequests, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRequests = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredRequests.slice(start, start + PAGE_SIZE);
  }, [filteredRequests, safePage]);

  const handleProcessRequest = (
    requestId: string,
    nextStatus: "pending" | "reviewing" | "approved" | "completed" | "rejected",
    extraNote?: string
  ) => {
    const existingReq = requests.find((r) => r.id === requestId);
    if (!existingReq || !canTransitionAdoptionRequest(existingReq.status, nextStatus)) {
      toast.error("Trạng thái hồ sơ không hợp lệ cho thao tác này!");
      return;
    }

    let petIdToAdopt: string | undefined;
    let targetReq: AdoptionRequest | undefined;

    const updatedRequests = requests.map((r) => {
      if (r.id === requestId) {
        if (nextStatus === "completed") petIdToAdopt = r.petId;
        const nextReq: AdoptionRequest = {
          ...r,
          status: nextStatus,
          notes: extraNote
            ? `${r.notes ? r.notes + "\n" : ""}[TCH · ${formatDateDdMmYyyy(
                new Date()
              )}]: ${extraNote}`
            : r.notes,
        };
        targetReq = nextReq;
        return nextReq;
      }
      return r;
    });

    setRequests(updatedRequests);
    saveRescueRequests(updatedRequests);

    if (nextStatus === "completed" && petIdToAdopt) {
      const targetPet = pets.find((p) => p.id === petIdToAdopt);
      const updatedPets = pets.map((p) =>
        p.id === petIdToAdopt ? { ...p, status: "adopted" as const } : p
      );
      setPets(updatedPets);
      saveRescuePets(updatedPets);

      const syncResult = syncAdoptedPetToCustomerProfiles(
        targetPet,
        targetReq?.applicantName || "Khách hàng nhận nuôi"
      );

      pushManagerNotification({
        type: "adoption",
        title: `Hoàn tất nhận nuôi bé ${targetReq?.petName || ""}`,
        desc: `${targetReq?.applicantName} đã hoàn tất nhận nuôi (${
          syncResult.action === "linked"
            ? "đã liên kết hồ sơ hiện có"
            : "đã tạo hồ sơ mới"
        }).`,
        href: "/manager/adoptions?tab=requests",
      });

      toast.success(
        syncResult.action === "linked"
          ? "Đã hoàn tất bàn giao và chuyển quyền hồ sơ thú cưng hiện có sang chủ mới (không tạo trùng)!"
          : "Đã hoàn tất bàn giao bé cưng và tạo hồ sơ thú cưng cho chủ mới!"
      );
    } else if (nextStatus === "reviewing") {
      toast.info("Đã hẹn lịch phỏng vấn / khảo sát với người xin nhận nuôi!");
    } else if (nextStatus === "approved") {
      toast.success("Đã phê duyệt hồ sơ! Sẵn sàng bàn giao thú cưng.");
    } else if (nextStatus === "rejected") {
      toast.info("Đã từ chối yêu cầu nhận nuôi.");
    }

    setSelectedReq(null);
  };

  const pendingCount = scopedRequests.filter(
    (r) => !r.status || r.status === "pending"
  ).length;
  const reviewingCount = scopedRequests.filter(
    (r) => r.status === "reviewing"
  ).length;
  const approvedCount = scopedRequests.filter(
    (r) => r.status === "approved"
  ).length;
  const completedCount = scopedRequests.filter(
    (r) => r.status === "completed"
  ).length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
          <ClipboardList className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          Tiếp Nhận &amp; Xử Lý Yêu Cầu Nhận Nuôi
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Xét duyệt hồ sơ, hẹn phỏng vấn, cập nhật trạng thái thú cưng và tự động liên kết/tạo hồ sơ không trùng lặp khi hoàn tất
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Chờ xét duyệt",
            value: pendingCount,
            tone: "text-amber-600 dark:text-amber-400",
          },
          {
            label: "Đang phỏng vấn",
            value: reviewingCount,
            tone: "text-sky-600 dark:text-sky-400",
          },
          {
            label: "Đã duyệt (Chờ bàn giao)",
            value: approvedCount,
            tone: "text-[#6B1F2E] dark:text-[#FF7F6B]",
          },
          {
            label: "Đã hoàn tất nhận nuôi",
            value: completedCount,
            tone: "text-emerald-600 dark:text-emerald-400",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm"
          >
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-muted-foreground">
              {kpi.label}
            </div>
            <div className={`text-xl font-extrabold mt-1 ${kpi.tone}`}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm mã hồ sơ, người nộp đơn, tên bé, SĐT..."
            className="w-full h-10 pl-9 pr-9 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              aria-label="Xóa tìm kiếm"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "all", label: "Tất cả" },
              { id: "pending", label: "Chờ duyệt" },
              { id: "reviewing", label: "Đang phỏng vấn" },
              { id: "approved", label: "Đã duyệt" },
              { id: "completed", label: "Hoàn tất" },
              { id: "rejected", label: "Từ chối" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-zinc-100 dark:bg-muted/60 text-zinc-600 dark:text-muted-foreground hover:bg-zinc-200/70 dark:hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
        <Table className="w-full text-left text-xs">
          <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
            <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Mã hồ sơ
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Người nộp đơn
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Bé cưng muốn nhận
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Điều kiện &amp; Cam kết
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Ngày gửi
              </TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Trạng thái
              </TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Xử lý
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
            {paginatedRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-zinc-400">
                  Không có yêu cầu nhận nuôi nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRequests.map((r) => (
                <TableRow
                  key={r.id}
                  className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors"
                >
                  <TableCell className="py-3.5 px-3 font-mono font-bold text-zinc-900 dark:text-foreground">
                    {r.requestCode}
                  </TableCell>
                  <TableCell className="py-3.5 px-3">
                    <div className="font-bold text-zinc-900 dark:text-foreground">
                      {r.applicantName}
                    </div>
                    <div className="text-[11px] text-zinc-400">{r.phone}</div>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                    {r.petName}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 max-w-[260px] whitespace-normal text-zinc-600 dark:text-muted-foreground">
                    {r.housingType && (
                      <span className="font-semibold text-zinc-800 dark:text-foreground mr-1">
                        [{r.housingType === "house" ? "Nhà riêng" : "Chung cư"}]
                      </span>
                    )}
                    <span className="whitespace-pre-line">{r.notes}</span>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-zinc-500 font-mono">
                    {formatDateDdMmYyyy(r.createdAt)}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getRequestStatusBadgeClass(
                        r.status
                      )}`}
                    >
                      {getRequestStatusLabel(r.status)}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-center whitespace-nowrap">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      {(!r.status ||
                        r.status === "pending" ||
                        r.status === "reviewing") && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReq(r);
                            setInterviewDate(`${getTomorrowIso()}T09:00`);
                            setReviewNote("");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] cursor-pointer"
                        >
                          Xét duyệt
                        </button>
                      )}
                      {r.status === "approved" && (
                        <button
                          type="button"
                          onClick={() => handleProcessRequest(r.id, "completed")}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Hoàn tất bàn giao</span>
                        </button>
                      )}
                      {r.status === "completed" && (
                        <span className="text-[11px] font-bold text-emerald-600">
                          Đã về nhà mới
                        </span>
                      )}
                      {r.status === "rejected" && (
                        <span className="text-[11px] font-semibold text-rose-500">
                          Đã từ chối
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          tone="rescue"
        />
      </div>

      {/* Modal Xét Duyệt Hồ Sơ Nhận Nuôi */}
      <Dialog
        open={Boolean(selectedReq)}
        onOpenChange={(open) => {
          if (!open) setSelectedReq(null);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-rose-500" />
              Xét Duyệt Hồ Sơ {selectedReq?.requestCode}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ứng viên: <strong>{selectedReq?.applicantName}</strong> ({selectedReq?.phone}) · Bé{" "}
              <strong>{selectedReq?.petName}</strong>
            </DialogDescription>
          </DialogHeader>

          {selectedReq && (
            <div className="space-y-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-muted/50 border border-border/60 whitespace-pre-line">
                {selectedReq.notes || "Không có ghi chú thêm."}
              </div>

              {(!selectedReq.status || selectedReq.status === "pending") && (
                <div className="space-y-1">
                  <label className="font-semibold text-foreground/80 block">
                    Hẹn ngày phỏng vấn / khảo sát điều kiện
                  </label>
                  <input
                    type="datetime-local"
                    min={`${getTomorrowIso()}T00:00`}
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-muted/40 text-xs"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-foreground/80 block">
                  Ghi chú kết quả xét duyệt
                </label>
                <Textarea
                  rows={2}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Nhận xét điều kiện nhà ở, lưới ban công, cam kết chăm sóc..."
                  className="rounded-xl text-xs resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    handleProcessRequest(
                      selectedReq.id,
                      "rejected",
                      reviewNote || "Không đạt điều kiện chăm sóc hoặc môi trường sống."
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 font-bold cursor-pointer"
                >
                  Từ chối
                </button>
                {(!selectedReq.status || selectedReq.status === "pending") && (
                  <button
                    type="button"
                    onClick={() =>
                      handleProcessRequest(
                        selectedReq.id,
                        "reviewing",
                        interviewDate
                          ? `Hẹn phỏng vấn: ${formatDateDdMmYyyy(interviewDate)}${
                              reviewNote ? ` · ${reviewNote}` : ""
                            }`
                          : reviewNote || "Đang liên hệ hẹn lịch phỏng vấn."
                      )
                    }
                    className="px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-600 dark:text-sky-400 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Hẹn phỏng vấn</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    handleProcessRequest(
                      selectedReq.id,
                      "approved",
                      reviewNote || "Đạt điều kiện nhận nuôi."
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Duyệt nhận nuôi
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
