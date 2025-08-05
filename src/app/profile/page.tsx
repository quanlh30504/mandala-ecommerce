import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserInfoForm from "@/components/Profile/UserInfoForm";
import UserModel from "@/models/User";
import connectToDB from "@/lib/db";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  await connectToDB();
  const fullUserData = await UserModel.findById(session.user.id).lean();

  if (!fullUserData) {
    redirect("/login");
  }
  let safeUserData;
  try {
    safeUserData = JSON.parse(JSON.stringify(fullUserData));
  } catch (error) {
    console.error("Failed to parse user data:", error);
    safeUserData = null;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">
        Thông tin tài khoản
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-6">Thông tin cá nhân</h2>
          <UserInfoForm user={safeUserData} />
        </div>

        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold mb-6">Số điện thoại và Email</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Số điện thoại</p>
                <p className="text-gray-500">
                  {fullUserData.phone || "Chưa có số điện thoại"}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Địa chỉ email</p>
                <p className="text-gray-500">{fullUserData.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
