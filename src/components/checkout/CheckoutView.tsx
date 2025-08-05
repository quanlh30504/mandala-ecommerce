"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AddressSelectionModal from "@/components/Profile/AddressSelectionModal";
import PaymentOptions from "@/components/checkout/PaymentOptions";
import { MapPin, Truck } from "lucide-react";
import type { AddressType } from "@/types/address";
import type { PopulatedCartItem } from "@/app/cart/context/CartContext";
import SafeImage from "@/components/SafeImage";
import { formatCurrency } from "@/lib/utils";

interface CheckoutViewProps {
  initialAddresses: AddressType[];
  checkoutItems: PopulatedCartItem[];
  mandalaPayBalance: number;
}

export default function CheckoutView({
  initialAddresses,
  checkoutItems,
  mandalaPayBalance,
}: CheckoutViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState<
    AddressType | undefined
  >(() => {
    return (
      initialAddresses.find((addr) => addr.isDefault) || initialAddresses[0]
    );
  });

  // Phí ship cố định
  const shippingFee = 30000;

  const handleAddressSelect = (address: AddressType) => {
    setSelectedAddress(address);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-gray-500" /> Địa chỉ nhận
                  hàng
                </h2>
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setIsModalOpen(true)}
                >
                  Thay đổi
                </Button>
              </div>
              {selectedAddress ? (
                <div>
                  <p className="font-bold">
                    {selectedAddress.fullName} | {selectedAddress.phoneNumber}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">{`${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.city}`}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Vui lòng chọn địa chỉ giao hàng.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Sản phẩm và Vận chuyển */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Sản phẩm</h2>
              {checkoutItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-4 py-4 border-b last:border-b-0"
                >
                  <div className="relative w-16 h-16">
                    <SafeImage
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="rounded-md border object-cover"
                    />{" "}
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Số lượng: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatCurrency(
                      (item.product.salePrice ?? item.product.price) *
                        item.quantity
                    )}
                  </p>
                </div>
              ))}
              <div className="flex items-center gap-4 pt-4 mt-4 border-t">
                <Truck className="w-6 h-6 text-gray-500" />
                <div>
                  <p className="font-semibold">Giao hàng tiết kiệm</p>
                  <p className="text-sm text-muted-foreground">
                    Nhận hàng vào ngày mai
                  </p>
                </div>
                <p className="ml-auto font-semibold">
                  {formatCurrency(shippingFee)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Thanh toán */}
        <div className="lg:col-span-1 sticky top-6">
          <PaymentOptions
            selectedAddressId={selectedAddress?._id}
            mandalaPayBalance={mandalaPayBalance}
            checkoutItems={checkoutItems}
            shippingFee={shippingFee}
          />
        </div>
      </div>

      <AddressSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddressSelect={handleAddressSelect}
        currentAddressId={selectedAddress?._id}
      />
    </>
  );
}
