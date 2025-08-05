"use client";

import { FaPaperPlane } from "react-icons/fa";
import { Input } from "@/components/ui/input";

export default function SubscribeForm() {
  return (
    <div>
      <h2 className="text-lg font-bold text-center text-gray-800 mb-1">
        GỬI EMAIL CHO CHÚNG TÔI
      </h2>

      <div className="flex justify-center mb-5">
        <div className="relative w-40 h-4 flex items-center justify-center">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300"></div>
          <div className="relative z-10 bg-white px-2 flex gap-1">
            <span className="text-gray-500 text-sm">///////</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
        <p className="text-center text-3xl text-gray-500 font-bold mb-1">
          Gửi email
        </p>
        <p className="text-center text-lg text-gray-500 mb-4">
          để nhận những ưu đãi mới nhất
        </p>

        <form className="space-y-3">
          <Input type="text" placeholder="Họ tên" required />
          <Input type="text" placeholder="Số điện thoại" required />
          <Input type="email" placeholder="Email" required />

          <button
            type="submit"
            className="w-fit flex items-center gap-2 bg-[#8ba63a] hover:bg-[#7a942c] text-white font-semibold text-sm px-4 py-2 rounded-md mx-auto"
          >
            <FaPaperPlane className="text-white text-sm" />
            GỬI EMAIL
          </button>
        </form>
      </div>
    </div>
  );
}
