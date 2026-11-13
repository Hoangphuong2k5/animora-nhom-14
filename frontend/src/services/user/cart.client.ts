import { axiosInstance } from "@/lib/axios";

export interface CartItemPayload {
  productId: string | number;
  quantity: number;
}

export async function addToCartClient(payload: CartItemPayload): Promise<boolean> {
  try {
    await axiosInstance.post("/shopping-cart", payload);
    return true;
  } catch {
    return false;
  }
}

export async function getCartCountClient(): Promise<number> {
  try {
    const response = await axiosInstance.get("/shopping-cart");
    const items: Array<{ quantity: number }> = response.data?.items || [];
    return items.reduce((sum, item) => sum + item.quantity, 0);
  } catch {
    return 0;
  }
}
