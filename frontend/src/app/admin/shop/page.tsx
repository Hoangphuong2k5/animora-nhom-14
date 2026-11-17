"use client";

import React from "react";
import {
  ShopWorkspace,
  type ExtendedProduct,
  type ImportSlip,
  type ReturnRequestItem,
  type ShopOrder,
  type SupplierItem,
} from "@/components/shared/operations/shop/ShopWorkspace";

export type {
  ExtendedProduct,
  ShopOrder,
  SupplierItem,
  ImportSlip,
  ReturnRequestItem,
};

export default function AdminShopPage() {
  return <ShopWorkspace mode="readonly" />;
}
