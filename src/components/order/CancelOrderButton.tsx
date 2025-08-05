"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { cancelOrder } from "@/lib/actions/order";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CancelOrderButtonProps {
  orderId: string;
}

export default function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCancel = () => {
    if (
      confirm(
        "Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác."
      )
    ) {
      startTransition(async () => {
        const result = await cancelOrder(orderId);
        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else {
          toast.error(result.message);
        }
      });
    }
  };

  return (
    <Button variant="destructive" onClick={handleCancel} disabled={isPending}>
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang xử lý...
        </>
      ) : (
        "Hủy đơn hàng"
      )}
    </Button>
  );
}
