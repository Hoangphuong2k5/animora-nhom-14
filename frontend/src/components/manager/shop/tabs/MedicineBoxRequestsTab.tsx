"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  BriefcaseMedical,
  CheckCircle2,
  History,
  Layers,
  PackagePlus,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { RejectReasonDialog } from "@/components/manager/staff/RejectReasonDialog";
import type {
  MedicineBoxItem,
  MedicineBoxLogEntry,
  MedicineBoxRequest,
} from "@/types/expert.type";
import {
  type DoctorShelfOverviewRow,
  checkProductDeletionConstraints,
  readAllDoctorsShelfMap,
  reviewMedicineBoxRequest,
} from "@/utils/medicineBoxSync";

interface MedicineBoxRequestsTabProps {
  requests: MedicineBoxRequest[];
  items: MedicineBoxItem[];
  overviewRows?: DoctorShelfOverviewRow[];
  logs?: MedicineBoxLogEntry[];
  onRefresh: () => void;
  onCreatePOForMedicine?: (shopProductId: string, supplierName?: string) => void;
  readOnly?: boolean;
}

export function MedicineBoxRequestsTab({
  requests,
  items,
  overviewRows = [],
  logs = [],
  onRefresh,
  onCreatePOForMedicine,
  readOnly = false,
}: MedicineBoxRequestsTabProps) {
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "approved" | "rejected" | "all"
  >("pending");
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const filtered = requests.filter(
    (r) => statusFilter === "all" || r.status === statusFilter
  );

  const allDoctorsShelves = readAllDoctorsShelfMap();

  const handleApprove = (reqId: string) => {
    if (readOnly) return;
    const res = reviewMedicineBoxRequest(reqId, "approved");
    if (!res.ok) {
      toast.error(res.error || "Không thể phê duyệt yêu cầu.");
      return;
    }
    if (res.createdProductId) {
      toast.success(
        "Đã duyệt tạo SKU thuốc mới! Bạn có thể bấm 'Tạo PO nhập từ NCC' ngay bên cạnh để đặt hàng."
      );
    } else {
      toast.success("Đã phê duyệt yêu cầu và cập nhật số lượng Kệ ↔ Kho!");
    }
    onRefresh();
  };

  const handleConfirmReject = (reason: string) => {
    if (readOnly || !rejectTarget) return;
    const res = reviewMedicineBoxRequest(rejectTarget, "rejected", reason);
    if (!res.ok) {
      toast.error(res.error || "Không thể từ chối yêu cầu.");
    } else {
      toast.info("Đã từ chối yêu cầu và gửi phản hồi cho Bác sĩ.");
      onRefresh();
    }
    setRejectTarget(null);
  };

  return (
    <TabsContent value="medicine-box" className="space-y-5">
      <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
              <BriefcaseMedical className="w-5 h-5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              {readOnly
                ? "Tra Cứu Yêu Cầu Hộp Thuốc Bác Sĩ (Chỉ Xem)"
                : "Duyệt Yêu Cầu Hộp Thuốc Bác Sĩ (Thêm / Xóa Kệ / Ngừng Kinh Doanh)"}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Duyệt bổ sung sẽ chuyển từ kho chung sang kệ riêng của Bác sĩ gửi. Khi nhập kho PO thuốc/vắc-xin, hệ thống tự động chia đều cho tất cả Bác sĩ.
            </p>
          </div>

          <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-zinc-100/80 dark:bg-muted/50 p-1 border border-zinc-200/70 dark:border-border/60 text-xs w-fit">
            {(["pending", "approved", "rejected", "all"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                  statusFilter === s
                    ? "bg-[#6B1F2E] text-white shadow-xs"
                    : "text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground"
                }`}
              >
                {
                  {
                    pending: "Chờ duyệt",
                    approved: "Đã duyệt",
                    rejected: "Từ chối",
                    all: "Tất cả",
                  }[s]
                }
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs">
            <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
              <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                <TableHead className="py-3 px-3 text-zinc-500 uppercase tracking-wider font-semibold text-[11px]">
                  Bác sĩ gửi
                </TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 uppercase tracking-wider font-semibold text-[11px]">
                  Loại yêu cầu
                </TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 uppercase tracking-wider font-semibold text-[11px]">
                  Thuốc &amp; Số lượng
                </TableHead>
                <TableHead className="py-3 px-3 text-center text-zinc-500 uppercase tracking-wider font-semibold text-[11px]">
                  Đối chiếu Kệ BS / Kho
                </TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 uppercase tracking-wider font-semibold text-[11px]">
                  Lý do &amp; Ràng buộc
                </TableHead>
                <TableHead className="py-3 px-3 text-center text-zinc-500 uppercase tracking-wider font-semibold text-[11px]">
                  Trạng thái
                </TableHead>
                <TableHead className="py-3 px-3 text-right text-zinc-500 uppercase tracking-wider font-semibold text-[11px]">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-zinc-100 dark:divide-border/60">
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-zinc-400">
                    Không có yêu cầu hộp thuốc nào phù hợp bộ lọc.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((req) => {
                  const matched = items.find(
                    (it) =>
                      (req.shopProductId && it.shopProductId === req.shopProductId) ||
                      (req.medicineId && it.id === req.medicineId)
                  );
                  const requesterShelfStock = matched
                    ? allDoctorsShelves[req.expertId]?.[matched.shopProductId]
                        ?.shelfStock ?? 0
                    : 0;

                  const insufficientWarehouse =
                    req.status === "pending" &&
                    req.type === "add" &&
                    !req.isNewMedicineProposal &&
                    matched &&
                    matched.warehouseStock < req.quantity;

                  const canCreatePOForRow =
                    !readOnly &&
                    Boolean(onCreatePOForMedicine) &&
                    matched &&
                    (insufficientWarehouse ||
                      (req.type === "add" &&
                        req.isNewMedicineProposal &&
                        req.status === "approved" &&
                        matched.warehouseStock <= 0));

                  const discontinueConstraints =
                    req.type === "discontinue" && req.status === "pending" && matched
                      ? checkProductDeletionConstraints(matched.shopProductId)
                      : null;

                  return (
                    <TableRow
                      key={req.id}
                      className="hover:bg-zinc-50 dark:hover:bg-muted/40 transition-colors"
                    >
                      <TableCell className="py-3 px-3 font-bold text-zinc-900 dark:text-foreground">
                        {req.expertName}
                      </TableCell>

                      <TableCell className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            req.type === "add"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : req.type === "discontinue"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                          }`}
                        >
                          {req.type === "add"
                            ? req.isNewMedicineProposal
                              ? "Đề xuất thuốc mới"
                              : "Thêm lên kệ"
                            : req.type === "discontinue"
                            ? "Đề xuất ngừng KD Shop"
                            : req.removeAll
                            ? "Xóa toàn bộ khỏi kệ"
                            : "Xóa khỏi kệ"}
                        </span>
                        {req.type === "remove" && (
                          <div className="text-[10px] text-zinc-500 mt-0.5">
                            {req.returnToWarehouse ? "Hoàn trả kho" : "Xuất hủy"}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="py-3 px-3">
                        <div className="font-bold text-zinc-900 dark:text-foreground">
                          {req.medicineName}
                        </div>
                        {req.type !== "discontinue" && (
                          <div className="text-[11px] font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                            Số lượng: {req.quantity} {req.unit}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="py-3 px-3 text-center whitespace-nowrap">
                        {matched ? (
                          <div className="space-y-0.5 text-[11px]">
                            <div>
                              Kệ BS: <strong>{requesterShelfStock}</strong> • Kho chung:{" "}
                              <strong
                                className={
                                  insufficientWarehouse ? "text-rose-600" : "text-emerald-600"
                                }
                              >
                                {matched.warehouseStock}
                              </strong>
                            </div>
                            {insufficientWarehouse && (
                              <div className="inline-flex items-center gap-0.5 text-[10px] text-rose-600 font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Kho không đủ</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-sky-600 font-semibold">
                            Thuốc mới ngoài kho
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="py-3 px-3 max-w-[260px] whitespace-normal">
                        <div className="text-zinc-700 dark:text-zinc-300">
                          {req.reason}
                        </div>
                        {discontinueConstraints &&
                          discontinueConstraints.reasons.length > 0 && (
                            <div className="text-[10px] text-amber-700 dark:text-amber-300 mt-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">
                              Ràng buộc: {discontinueConstraints.reasons.join(" · ")} (Sẽ chuyển sang Ẩn / Ngừng bán mới).
                            </div>
                          )}
                        {req.adminNote && (
                          <div className="text-[10px] text-zinc-500 mt-1 bg-zinc-100 dark:bg-muted px-2 py-0.5 rounded">
                            QL: {req.adminNote}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            req.status === "approved"
                              ? "bg-emerald-100 text-emerald-700"
                              : req.status === "rejected"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {req.status === "approved"
                            ? "Đã duyệt"
                            : req.status === "rejected"
                            ? "Từ chối"
                            : "Chờ duyệt"}
                        </span>
                      </TableCell>

                      <TableCell className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {canCreatePOForRow && matched && (
                            <button
                              type="button"
                              onClick={() =>
                                onCreatePOForMedicine?.(
                                  matched.shopProductId,
                                  "Công ty CP Dược Thú Y Vemedim"
                                )
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
                              title="Mở form tạo đơn PO gửi Nhà cung cấp Dược"
                            >
                              <PackagePlus className="w-3.5 h-3.5" />
                              Tạo PO NCC
                            </button>
                          )}

                          {!readOnly && req.status === "pending" ? (
                            <>
                              <button
                                type="button"
                                disabled={Boolean(insufficientWarehouse)}
                                onClick={() => handleApprove(req.id)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white transition-colors ${
                                  insufficientWarehouse
                                    ? "bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed"
                                    : "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Duyệt
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectTarget(req.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Từ chối
                              </button>
                            </>
                          ) : (
                            !canCreatePOForRow && (
                              <span className="text-[11px] text-zinc-400">
                                {readOnly ? "Chỉ xem" : "Đã xử lý"}
                              </span>
                            )
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Tổng quan phân bổ Kệ từng Bác sĩ vs Kho chung */}
      {overviewRows.length > 0 && (
        <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              Đối Chiếu Kho Chung &amp; Hộp Thuốc Từng Bác Sĩ
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Số lượng đã phân bổ lên kệ các Bác sĩ được theo dõi tách biệt, không cộng trùng vào tồn kho chung chưa phân bổ.
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table className="w-full text-left text-xs">
              <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
                <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                  <TableHead className="py-2.5 px-3 text-zinc-500 uppercase text-[11px] font-semibold">
                    Thuốc / Vắc-xin
                  </TableHead>
                  <TableHead className="py-2.5 px-3 text-center text-zinc-500 uppercase text-[11px] font-semibold">
                    Kho chung
                  </TableHead>
                  {overviewRows[0]?.byDoctor.map((doc) => (
                    <TableHead
                      key={doc.expertId}
                      className="py-2.5 px-3 text-center text-zinc-500 uppercase text-[11px] font-semibold"
                    >
                      {doc.expertName.replace(/^BS\.\s*/, "")}
                    </TableHead>
                  ))}
                  <TableHead className="py-2.5 px-3 text-center text-zinc-500 uppercase text-[11px] font-semibold">
                    Tổng trên kệ
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-zinc-100 dark:divide-border/60">
                {overviewRows.slice(0, 12).map((row) => (
                  <TableRow key={row.shopProductId}>
                    <TableCell className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-foreground">
                      {row.medicineName}
                      {row.isHidden && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                          Ngừng KD
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 text-center font-bold text-emerald-600">
                      {row.warehouseStock} {row.unit}
                    </TableCell>
                    {row.byDoctor.map((d) => (
                      <TableCell
                        key={d.expertId}
                        className="py-2.5 px-3 text-center font-semibold text-zinc-700 dark:text-zinc-300"
                      >
                        {d.shelfStock}
                      </TableCell>
                    ))}
                    <TableCell className="py-2.5 px-3 text-center font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {row.totalAllocatedOnShelves} {row.unit}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Lịch sử phân bổ & sử dụng thuốc toàn viện */}
      {logs.length > 0 && (
        <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
            <History className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            Nhật Ký Phân Bổ &amp; Sử Dụng Thuốc Gần Đây
          </h3>
          <div className="divide-y divide-zinc-100 dark:divide-border/60 text-xs">
            {logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-zinc-900 dark:text-foreground">
                    {log.expertName}
                  </span>{" "}
                  — <span className="font-semibold">{log.medicineName}</span>
                  {log.note && (
                    <div className="text-[11px] text-zinc-500">{log.note}</div>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono">
                  <span
                    className={`font-extrabold ${
                      log.quantityDelta > 0
                        ? "text-emerald-600"
                        : log.quantityDelta < 0
                        ? "text-rose-600"
                        : "text-zinc-500"
                    }`}
                  >
                    {log.quantityDelta > 0
                      ? `+${log.quantityDelta}`
                      : log.quantityDelta}{" "}
                    {log.unit}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    ({log.beforeShelfStock} → {log.afterShelfStock})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!readOnly && (
        <RejectReasonDialog
          open={Boolean(rejectTarget)}
          onCancel={() => setRejectTarget(null)}
          title="Từ chối yêu cầu hộp thuốc"
          description="Nhập lý do từ chối để bác sĩ nắm thông tin và điều chỉnh lại."
          onConfirm={handleConfirmReject}
        />
      )}
    </TabsContent>
  );
}
