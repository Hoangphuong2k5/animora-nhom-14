import { create } from "zustand";
import { getCartCountClient } from "@/services/user/cart.client";

interface CartStoreState {
  count: number;
  setCount: (count: number) => void;
  fetchCount: () => Promise<void>;
}

export const useCartStore = create<CartStoreState>((set) => ({
  count: 0,
  setCount: (count) => set({ count }),
  fetchCount: async () => {
    const count = await getCartCountClient();
    set({ count });
  },
}));
