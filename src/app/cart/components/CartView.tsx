"use client";

import { useState } from "react";
import CartItemsList from "./CartItemsList";
import OrderSummary from "./OrderSummary";
import AddressSelectionModal from "@/components/Profile/AddressSelectionModal";

type AddressType = {
  _id: string;
  fullName: string;
  phoneNumber: string;
  street: string;
  city: string;
  district: string;
  ward: string;
  isDefault: boolean;
};

interface CartViewProps {
  initialAddresses: AddressType[];
}

export default function CartView({ initialAddresses }: CartViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState<
    AddressType | undefined
  >(() => {
    return (
      initialAddresses.find((addr) => addr.isDefault) || initialAddresses[0]
    );
  });

  const handleAddressSelect = (address: AddressType) => {
    setSelectedAddress(address);
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <CartItemsList />
        <OrderSummary
          selectedAddress={selectedAddress}
          onOpenAddressModal={() => setIsModalOpen(true)}
        />
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
