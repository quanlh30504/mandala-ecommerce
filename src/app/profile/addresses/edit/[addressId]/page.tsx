import { notFound } from "next/navigation";
import AddressForm from "@/components/Profile/AddressForm";
import { getAddressById } from "@/lib/actions/address";

export default async function EditAddressPage({
  params,
}: {
  params: { addressId: string };
}) {
  const { addressId } = params;

  const response = await getAddressById(addressId);

  if (!response.success || !response.data) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa địa chỉ</h1>
        <p className="text-muted-foreground">
          Cập nhật thông tin địa chỉ giao hàng của bạn.
        </p>
      </div>

      <AddressForm initialData={JSON.parse(JSON.stringify(response.data))} />
    </div>
  );
}
