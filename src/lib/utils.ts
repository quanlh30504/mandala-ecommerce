import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getValidImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  
  // Remove public prefix if it exists (both "/public" and "public")
  let cleanUrl = imageUrl.replace(/^\/public\//, '/').replace(/^public\//, '/');
  
  // Ensure the URL starts with /
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl;
  }
  
  return cleanUrl;
}

/**
 * Định dạng một số thành chuỗi tiền tệ theo chuẩn Việt Nam (VND).
 * @param amount - Số tiền cần định dạng.
 * @returns Một chuỗi đã được định dạng, ví dụ: "50.000 ₫".
 */
export const formatCurrency = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0 ₫'; 
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};
