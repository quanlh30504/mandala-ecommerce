"use client";

import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";

interface StatusBadgeProps {
  product: Product;
}

export function StatusBadge({ product }: StatusBadgeProps) {
  if (!product.isActive) {
    return <Badge variant="destructive">Vô hiệu hóa</Badge>;
  }
  if (product.stock === 0) {
    return <Badge variant="secondary">Hết hàng</Badge>;
  }
  return <Badge variant="default">Hoạt động</Badge>;
}
