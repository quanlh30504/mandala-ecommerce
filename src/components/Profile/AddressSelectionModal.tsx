"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "react-hot-toast";
import { getAddresses } from "@/lib/actions/address";
import AddressForm from "@/components/Profile/AddressForm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AddressType } from "@/types/address";

interface AddressSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSelect: (address: AddressType) => void;
  currentAddressId?: string;
}

export default function AddressSelectionModal({
  isOpen,
  onClose,
  onAddressSelect,
  currentAddressId,
}: AddressSelectionModalProps) {
  const [view, setView] = useState<"LIST" | "CREATE" | "EDIT">("LIST");
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [addressToEdit, setAddressToEdit] = useState<AddressType | undefined>(
    undefined
  );
  const [isLoading, startLoading] = useTransition();

  // Lấy danh sách địa chỉ khi modal được mở
  useEffect(() => {
    if (isOpen && view === "LIST") {
      startLoading(async () => {
        const response = await getAddresses();
        if (response.success) {
          setAddresses(response.data || []);
        } else {
          toast.error("Không thể tải danh sách địa chỉ.");
        }
      });
    }
  }, [isOpen, view]);

  const handleSelectAndClose = (address: AddressType) => {
    onAddressSelect(address);
    onClose();
  };

  const handleEditClick = (address: AddressType) => {
    setAddressToEdit(address);
    setView("EDIT");
  };

  // Khi form thêm/sửa thành công, quay lại màn hình danh sách các address
  const handleFormSuccess = () => {
    setView("LIST");
  };

  const renderContent = () => {
    if (isLoading && view === "LIST") {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    switch (view) {
      case "CREATE":
        return (
          <div className="pt-8">
            <DialogHeader>
              <DialogTitle>Thêm địa chỉ mới</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <AddressForm onSuccess={handleFormSuccess} />
            </div>
          </div>
        );
      case "EDIT":
        return (
          <div className="pt-8">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa địa chỉ</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <AddressForm
                initialData={addressToEdit}
                onSuccess={handleFormSuccess}
              />
            </div>
          </div>
        );
      case "LIST":
      default:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Chọn địa chỉ giao hàng</DialogTitle>
              <DialogDescription>
                Chọn một địa chỉ có sẵn hoặc thêm địa chỉ mới bên dưới.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto p-1">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    currentAddressId === addr._id
                      ? "border-blue-500 ring-2 ring-blue-500"
                      : "hover:border-gray-400"
                  }`}
                  onClick={() => handleSelectAndClose(addr)}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-semibold">
                      {addr.fullName}{" "}
                      {addr.isDefault && (
                        <span className="text-xs text-blue-600 ml-2">
                          (Mặc định)
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-blue-600 hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(addr);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {addr.phoneNumber}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{`${addr.street}, ${addr.ward}, ${addr.district}, ${addr.city}`}</p>
                </div>
              ))}
              {addresses.length === 0 && !isLoading && (
                <p className="text-center text-muted-foreground py-8">
                  Bạn chưa có địa chỉ nào.
                </p>
              )}
            </div>
            <Button
              className="w-full mt-6"
              variant="outline"
              onClick={() => setView("CREATE")}
            >
              Thêm địa chỉ mới
            </Button>
          </>
        );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setTimeout(() => setView("LIST"), 200);
        }
      }}
    >
      {/* layout chính */}
      <DialogContent className="sm:max-w-3xl">
        {view !== "LIST" && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-4 px-2"
            onClick={() => setView("LIST")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        )}
        <div className="mt-6">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
}
