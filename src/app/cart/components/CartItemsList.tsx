"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import CartItem from "./CartItem";
import { useCart } from "../context/CartContext";
import { useMemo } from "react";

export default function CartItemsList() {
  const { items, selectedItemIds, toggleSelectAll, removeItems, isPending } =
    useCart();

  const allSelected = useMemo(
    () => items.length > 0 && selectedItemIds.length === items.length,
    [items, selectedItemIds]
  );

  const handleDeleteSelected = () => {
    if (selectedItemIds.length > 0) {
      removeItems(selectedItemIds);
    }
  };

  return (
    <div className="w-full lg:w-2/3 space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm grid grid-cols-12 items-center text-sm text-gray-600">
        <div className="col-span-6 flex items-center gap-4">
          <Checkbox
            id="select-all"
            checked={allSelected}
            onCheckedChange={toggleSelectAll}
          />
          <label htmlFor="select-all">Tất cả ({items.length} sản phẩm)</label>
        </div>
        <div className="col-span-2 text-center">Đơn giá</div>
        <div className="col-span-2 text-center">Số lượng</div>
        <div className="col-span-1 text-center">Thành tiền</div>
        <div className="col-span-1 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteSelected}
            disabled={selectedItemIds.length === 0 || isPending} // Vô hiệu hóa nút khi không có gì được chọn hoặc đang xử lý
            title="Xóa các mục đã chọn"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <CartItem key={item._id} item={item} />
        ))}
        {items.length === 0 && (
          <div className="bg-white p-8 text-center rounded-lg">
            <p>Giỏ hàng của bạn đang trống.</p>
          </div>
        )}
      </div>
    </div>
  );
}
