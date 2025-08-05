"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getAllOrdersPaginated } from "@/lib/actions/order";
import { IOrder, OrderStatus } from "@/models/Order";

import OrderTabs from "@/components/order/OrderTabs";
import AdminOrderTable from "@/components/admin/AdminOrderTable";
import PaginationControls from "@/components/admin/PaginationControls";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

function AdminOrdersPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") as OrderStatus | null;
  const page = parseInt(searchParams.get("page") || "1");
  const searchQuery = searchParams.get("search") || "";

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchQuery);

  // useEffect để lấy dữ liệu, sẽ chạy khi URL thay đổi
  useEffect(() => {
    // Để tránh việc fetch dữ liệu lần đầu khi component mount
    // và searchQuery chưa đồng bộ với searchTerm
    // -> đồng bộ
    if (searchQuery !== searchTerm) {
      // Nếu URL chưa cập nhật -> đợi
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      const response = await getAllOrdersPaginated({
        status: status || undefined,
        page,
        search: searchQuery,
      });
      if (response.success && response.data) {
        setOrders(response.data.orders);
        setTotalPages(response.data.totalPages);
      } else {
        setOrders([]);
        setTotalPages(1);
      }
      setIsLoading(false);
    };

    fetchOrders();
  }, [status, page, searchQuery]);

  // useEffect cập nhật URL sau một khoảng trễ
  useEffect(() => {
    const handler = setTimeout(() => {
      // Chỉ cập nhật URL nếu giá trị nhập khác với giá trị trên URL
      if (searchTerm !== searchQuery) {
        const params = new URLSearchParams(searchParams);
        params.set("search", searchTerm);
        params.set("page", "1"); // Luôn reset về trang 1 khi tìm kiếm
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 200);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, searchQuery, pathname, router, searchParams]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-1">
            Xem và cập nhật trạng thái các đơn hàng trong hệ thống.
          </p>
        </div>

        <OrderTabs />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Tìm theo mã đơn, tên hoặc SĐT khách hàng..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <AdminOrderTable orders={orders} setOrders={setOrders} />
            <PaginationControls currentPage={page} totalPages={totalPages} />
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <AdminOrdersPageContent />
    </Suspense>
  );
}
