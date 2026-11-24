import type { PetSpeciesCode } from "@/types/expert.type";

/**
 * Nhãn hiển thị chuẩn tiếng Việt cho từng loài thú cưng trên toàn phân hệ Bác sĩ & Chuyên viên.
 */
export const PET_SPECIES_LABELS: Record<PetSpeciesCode, string> = {
  dog: "Chó",
  cat: "Mèo",
  rabbit: "Thỏ",
  hamster: "Chuột cảnh",
};

export function getPetSpeciesLabel(species?: PetSpeciesCode | string): string {
  if (!species) return "Khác";
  return PET_SPECIES_LABELS[species as PetSpeciesCode] ?? String(species);
}
