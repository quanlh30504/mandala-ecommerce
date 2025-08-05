"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useDebouncedCallback } from "use-debounce";

interface QuantitySelectorProps {
  cartItemId: string;
  initialQuantity: number;
  stock: number;
  onQuantityChange: (newQuantity: number) => void;
}

export default function QuantitySelector({
  cartItemId,
  initialQuantity,
  stock,
  onQuantityChange,
}: QuantitySelectorProps) {
  const { isPending } = useCart();
  const [quantity, setQuantity] = useState(initialQuantity);

  const debouncedOnQuantityChange = useDebouncedCallback(
    (newQuantity: number) => {
      onQuantityChange(newQuantity);
    },
    500
  );

  // Đồng bộ state nội bộ với prop từ cha khi nó thay đổi
  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const handleDecrement = () => {
    const newQuantity = Math.max(1, quantity - 1);
    setQuantity(newQuantity); // Cập nhật UI ngay lập tức
    debouncedOnQuantityChange(newQuantity); // Gọi hàm debounced
  };

  const handleIncrement = () => {
    const newQuantity = Math.min(stock, quantity + 1);
    setQuantity(newQuantity); // Cập nhật UI ngay lập tức
    debouncedOnQuantityChange(newQuantity); // Gọi hàm debounced
  };

  return (
    <div className="flex items-center">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={handleDecrement}
        disabled={isPending || quantity <= 1}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        className="h-8 w-14 text-center border-x-0 rounded-none focus-visible:ring-0"
        value={quantity}
        readOnly
      />
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={handleIncrement}
        disabled={isPending || quantity >= stock}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
