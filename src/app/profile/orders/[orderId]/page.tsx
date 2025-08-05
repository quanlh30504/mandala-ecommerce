import { notFound } from "next/navigation";
import { getOrderDetails } from "@/lib/actions/order";
import OrderDetailsClient from "@/components/order/OrderDetailsClient";

// render động để thấy dữ liệu mới nhất
export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: { orderId: string };
}) {
  const { orderId } = params;
  const response = await getOrderDetails(orderId);

  if (!response.success || !response.data) {
    notFound();
  }
  const order = response.data;

  return (
    <div>
      <OrderDetailsClient order={order} />
    </div>
  );
}
