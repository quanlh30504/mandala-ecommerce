"use client";

import { useState, useMemo, useTransition } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/cart/context/CartContext";
import { placeOrder } from "@/lib/actions/order";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { PaymentMethod } from "@/models/Order";
import type { PopulatedCartItem } from "@/app/cart/context/CartContext";
import { formatCurrency } from "@/lib/utils";
interface PaymentOptionsProps {
  selectedAddressId: string | undefined;
  mandalaPayBalance: number;
  checkoutItems: PopulatedCartItem[];
  shippingFee: number;
}

export default function PaymentOptions({
  selectedAddressId,
  mandalaPayBalance,
  checkoutItems = [],
  shippingFee,
}: PaymentOptionsProps) {
  const { clearOrderedItems } = useCart();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [isPending, startTransition] = useTransition();

  const { totalOriginal, totalDiscount, grandTotal } = useMemo(() => {
    const original = checkoutItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    const final = checkoutItems.reduce(
      (acc, item) =>
        acc + (item.product.salePrice ?? item.product.price) * item.quantity,
      0
    );

    return {
      totalOriginal: original,
      totalDiscount: original - final,
      grandTotal: final + shippingFee,
    };
  }, [checkoutItems, shippingFee]);

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      toast.error("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }

    startTransition(async () => {
      const itemIds = checkoutItems.map((item) => item._id);
      const result = await placeOrder({
        selectedCartItemIds: itemIds,
        shippingAddressId: selectedAddressId,
        paymentMethod: paymentMethod,
      });

      if (result.success) {
        toast.success(result.message);
        clearOrderedItems(itemIds);
        router.push(`/profile/orders/${result.orderId}`);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Card Tóm tắt đơn hàng */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <p>Tạm tính</p>
              <p>{formatCurrency(totalOriginal)}</p>
            </div>
            <div className="flex justify-between text-sm text-red-400">
              <p>Giảm giá</p>
              <p>- {formatCurrency(totalDiscount)}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p>Phí vận chuyển</p>
              <p>{formatCurrency(shippingFee)}</p>
            </div>
          </div>
          <div className="border-t my-4"></div>
          <div className="flex justify-between font-semibold">
            <p>Tổng tiền</p>
            <p className="text-red-600 text-lg">{formatCurrency(grandTotal)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Card Lựa chọn thanh toán */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Chọn hình thức thanh toán</h3>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
          >
            <Label className="flex items-center p-4 border rounded-lg cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:ring-1 has-[:checked]:ring-blue-500">
              <RadioGroupItem value="COD" id="cod" className="mr-3" />
              Thanh toán khi nhận hàng (COD)
            </Label>
            <Label
              className={`flex flex-col items-start p-4 border rounded-lg cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:ring-1 has-[:checked]:ring-blue-500 ${
                mandalaPayBalance < grandTotal
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <div className="flex items-center w-full">
                <RadioGroupItem
                  value="MandalaPay"
                  id="mandala"
                  className="mr-3"
                  disabled={mandalaPayBalance < grandTotal}
                />
                Thanh toán bằng ví MandalaPay
              </div>
              <p
                className={`text-sm ml-8 ${
                  mandalaPayBalance < grandTotal
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}
              >
                Số dư: {formatCurrency(mandalaPayBalance)}
                {mandalaPayBalance < grandTotal && " (Không đủ)"}
              </p>
            </Label>
            <Label className="flex items-center p-4 border rounded-lg cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:ring-1 has-[:checked]:ring-blue-500">
              <RadioGroupItem value="CreditCard" id="card" className="mr-3" />
              Thẻ Tín dụng/Ghi nợ
            </Label>
            {paymentMethod === "CreditCard" && (
              <div className="p-4 border-t space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Giao diện demo
                </p>
                <Input placeholder="Số thẻ" disabled />
              </div>
            )}
          </RadioGroup>

          <Button
            className="w-full mt-6 text-lg h-12 bg-red-600 hover:bg-red-700"
            disabled={
              isPending ||
              checkoutItems.length === 0 ||
              !selectedAddressId ||
              (paymentMethod === "MandalaPay" && mandalaPayBalance < grandTotal)
            }
            onClick={handlePlaceOrder}
          >
            {isPending ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              "ĐẶT HÀNG"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
