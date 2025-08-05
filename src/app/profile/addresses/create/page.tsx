import AddressForm from "@/components/Profile/AddressForm";

export default function CreateAddressPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Thêm địa chỉ mới</h1>
        <p className="text-muted-foreground">
          Điền thông tin dưới đây để tạo một địa chỉ giao hàng mới.
        </p>
      </div>
      <AddressForm />
    </div>
  );
}
