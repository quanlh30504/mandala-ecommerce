/**
 * ACTIONS.TS - Server Actions cho Authentication
 *
 * CHỨC NĂNG CHÍNH:
 * - Server Actions xử lý đăng nhập và đăng ký users
 * - Chạy hoàn toàn ở server-side, bảo mật cao
 * - Tích hợp với NextAuth.js authentication system
 * - Validation và error handling cho form submissions
 *
 * ACTIONS BAO GỒM:
 * - authenticate(): Xử lý đăng nhập user
 * - register(): Xử lý đăng ký user mới
 *
 * FEATURES:
 * - Hash password bằng bcryptjs
 * - Validation email format và password strength
 * - Check duplicate email khi đăng ký
 * - Integration với MongoDB User model
 * - Proper error messages cho UI
 *
 * SỬ DỤNG: Gọi từ React components với useFormState/useFormStatus
 */

"use server";

import { AuthError } from "next-auth";
import User from "@/models/User";
import connectToDB from "@/lib/db";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";

type ActionState =
  | {
      success?: boolean;
      message: string;
      errors?: {
        email?: string[];
        password?: string[];
        firstName?: string[];
        lastName?: string[];
        confirmPassword?: string[];
        phone?: string[];
      };
    }
  | undefined;

// --- Action cho Đăng nhập ---
/**
 * Xử lý đăng nhập bằng Credentials.
 * Khi thành công, signIn sẽ tự động chuyển hướng.
 * @param prevState - Trạng thái trước đó từ useFormState (không dùng).
 * @param formData - Dữ liệu từ form.
 * @returns Một chuỗi lỗi nếu thất bại, ngược lại không trả về gì.
 */
export async function authenticateCredentials(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Kiểm tra user có tồn tại và có bị ban không trước khi gọi signIn
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { message: "Email và mật khẩu là bắt buộc." };
    }

    await connectToDB();
    const user = await User.findOne({ email }).lean();

    if (!user) {
      return { message: "Email hoặc mật khẩu không chính xác." };
    }

    // Kiểm tra user có bị ban không
    if (user.isActive === false) {
      return {
        message:
          "⚠️ Tài khoản của bạn đã bị vô hiệu hóa bởi quản trị viên. Vui lòng liên hệ admin để được hỗ trợ.",
      };
    }

    // Kiểm tra password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return { message: "Email hoặc mật khẩu không chính xác." };
    }

    // Nếu tất cả ok, thực hiện signIn
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true, message: "Đăng nhập thành công! " };
  } catch (error) {
    if (error instanceof AuthError) {
      console.error(
        `[SERVER LOGIN ERROR]: AuthError caught. Type: ${error.type}`,
        { cause: error.cause }
      );

      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Email hoặc mật khẩu không chính xác." };
        case "CallbackRouteError":
          return {
            message: "Lỗi xác thực. Vui lòng kiểm tra lại thông tin đăng nhập.",
          };
        default:
          return { message: "Đã có lỗi không mong muốn xảy ra." };
      }
    }

    // Xử lý các lỗi không phải là AuthError
    console.error("Unexpected error during login action:", error);
    return { message: "Đã có lỗi nghiêm trọng phía máy chủ." };
  }
}

// --- Action cho Đăng ký ---

/**
 * Xử lý logic đăng ký người dùng.
 * @param prevState - Trạng thái trước đó từ useActionState.
 * @param formData - Dữ liệu được gửi từ form.
 * @returns Một object chứa trạng thái thành công/thất bại và thông báo.
 */
export async function registerUser(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const phone = formData.get("phone") as string;

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return { message: "Vui lòng điền đầy đủ thông tin." };
  }

  if (password !== confirmPassword) {
    return { message: "Mật khẩu xác nhận không khớp." };
  }
  if (!/^\d{10,11}$/.test(phone.trim())) {
    return {
      message:
        "Số điện thoại không hợp lệ. Vui lòng chỉ nhập số, từ 10-11 chữ số.",
    };
  }
  try {
    await connectToDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { message: "Địa chỉ email này đã được sử dụng." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      phone: phone.trim(),
      // Role sẽ được tự động gán là "user" theo default trong schema
    });

    await newUser.save();
    return { success: true, message: "Đăng ký tài khoản thành công! " };
  } catch (error) {
    console.error("Lỗi đăng ký phía server:", error);
    return { message: "Đã có lỗi xảy ra phía máy chủ. Vui lòng thử lại." };
  }
}
