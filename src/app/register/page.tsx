"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { registerUser } from "@/lib/actions";
import Link from "next/link";
import SubmitButton from "@/components/Buttons/SubmitButton";
import ActionButton from "@/components/Buttons/ActionButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormLabel } from "@/components/FormLabel";

export default function RegisterPage() {
  const router = useRouter();

  const [state, dispatch] = useFormState(registerUser, undefined);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      router.push("/login");
    }

    if (state && !state.success) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <main className="bg-white text-gray-800 min-h-screen">
      <div className="container mx-auto px-4 py-10 md:py-16 max-w-4xl">
        <h1 className="text-xl md:text-2xl font-semibold tracking-widest uppercase mb-10">
          Tạo tài khoản
        </h1>
        <div className="bg-gray-50 p-8 md:p-12">
          <form action={dispatch} className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-6 uppercase">
                Thông tin cá nhân
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <FormLabel htmlFor="firstName" required>
                    Tên trước
                  </FormLabel>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Nhập tên của bạn"
                    required
                  />
                  {state?.errors?.firstName && (
                    <p className="text-sm text-red-500">
                      {state.errors.firstName[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <FormLabel htmlFor="firstName" required>
                    Tên sau
                  </FormLabel>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Nhập họ của bạn"
                    required
                  />
                  {state?.errors?.lastName && (
                    <p className="text-sm text-red-500">
                      {state.errors.lastName[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <FormLabel htmlFor="phone" required>
                    Số điện thoại
                  </FormLabel>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    required
                    pattern="[0-9]{10,11}"
                    title="Số điện thoại phải có 10-11 chữ số."
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-6 uppercase">
                Thông tin đăng nhập
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <FormLabel htmlFor="email" required>
                    Email
                  </FormLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    required
                  />
                  {state?.errors?.email && (
                    <p className="text-sm text-red-500">
                      {state.errors.email[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <FormLabel htmlFor="password" required>
                    Mật khẩu
                  </FormLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                  {state?.errors?.password && (
                    <p className="text-sm text-red-500">
                      {state.errors.password[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <FormLabel htmlFor="confirmPassword" required>
                    Xác nhận mật khẩu
                  </FormLabel>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                  />
                  {state?.errors?.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {state.errors.confirmPassword[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 gap-4">
              <SubmitButton content="Đăng ký" className="w-40" />
              <ActionButton variant="destructive">
                <Link href="/login">Quay lại</Link>
              </ActionButton>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
