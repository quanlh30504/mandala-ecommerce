"use client";
import { useMemo, useTransition } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/app/cart/context/CartContext";
import { Loader2, MapPin } from "lucide-react";
import type { AddressType } from "@/types/address";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface OrderSummaryProps {
  selectedAddress: AddressType | undefined;
  onOpenAddressModal: () => void;
}

export default function OrderSummary({
  selectedAddress,
  onOpenAddressModal,
}: OrderSummaryProps) {
  const router = useRouter();
  const { items, selectedItemIds } = useCart();
  const [isPending, startTransition] = useTransition();

  const { totalOriginal, totalDiscount, totalFinal, selectedCount } =
    useMemo(() => {
      const selectedItems = items.filter((item) =>
        selectedItemIds.includes(item._id)
      );
      const original = selectedItems.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0
      );
      const final = selectedItems.reduce(
        (acc, item) =>
          acc + (item.product.salePrice ?? item.product.price) * item.quantity,
        0
      );
      return {
        totalOriginal: original,
        totalFinal: final,
        totalDiscount: original - final,
        selectedCount: selectedItems.length,
      };
    }, [items, selectedItemIds]);

  const handleProceedToCheckout = () => {
    if (selectedCount === 0) {
      toast.error("Vui lòng chọn sản phẩm để thanh toán.");
      return;
    }
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng.");
      onOpenAddressModal(); // Mở modal chọn địa chỉ
      return;
    }

    // Sử dụng useTransition để chuyển trang không bị block UI
    startTransition(() => {
      const query = new URLSearchParams({
        items: selectedItemIds.join(","),
        addressId: selectedAddress._id,
      }).toString();
      router.push(`/checkout?${query}`);
    });
  };

  return (
    <div className="w-full lg:w-1/3 sticky top-6 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Giao tới</CardTitle>
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={onOpenAddressModal}
            >
              Thay đổi
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedAddress ? (
            <>
              <div className="font-semibold text-sm">
                <p>
                  {selectedAddress.fullName} | {selectedAddress.phoneNumber}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {`${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.city}`}
              </p>
            </>
          ) : (
            <div className="flex items-center text-muted-foreground text-sm py-2">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <p>Chưa có địa chỉ giao hàng.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <p>Tạm tính</p>
              <p>{formatCurrency(totalOriginal)}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p>Giảm giá</p>
              <p className="text-red-500">-{formatCurrency(totalDiscount)}</p>
            </div>
          </div>
          <div className="border-t my-4"></div>
          <div className="flex justify-between font-semibold">
            <p>Tổng tiền</p>
            <p className="text-red-600 text-lg">{formatCurrency(totalFinal)}</p>
          </div>
          <p className="text-xs text-gray-500 text-right mt-1">
            (Đã bao gồm VAT nếu có)
          </p>
          <Button
            className="w-full mt-6 bg-red-600 hover:bg-red-700 text-lg h-12"
            disabled={selectedCount === 0 || !selectedAddress || isPending}
            onClick={handleProceedToCheckout}
          >
            {isPending ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              `Mua Hàng (${selectedCount})`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
