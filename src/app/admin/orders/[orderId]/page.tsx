"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAdminOrderDetails } from "@/lib/actions/order";
import { IOrder, OrderStatus } from "@/models/Order";

// Import các component từ shadcn/ui và lucide-react
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
import { ArrowLeft, Loader2 } from "lucide-react";
import CancelOrderButton from "@/components/order/CancelOrderButton";
import SafeImage from "@/components/SafeImage";
import { formatCurrency } from "@/lib/utils";
import AdminLayout from "@/components/admin/AdminLayout";

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

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      setIsLoading(true);
      setError(null);
      const response = await getAdminOrderDetails(orderId);
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        setError(response.message || "Không tìm thấy đơn hàng.");
      }
      setIsLoading(false);
    };

    fetchOrderDetails();
  }, [orderId]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-destructive">Lỗi</h2>
          <p className="text-muted-foreground mt-2">
            {error || "Không thể tải thông tin đơn hàng."}
          </p>
          <Button asChild variant="link" className="mt-4">
            <Link href="/admin/orders">Quay lại danh sách</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex justify-start gap-5">
            <h1 className="text-2xl font-bold text-gray-800">
              Chi tiết đơn hàng #{order.orderId}
            </h1>
            <div className="flex justify-center content-center">
              {getStatusBadge(order.status)}
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          Ngày đặt hàng: {new Date(order.createdAt).toLocaleString("vi-VN")}
        </p>

        {/* Các Card thông tin */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Địa chỉ người nhận</CardTitle>
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

        {/* Card chi tiết sản phẩm */}
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
          {order.status === "processing" && (
            <CardFooter className="justify-end">
              <CancelOrderButton orderId={order._id.toString()} />
            </CardFooter>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
