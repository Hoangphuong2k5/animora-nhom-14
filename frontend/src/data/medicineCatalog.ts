import { MedicineItem, PetSpeciesCode } from "@/types/expert.type";
import { SHOP_PRODUCTS } from "@/data/shopData";
import type { ShopPetGroup } from "@/types/animora.type";

const MEDICINE_META: Record<
  string,
  { activeIngredient: string; form: string; unit: string; speciesHint: PetSpeciesCode[] }
> = {
  "med-001": {
    activeIngredient: "Amoxicillin + Acid Clavulanic",
    form: "Viên nén bao phim",
    unit: "viên",
    speciesHint: ["dog", "cat"],
  },
  "med-002": {
    activeIngredient: "Meloxicam",
    form: "Hỗn dịch uống",
    unit: "lọ 15ml",
    speciesHint: ["dog", "cat"],
  },
  "med-003": {
    activeIngredient: "Prednisolone",
    form: "Viên nén",
    unit: "viên",
    speciesHint: ["dog", "cat", "rabbit"],
  },
  "med-004": {
    activeIngredient: "Cefalexin",
    form: "Viên nhai ngon miệng",
    unit: "viên",
    speciesHint: ["dog", "cat"],
  },
  "med-005": {
    activeIngredient: "Gentamicin + Dexamethasone + Thiabendazole",
    form: "Dung dịch nhỏ tai",
    unit: "lọ 10g",
    speciesHint: ["dog", "cat"],
  },
  "med-006": {
    activeIngredient: "Oxytetracycline HCl + Polymyxin B",
    form: "Thuốc mỡ tra mắt",
    unit: "tuýp 3.5g",
    speciesHint: ["dog", "cat", "rabbit", "hamster"],
  },
  "med-007": {
    activeIngredient: "Oclacitinib maleate",
    form: "Viên nén",
    unit: "viên",
    speciesHint: ["dog"],
  },
  "med-008": {
    activeIngredient: "Praziquantel + Pyrantel embonate + Febantel",
    form: "Viên hình khúc xương",
    unit: "viên",
    speciesHint: ["dog"],
  },
  "med-009": {
    activeIngredient: "Fipronil + (S)-methoprene + Eprinomectin + Praziquantel",
    form: "Ống nhỏ ngoài da",
    unit: "ống",
    speciesHint: ["cat"],
  },
  "med-010": {
    activeIngredient: "Enterococcus faecium + Kaolin + Pectin",
    form: "Paste uống",
    unit: "tuýp 15ml",
    speciesHint: ["dog", "cat", "rabbit"],
  },
  "med-011": {
    activeIngredient: "Afoxolaner + Milbemycin oxime",
    form: "Viên nhai",
    unit: "viên",
    speciesHint: ["dog"],
  },
  "med-012": {
    activeIngredient: "Enrofloxacin",
    form: "Viên nén",
    unit: "viên",
    speciesHint: ["dog", "cat", "rabbit"],
  },
  "vac-001": {
    activeIngredient: "Virus nhược độc CDV, CAV-2, CPI, CPV + Leptospira",
    form: "Vắc-xin tiêm (Lọ 1 liều)",
    unit: "liều",
    speciesHint: ["dog"],
  },
  "vac-002": {
    activeIngredient: "Virus giảm độc lực FPV, FVR, FCV, Chlamydia felis",
    form: "Vắc-xin tiêm (Lọ 1 liều)",
    unit: "liều",
    speciesHint: ["cat"],
  },
  "vac-003": {
    activeIngredient: "Virus Dại vô hoạt chủng G52 Wistar ≥ 1 IU",
    form: "Vắc-xin vô hoạt (Lọ 1 liều)",
    unit: "liều",
    speciesHint: ["dog", "cat"],
  },
  "vac-004": {
    activeIngredient: "Bordetella bronchiseptica B-C2 + CPi",
    form: "Vắc-xin nhỏ mũi (Lọ 1 liều)",
    unit: "liều",
    speciesHint: ["dog"],
  },
};

function mapShopGroupsToSpecies(groups?: ShopPetGroup[]): PetSpeciesCode[] {
  const result = new Set<PetSpeciesCode>();
  for (const g of groups ?? []) {
    if (g === "dog") result.add("dog");
    if (g === "cat") result.add("cat");
    if (g === "rabbit_rodent") {
      result.add("rabbit");
      result.add("hamster");
    }
  }
  return result.size > 0 ? Array.from(result) : ["dog", "cat"];
}

/**
 * Danh mục thuốc kê đơn (Rx Only) lấy trực tiếp từ danh mục sản phẩm của Shop (SHOP_PRODUCTS).
 * Bác sĩ chỉ được kê các thuốc có trong kho Shop để đảm bảo đồng bộ giá, tồn kho và luồng mua lại theo đơn.
 */
export const MEDICINE_CATALOG: MedicineItem[] = SHOP_PRODUCTS.filter(
  (p) => p.requiresPrescription && p.medicineId
).map((product) => {
  const medId = product.medicineId!;
  const meta = MEDICINE_META[medId];
  return {
    id: medId,
    shopProductId: product.id,
    name: product.name,
    activeIngredient: meta?.activeIngredient ?? product.ingredientsVi ?? product.name,
    form: meta?.form ?? product.spec ?? "Dược phẩm",
    unit: meta?.unit ?? "đơn vị",
    price: product.price,
    stock: product.stock ?? 0,
    requiresPrescription: true,
    speciesHint: meta?.speciesHint ?? mapShopGroupsToSpecies(product.petTypes),
  };
});
