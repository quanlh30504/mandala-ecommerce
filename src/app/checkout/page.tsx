import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAddresses } from "@/lib/actions/address";
import { getCheckoutItems } from "@/lib/actions/cart";
import UserModel from "@/models/User";
import CheckoutView from "@/components/checkout/CheckoutView";
import connectToDB from "@/lib/db";
import { Loader2 } from "lucide-react";

// component con bất đồng bộ chứa logic lấy dữ liệu
async function CheckoutContent({
  searchParams,
}: {
  searchParams: { items?: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?error=CheckoutAuthRequired");
  }

  const selectedItemIds = searchParams.items?.split(",") || [];
  if (selectedItemIds.length === 0) {
    redirect("/cart");
  }

  await connectToDB();

  const [addressResponse, itemsResponse, user] = await Promise.all([
    getAddresses(),
    getCheckoutItems(selectedItemIds),
    UserModel.findById(session.user.id).select("mandalaPayBalance").lean(),
  ]);

  const initialAddresses = addressResponse.success ? addressResponse.data : [];
  const checkoutItems = itemsResponse.success ? itemsResponse.data : [];
  const mandalaPayBalance = user?.mandalaPayBalance || 0;

  if (checkoutItems.length === 0) {
    redirect("/cart");
  }

  return (
    <CheckoutView
      initialAddresses={JSON.parse(JSON.stringify(initialAddresses))}
      checkoutItems={JSON.parse(JSON.stringify(checkoutItems))}
      mandalaPayBalance={mandalaPayBalance}
    />
  );
}

// component trang chính được bọc logic trong Suspense
export default function CheckoutPage({
  searchParams,
}: {
  searchParams: { items?: string };
}) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">THANH TOÁN</h1>

        <Suspense
          fallback={
            <div className="flex justify-center items-center h-96">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          }
        >
          <CheckoutContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
