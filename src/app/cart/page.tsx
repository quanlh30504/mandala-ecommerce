import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAddresses } from "@/lib/actions/address";
import CartView from "@/app/cart/components/CartView";

export default async function CartPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?error=CartAuthRequired");
  }

  const addressResponse = await getAddresses();
  const initialAddresses = addressResponse.success ? addressResponse.data : [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">GIỎ HÀNG</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <CartView
            initialAddresses={JSON.parse(JSON.stringify(initialAddresses))}
          />
        </div>
      </div>
    </div>
  );
}
