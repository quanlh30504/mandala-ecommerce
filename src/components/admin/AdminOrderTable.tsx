"use client";

import Link from "next/link";
import { IOrder, OrderStatus } from "@/models/Order";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UpdateStatusSelect from "./UpdateStatusSelect";
import { Card } from "@/components/ui/card";

const formatCurrency = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price
  );

interface AdminOrderTableProps {
  orders: IOrder[];
  setOrders: React.Dispatch<React.SetStateAction<IOrder[]>>;
}

export default function AdminOrderTable({
  orders,
  setOrders,
}: AdminOrderTableProps) {
  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-gray-500">Không có đơn hàng nào trong mục này.</p>
      </div>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã ĐH</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Ngày đặt</TableHead>
            <TableHead className="text-right">Tổng tiền</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead className="text-left">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell className="font-medium">{order.orderId}</TableCell>
              <TableCell>{order.shippingAddress?.fullName}</TableCell>
              <TableCell>
                {new Date(order.createdAt).toLocaleDateString("vi-VN")}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(order.totals?.grandTotal)}
              </TableCell>
              <TableCell className="text-center flex justify-center">
                <UpdateStatusSelect
                  orderId={order._id.toString()}
                  currentStatus={order.status}
                  onStatusUpdate={handleStatusUpdate}
                />
              </TableCell>
              <TableCell className="text-left">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/orders/${order._id}`}>Xem</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
