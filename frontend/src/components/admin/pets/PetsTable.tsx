import React, { useEffect, useMemo } from "react";
import { Dog, Phone, Calendar } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { TablePagination, usePagination } from "@/components/ui/table-pagination";
import { AdminPetItem } from "./petsData";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";

interface PetsTableProps {
  pets: AdminPetItem[];
  onSelectPet: (pet: AdminPetItem) => void;
}

export function PetsTable({ pets, onSelectPet }: PetsTableProps) {
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedPets,
  } = usePagination(pets, 5);

  const petsKey = useMemo(() => pets.map((p) => p.id).join(","), [pets]);
  useEffect(() => {
    setCurrentPage(1);
  }, [petsKey, setCurrentPage]);

  return (
    <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
      {pets.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-muted flex items-center justify-center mx-auto text-zinc-400">
            <Dog className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-zinc-600 dark:text-muted-foreground">
            Không tìm thấy hồ sơ thú cưng nào phù hợp
          </p>
        </div>
      ) : (
        <>
        <Table className="w-full text-left text-xs">
          <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
            <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Thú cưng
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Loài &amp; Giống
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Tuổi &amp; Cân nặng
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Chủ sở hữu
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Mã Vi-chip
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Lần khám gần nhất
              </TableHead>
              <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Chi tiết sổ
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
            {paginatedPets.map((p) => (
              <TableRow
                key={p.id}
                className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors group"
              >
                {/* Photo & Name */}
                <TableCell className="py-3.5 px-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.photo}
                      alt={p.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          p.species === "Mèo"
                            ? "/assets/images/about_fluffy_cat_1793177483392.jpg"
                            : p.species === "Chó"
                            ? "/assets/images/hero_golden_retriever_1793177482877.jpg"
                            : "/assets/aistudio/cute_dog_transparent.png";
                      }}
                      className="w-11 h-11 rounded-2xl object-cover border border-zinc-200 dark:border-border shrink-0"
                    />
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-foreground text-sm">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {p.gender} · {p.neutered ? "Đã triệt sản" : "Chưa triệt sản"}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Species & Breed */}
                <TableCell className="py-3.5 px-3 max-w-[200px] whitespace-normal">
                  <div className="font-semibold text-zinc-800 dark:text-foreground/90">
                    {p.breed}
                  </div>
                  <div className="text-[11px] text-zinc-400">{p.species}</div>
                </TableCell>

                {/* Age & Weight */}
                <TableCell className="py-3.5 px-3">
                  <div className="font-bold text-zinc-800 dark:text-foreground/90">
                    {p.weight} kg
                  </div>
                  <div className="text-[11px] text-zinc-400">{p.age}</div>
                </TableCell>

                {/* Owner */}
                <TableCell className="py-3.5 px-3">
                  <div className="font-bold text-zinc-900 dark:text-foreground">
                    {p.ownerName}
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#FF7F6B]" />
                    {p.ownerPhone}
                  </div>
                </TableCell>

                {/* Microchip */}
                <TableCell className="py-3.5 px-3 font-mono font-semibold text-zinc-600 dark:text-muted-foreground text-[11px]">
                  {p.microchip}
                </TableCell>

                {/* Last visit */}
                <TableCell className="py-3.5 px-3 text-zinc-600 dark:text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#FF7F6B]" />
                    <span>{formatDateDdMmYyyy(p.lastVisit)}</span>
                  </div>
                </TableCell>

                {/* Action */}
                <TableCell className="py-3.5 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => onSelectPet(p)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-muted dark:hover:bg-muted font-bold text-zinc-700 dark:text-foreground/80 transition-colors cursor-pointer"
                  >
                    Mở sổ sức khỏe
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        </>
      )}
    </div>
  );
}

