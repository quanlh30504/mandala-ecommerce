"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { IAddress } from "@/models/Address";
import {
  setDefaultAddress,
  deleteAddress,
  getAddresses,
} from "@/lib/actions/address";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Pencil } from "lucide-react";
import type { AddressType } from "@/types/address";

interface AddressListProps {
  initialAddresses: AddressType[];
}

export default function AddressList({ initialAddresses }: AddressListProps) {
  const [addresses, setAddresses] = useState<AddressType[]>(initialAddresses);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSetDefault = (addressId: string) => {
    startTransition(async () => {
      const result = await setDefaultAddress(addressId);
      if (result.success) {
        toast.success(result.message);
        setAddresses((prev) =>
          prev.map((addr) => ({
            ...addr,
            isDefault: addr._id.toString() === addressId,
          }))
        );
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDelete = (addressId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      startTransition(async () => {
        const result = await deleteAddress(addressId);
        if (result.success) {
          toast.success(result.message);
          setAddresses((prev) =>
            prev.filter((addr) => addr._id.toString() !== addressId)
          );
        } else {
          toast.error(result.message);
        }
      });
    }
  };

  if (addresses.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-gray-500">Bạn chưa có địa chỉ nào.</p>
        <p className="text-gray-500">
          Hãy thêm địa chỉ mới để thuận tiện cho việc mua sắm.
        </p>
      </div>
    );
  }

  const defaultAddressId =
    addresses.find((addr) => addr.isDefault)?._id.toString() || "";

  return (
    <RadioGroup
      defaultValue={defaultAddressId}
      onValueChange={handleSetDefault}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      disabled={isPending}
    >
      {addresses.map((address) => (
        <Card key={address._id.toString()} className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{address.fullName}</CardTitle>
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value={address._id.toString()}
                  id={address._id.toString()}
                />
                <Label
                  htmlFor={address._id.toString()}
                  className="cursor-pointer"
                >
                  {address.isDefault ? <Badge>Mặc định</Badge> : "Chọn"}
                </Label>
              </div>
            </div>
            <CardDescription>{address.phoneNumber}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-gray-600">
              {`${address.street}, ${address.ward}, ${address.district}, ${address.city}`}
            </p>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/profile/addresses/edit/${address._id}`}>
                <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(address._id.toString())}
              disabled={isPending || address.isDefault}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Xóa
            </Button>
          </CardFooter>
        </Card>
      ))}
      {isPending && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}
    </RadioGroup>
  );
}
