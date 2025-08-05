// components/SafeImage.tsx

"use client";
import React, { useState } from "react";
import Image from "next/image";
import { getValidImageUrl } from "@/lib/utils";

// Cập nhật Props Interface
interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = "",
  fallbackClassName = "",
  priority = false,
  fill = false,
  width,
  height,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Xác thực props: Nếu không fill thì phải có width/height
  if (!fill && (width === undefined || height === undefined)) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "SafeImage: width và height là bắt buộc khi không dùng fill."
      );
    }
    // Trả về fallback UI ngay lập tức
    return <FallbackUI className={fallbackClassName || className} />;
  }

  const imageUrl = src ? getValidImageUrl(src) : "";

  // Handle lỗi hoặc src không hợp lệ
  if (hasError || !imageUrl) {
    return (
      <FallbackUI
        style={!fill ? { width, height } : {}}
        className={fallbackClassName || className}
      />
    );
  }

  // Tạo props cho Image một cách linh hoạt
  const imageProps = fill ? { fill: true } : { width: width!, height: height! };

  return (
    <>
      {/* Không cần thẻ div bọc ngoài với position: relative nữa
              Vì thẻ cha của SafeImage khi dùng fill={true} sẽ phải đảm nhận việc này
            */}
      {isLoading && (
        <div
          className={`absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
          // Chỉ áp dụng style khi không dùng fill
          style={!fill ? { width, height } : {}}
        >
          <div className="text-gray-400 text-xl">...</div>
        </div>
      )}
      <Image
        src={imageUrl}
        alt={alt}
        // Dùng spread syntax để truyền fill hoặc width/height
        {...imageProps}
        className={className}
        priority={priority}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (process.env.NODE_ENV === "development") {
            console.error("SafeImage - Lỗi tải ảnh:", imageUrl);
          }
          setHasError(true);
          setIsLoading(false);
        }}
        style={{
          // Dùng className để kiểm soát object-fit (ví dụ: object-cover)
          transition: "opacity 0.3s ease-in-out",
          opacity: isLoading ? 0 : 1,
        }}
      />
    </>
  );
};

// Tách UI fallback ra để tái sử dụng
const FallbackUI: React.FC<{
  style?: React.CSSProperties;
  className?: string;
}> = ({ style, className }) => (
  <div
    className={`bg-gray-200 flex items-center justify-center ${className}`}
    style={style}
  >
    <div className="text-center">
      <div className="text-gray-400 text-2xl mb-2">📷</div>
      <span className="text-gray-500 text-xs">No Image</span>
    </div>
  </div>
);

export default SafeImage;
