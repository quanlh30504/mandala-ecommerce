import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { getAddresses } from "@/lib/actions/address";
import { Button } from "@/components/ui/button";
import AddressList from "@/components/Profile/AddressList";

export default async function AddressesPage() {
  const response = await getAddresses();
  const addresses = response.success ? response.data : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Danh sách địa chỉ</h1>
        <Button asChild>
          <Link href="/profile/addresses/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm địa chỉ mới
          </Link>
        </Button>
      </div>
      <AddressList initialAddresses={addresses} />
    </div>
  );
}
