import type { Metadata } from "next";
import App from "@/components/AnimoraApp";

export const metadata: Metadata = {
  title: "Cửa hàng vật phẩm | Animora",
  description: "Thức ăn dinh dưỡng, phụ kiện và sản phẩm chăm sóc chính hãng dành cho thú cưng.",
};

export default function ShopPage() {
  return <App initialPage="shop" />;
}