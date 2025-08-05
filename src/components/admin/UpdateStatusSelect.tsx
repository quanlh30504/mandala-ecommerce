"use client";

import { useTransition } from "react";
import { toast } from "react-hot-toast";
import { updateOrderStatus } from "@/lib/actions/order";
import { OrderStatus } from "@/models/Order";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// --- Cấu hình màu sắc và nhãn cho từng trạng thái ---
const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> =
  {
    pending: {
      label: "Chờ thanh toán",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    processing: {
      label: "Đang xử lý",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    shipped: {
      label: "Đang vận chuyển",
      className: "bg-indigo-100 text-indigo-800 border-indigo-200",
    },
    delivered: {
      label: "Đã giao",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    cancelled: {
      label: "Đã hủy",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    returned: {
      label: "Đã trả hàng",
      className: "bg-gray-100 text-gray-800 border-gray-200",
    },
  };

// Lấy danh sách options từ config để tránh lặp lại code
const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(
  ([value, { label }]) => ({
    label,
    value: value as OrderStatus,
  })
);

interface UpdateStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
}

export default function UpdateStatusSelect({
  orderId,
  currentStatus,
  onStatusUpdate,
}: UpdateStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleValueChange = (newStatus: OrderStatus) => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        toast.success(result.message);
        onStatusUpdate(orderId, newStatus);
      } else {
        toast.error(result.message);
      }
    });
  };

  // Lấy style của trạng thái hiện tại
  const currentStatusStyle = STATUS_CONFIG[currentStatus];

  return (
    <Select
      onValueChange={handleValueChange}
      defaultValue={currentStatus}
      disabled={isPending}
    >
      <SelectTrigger
        className={cn(
          "w-[160px] h-8 text-xs font-semibold focus:ring-0 focus:ring-offset-0",
          currentStatusStyle.className
        )}
      >
        <SelectValue placeholder="Cập nhật trạng thái" />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              {/* Thêm chấm màu để trực quan hơn */}
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  STATUS_CONFIG[option.value].className
                )}
              />
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
