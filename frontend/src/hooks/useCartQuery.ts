"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys.constant";
import {
  addToCartClient,
  getCartCountClient,
  type CartItemPayload,
} from "@/services/user/cart.client";

export function useCartCountQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.cart.count,
    queryFn: getCartCountClient,
  });
}

export function useAddToCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CartItemPayload) => addToCartClient(payload),
    onSuccess: () => {
      // Tự động làm mới số lượng giỏ hàng trên Header ngay sau khi thêm sản phẩm thành công
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all });
    },
  });
}
