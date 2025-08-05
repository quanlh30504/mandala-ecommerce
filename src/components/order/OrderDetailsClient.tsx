"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

import { updateShippingAddress } from "@/lib/actions/order";
import type { IOrder, OrderStatus } from "@/models/Order";
import type { AddressType } from "@/types/address";
import { formatCurrency } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Pencil } from "lucide-react";
import CancelOrderButton from "@/components/order/CancelOrderButton";
import SafeImage from "@/components/SafeImage";
import AddressSelectionModal from "@/components/Profile/AddressSelectionModal";

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">Chờ thanh toán</Badge>;
    case "processing":
      return <Badge className="bg-blue-100 text-blue-800">Đang xử lý</Badge>;
    case "shipped":
      return (
        <Badge className="bg-yellow-100 text-yellow-800">Đang vận chuyển</Badge>
      );
    case "delivered":
      return <Badge className="bg-green-100 text-green-800">Đã giao</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Đã hủy</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default function OrderDetailsClient({ order }: { order: IOrder }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleChangeAddressClick = () => {
    // Kiểm tra trạng thái đơn hàng
    if (order.status !== "processing") {
      toast.error(
        "Chỉ có thể thay đổi địa chỉ cho đơn hàng đang 'Đang xử lý'."
      );
      return;
    }
    setIsModalOpen(true);
  };

  // Xử lý khi một địa chỉ mới được chọn từ modal
  const handleAddressSelect = (selectedAddress: AddressType) => {
    startTransition(async () => {
      const result = await updateShippingAddress({
        orderId: order._id.toString(),
        newAddress: {
          fullName: selectedAddress.fullName,
          phoneNumber: selectedAddress.phoneNumber,
          street: selectedAddress.street,
          city: selectedAddress.city,
          district: selectedAddress.district,
          ward: selectedAddress.ward,
        },
      });

      if (result.success) {
        toast.success("Cập nhật địa chỉ thành công!");
        setIsModalOpen(false);
        // Server Action revalidate -> Next.js sẽ cập nhật lại UI
      } else {
        toast.error(result.message || "Đã có lỗi xảy ra khi cập nhật.");
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/profile/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">
          Chi tiết đơn hàng #{order.orderId}
        </h1>
        {getStatusBadge(order.status)}
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        Ngày đặt hàng: {new Date(order.createdAt).toLocaleString("vi-VN")}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Card Địa chỉ người nhận */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Địa chỉ người nhận</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-primary"
              onClick={handleChangeAddressClick}
            >
              <Pencil className="w-3.5 h-3.5 mr-1" />
              Thay đổi
            </Button>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-semibold">{order.shippingAddress.fullName}</p>
            <p className="text-muted-foreground">
              Địa chỉ:{" "}
              {`${order.shippingAddress.street}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.city}`}
            </p>
            <p className="text-muted-foreground">
              Điện thoại: {order.shippingAddress.phoneNumber}
            </p>
          </CardContent>
        </Card>

        {/* Card Hình thức giao hàng */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hình thức giao hàng</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-semibold">{order.shipping.method}</p>
            <p className="text-muted-foreground">
              Phí vận chuyển: {formatCurrency(order.shipping.fee)}
            </p>
          </CardContent>
        </Card>

        {/* Card Hình thức thanh toán */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hình thức thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>
              {order.payment.method === "COD"
                ? "Thanh toán tiền mặt khi nhận hàng"
                : `Thanh toán qua ${order.payment.method}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Card danh sách sản phẩm */}
      <Card>
        <CardContent className="p-0">
          <div className="p-6">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 items-center gap-4 py-4"
              >
                <div className="col-span-2">
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-md border"
                  />
                </div>
                <div className="col-span-5">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    SKU: {item.sku}
                  </p>
                </div>
                <p className="col-span-2 text-sm text-center">
                  {formatCurrency(item.price)}
                </p>
                <p className="col-span-1 text-sm text-center">
                  x{item.quantity}
                </p>
                <p className="col-span-2 text-sm font-semibold text-right">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <Separator />
          <div className="p-6 space-y-2 text-sm w-full max-w-sm ml-auto">
            <div className="flex justify-between">
              <p>Tạm tính</p>
              <p>{formatCurrency(order.totals.subtotal)}</p>
            </div>
            <div className="flex justify-between">
              <p>Phí vận chuyển</p>
              <p>{formatCurrency(order.totals.shippingTotal)}</p>
            </div>
            <div className="flex justify-between">
              <p>Giảm giá</p>
              <p>-{formatCurrency(order.totals.discount)}</p>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-base">
              <p>Tổng cộng</p>
              <p className="text-red-600">
                {formatCurrency(order.totals.grandTotal)}
              </p>
            </div>
          </div>
        </CardContent>
        {/* Button hủy đơn hàng */}
        {(order.status === "processing" || order.status === "pending") && (
          <CardFooter className="justify-end">
            <CancelOrderButton orderId={order._id.toString()} />
          </CardFooter>
        )}
      </Card>

      {/* Modal address select */}
      <AddressSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddressSelect={handleAddressSelect}
      />
    </>
  );
}
