"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Breadcrumb from "@/components/Breadcrumb";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<
    "phone" | "email" | "zalo"
  >("email");

  const contactMethods = [
    {
      id: "phone" as const,
      icon: "📞",
      title: "Điện thoại",
      description: "Gọi trực tiếp",
      color: "bg-green-50 border-green-200",
      activeColor: "bg-green-100 border-green-400",
      formBg: "bg-green-50",
      contactInfo: "(028) 1234 5678",
    },
    {
      id: "email" as const,
      icon: "📧",
      title: "Email",
      description: "Gửi tin nhắn",
      color: "bg-red-50 border-red-200",
      activeColor: "bg-red-100 border-red-400",
      formBg: "bg-red-50",
      contactInfo: "info@mandalastore.com",
    },
    {
      id: "zalo" as const,
      icon: "💬",
      title: "Zalo",
      description: "Chat qua Zalo",
      color: "bg-blue-50 border-blue-200",
      activeColor: "bg-blue-100 border-blue-400",
      formBg: "bg-blue-50",
      contactInfo: "0901 234 567",
    },
  ];

  const getFormContent = () => {
    switch (selectedMethod) {
      case "phone":
        return {
          title: "YÊU CẦU GỌI LẠI",
          placeholder: "Nhập nội dung muốn trao đổi ...",
          buttonText: "YÊU CẦU GỌI LẠI",
          buttonIcon: "📞",
        };
      case "email":
        return {
          title: "GỬI EMAIL",
          placeholder: "Nhập tin nhắn của bạn...",
          buttonText: "GỬI EMAIL",
          buttonIcon: "📧",
        };
      case "zalo":
        return {
          title: "LIÊN HỆ QUA ZALO",
          placeholder: "Nhập tin nhắn để liên hệ qua Zalo...",
          buttonText: "GỬI TIN NHẮN ZALO",
          buttonIcon: "💬",
        };
    }
  };

  const currentMethod = contactMethods.find(
    (method) => method.id === selectedMethod
  );
  const formContent = getFormContent();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Reset form
    setFormData({ name: "", email: "", message: "" });
    setIsSubmitting(false);

    // Gửi message thành công
    alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.");
  };

  return (
    <main>
      <div className="px-4 md:px-8 lg:px-20 py-10 bg-gray-50 min-h-screen">
        <Breadcrumb current="Liên hệ" />

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              LIÊN HỆ VỚI CHÚNG TÔI
            </h1>
            <p className="text-gray-600">
              Chọn phương thức liên lạc phù hợp với bạn
            </p>
          </div>

          {/* Contact Method Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {contactMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`
                                    p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 transform hover:scale-105
                                    ${
                                      selectedMethod === method.id
                                        ? `${method.activeColor} shadow-lg`
                                        : `${method.color} hover:shadow-md`
                                    }
                                `}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{method.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {method.title}
                  </h3>
                  <p className="text-sm text-gray-600">{method.description}</p>
                  <div className="mt-2 text-xs font-medium text-gray-700">
                    {method.contactInfo}
                  </div>
                  {selectedMethod === method.id && (
                    <div className="mt-3">
                      <span className="inline-block w-2 h-2 bg-current rounded-full animate-pulse"></span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Form */}
          <div
            className={`bg-white rounded-lg shadow-md p-8 ${
              currentMethod?.formBg
            } border-l-4 ${
              selectedMethod === "phone"
                ? "border-green-400"
                : selectedMethod === "email"
                ? "border-red-400"
                : "border-blue-400"
            }`}
          >
            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                <span>{currentMethod?.icon}</span>
                {formContent?.title}
              </h2>
              <div className="flex justify-center mt-2">
                <div
                  className={`w-24 h-1 rounded-full ${
                    selectedMethod === "phone"
                      ? "bg-green-400"
                      : selectedMethod === "email"
                      ? "bg-red-400"
                      : "bg-blue-400"
                  }`}
                ></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  Tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Nhập tên của bạn"
                />
              </div>

              {/* Email/Phone */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  {selectedMethod === "phone"
                    ? "Số điện thoại"
                    : selectedMethod === "zalo"
                    ? "Số điện thoại"
                    : "Email"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type={
                    selectedMethod === "phone" || selectedMethod === "zalo"
                      ? "tel"
                      : "email"
                  }
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder={
                    selectedMethod === "phone" || selectedMethod === "zalo"
                      ? "Nhập số điện thoại của bạn"
                      : "Nhập email của bạn"
                  }
                />
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-700">
                  {selectedMethod === "zalo" ? "Tin nhắn Zalo" : "Tin nhắn"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className={`w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 resize-vertical transition-all duration-300 ${
                    selectedMethod === "phone"
                      ? "focus:ring-green-400 focus:border-green-400"
                      : selectedMethod === "email"
                      ? "focus:ring-red-400 focus:border-red-400"
                      : "focus:ring-blue-400 focus:border-blue-400"
                  }`}
                  placeholder={formContent?.placeholder}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-2 font-medium text-white transition-all duration-300 transform hover:scale-105 ${
                    selectedMethod === "phone"
                      ? "bg-green-600 hover:bg-green-700"
                      : selectedMethod === "email"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin">⏳</div>
                        ĐANG GỬI...
                      </>
                    ) : (
                      <>
                        <span>{formContent?.buttonIcon}</span>
                        {formContent?.buttonText}
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
