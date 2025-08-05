// Mở popup so sánh sản phẩm
"use client";
import React from "react";
import { IProduct } from "@/models/Product";
import { ICategory } from "@/models/Category";
import { FaTimes, FaShoppingCart } from "react-icons/fa";
import SafeImage from "@/components/SafeImage";
import StarRating from "@/app/products/components/StarRating";

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: IProduct[];
  categories: ICategory[];
  onRemoveProduct: (productId: string) => void;
  onAddToCart?: (product: IProduct) => void;
}

const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  products,
  categories,
  onRemoveProduct,
  onAddToCart,
}) => {
  if (!isOpen || products.length === 0) return null;

  const getAttributeValue = (product: IProduct, key: string) => {
    if (!product.attributes) return "N/A";
    const value = (product.attributes as any)[key];

    if (value === null || value === undefined) {
      return "N/A";
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return "N/A";
      }
    }
    return String(value);
  };

  // Helper function để lấy tên category từ ID
  const getCategoryById = (categoryId: string) => {
    return categories.find(
      (cat) => String(cat._id) === categoryId || cat.categoryId === categoryId
    );
  };

  // Function để format category display
  const formatCategoryDisplay = (categoryIds: string[]) => {
    if (!categoryIds || categoryIds.length === 0) return "N/A";

    const categoryNames: string[] = [];

    categoryIds.forEach((categoryId) => {
      const category = getCategoryById(categoryId);
      if (category) {
        if (category.level === 2 && category.parentId) {
          // Đây là subcategory, tìm parent category
          const parentCategory = getCategoryById(category.parentId);
          if (parentCategory) {
            categoryNames.push(`${parentCategory.name} - ${category.name}`);
          } else {
            categoryNames.push(category.name);
          }
        } else {
          // Đây là category chính (level 1)
          categoryNames.push(category.name);
        }
      }
    });

    return categoryNames.length > 0 ? categoryNames.join(", ") : "N/A";
  };

  // Lấy toàn bộ thông tin của sản phẩm
  const allAttributes = new Set<string>();
  products.forEach((product) => {
    if (product.attributes) {
      Object.keys(product.attributes).forEach((key) => allAttributes.add(key));
    }
  });

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">So sánh sản phẩm</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          <div className="p-4">
            {/* Products Grid */}
            <div
              className={`grid gap-4 ${
                products.length === 1
                  ? "grid-cols-1"
                  : products.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3"
              } mb-6`}
            >
              {products.map((product) => (
                <div
                  key={String(product._id)}
                  className="border rounded-lg p-4 relative"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveProduct(String(product._id))}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <FaTimes className="text-xs" />
                  </button>

                  <div className="mb-3">
                    <SafeImage
                      src={product.images?.[0] || ""}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="w-full h-32 object-cover rounded-lg"
                      fallbackClassName="w-full h-32 rounded-lg"
                    />
                  </div>

                  <h3 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2">
                    {String(product.name || "Unnamed Product")}
                  </h3>

                  <div className="mb-2">
                    <StarRating
                      rating={product.rating?.average || 0}
                      size="xs"
                      showValue={true}
                      reviewCount={product.rating?.count || 0}
                    />
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-1 flex-col">
                      <span className="text-lg font-bold text-[#8ba63a]">
                        {product.salePrice.toLocaleString("vi-VN")}₫
                      </span>
                      {product.salePrice < product.price && (
                        <span className="text-xs text-gray-500 line-through">
                          {product.price.toLocaleString("vi-VN")}₫
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onAddToCart?.(product)}
                    className="w-full bg-[#8ba63a] hover:bg-[#7a942c] text-white py-2 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <FaShoppingCart className="text-xs" />
                    MUA HÀNG
                  </button>
                </div>
              ))}
            </div>

            {/* Bảng so sánh */}
            {allAttributes.size > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left font-semibold">
                        Thuộc tính
                      </th>
                      {products.map((product) => (
                        <th
                          key={String(product._id)}
                          className="border border-gray-300 p-3 text-center font-semibold text-sm"
                        >
                          {String(product.name || "Unnamed Product")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Thông tin cơ bản: tên, brand, category, short description */}
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium bg-gray-50">
                        Thương hiệu
                      </td>
                      {products.map((product) => (
                        <td
                          key={String(product._id)}
                          className="border border-gray-300 p-3 text-center text-sm"
                        >
                          {getAttributeValue(product, "brand")}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium bg-gray-50">
                        Danh mục
                      </td>
                      {products.map((product) => (
                        <td
                          key={String(product._id)}
                          className="border border-gray-300 p-3 text-center text-sm"
                        >
                          {formatCategoryDisplay(product.categoryIds)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium bg-gray-50">
                        Mô tả ngắn
                      </td>
                      {products.map((product) => (
                        <td
                          key={String(product._id)}
                          className="border border-gray-300 p-3 text-center text-sm"
                        >
                          {String(product.shortDescription || "N/A")}
                        </td>
                      ))}
                    </tr>

                    {/* Thông tin động ( xử lý thông tin tùy chọn ( có ở sản phẩm này nhưng không có ở sản phẩm khác)) */}
                    {Array.from(allAttributes).map((attribute) => (
                      <tr key={attribute}>
                        <td className="border border-gray-300 p-3 font-medium bg-gray-50 capitalize">
                          {attribute.replace(/([A-Z])/g, " $1").trim()}
                        </td>
                        {products.map((product) => (
                          <td
                            key={String(product._id)}
                            className="border border-gray-300 p-3 text-center text-sm"
                          >
                            {getAttributeValue(product, attribute)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
