"use client";

import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import QuantitySelector from "./QuantitySelector";
import { Trash2 } from "lucide-react";
import { useCart, PopulatedCartItem } from "../context/CartContext";
import { getImageUrl } from "@/lib/getImageUrl";
import { formatCurrency } from "@/lib/utils";

interface CartItemProps {
  item: PopulatedCartItem;
}

export default function CartItem({ item }: CartItemProps) {
  if (!item || !item.product) {
    console.error("CartItem received invalid data:", item);
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700 text-sm">
        Sản phẩm này không còn tồn tại và sẽ sớm được xóa khỏi giỏ hàng của bạn.
      </div>
    );
  }

  const {
    selectedItemIds,
    toggleItemSelected,
    removeItems,
    updateQuantity,
    isPending,
  } = useCart();

  const isSelected = selectedItemIds.includes(item._id);

  const handleRemove = () => {
    removeItems([item._id]);
  };

  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="grid grid-cols-12 items-center gap-4 pt-4">
        <div className="col-span-1 flex justify-center">
          <Checkbox
            id={`item-${item._id}`}
            checked={isSelected}
            onCheckedChange={() => toggleItemSelected(item._id)}
          />
        </div>
        <div className="col-span-2">
          <Image
            src={
              getImageUrl(item.product.images[0]) || "/products/placeholder.png"
            }
            alt={item.product.name}
            width={80}
            height={80}
            className="rounded-md object-cover"
          />
        </div>
        <div className="col-span-3">
          <p className="font-medium text-sm line-clamp-2">
            {item.product.name}
          </p>
        </div>
        <div className="col-span-2 text-center">
          <p className="font-semibold text-sm text-red-600">
            {formatCurrency(item.product.salePrice || item.product.price)}
          </p>
          {item.product.salePrice && (
            <p className="text-xs text-gray-400 line-through">
              {formatCurrency(item.product.price)}
            </p>
          )}
        </div>
        <div className="col-span-2 flex flex-col items-center">
          <QuantitySelector
            cartItemId={item._id}
            initialQuantity={item.quantity}
            stock={item.product.stock}
            onQuantityChange={(newQuantity) =>
              updateQuantity(item._id, newQuantity)
            }
          />
        </div>
        <div className="col-span-1 text-center font-semibold text-red-600 text-sm">
          {formatCurrency(
            (item.product.salePrice ?? item.product.price) * item.quantity
          )}
        </div>
        <div className="col-span-1 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={isPending}
          >
            <Trash2 className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}
