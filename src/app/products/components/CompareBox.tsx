"use client";
import React, { useState } from "react";
import { IProduct } from "@/models/Product";
import { ICategory } from "@/models/Category";
import { useCompare } from "@/contexts/CompareContext";
import { FaTimes, FaBalanceScale, FaShoppingCart } from "react-icons/fa";
import SafeImage from "../../../components/SafeImage";
import CompareModal from "./CompareModal";

interface CompareBoxProps {
  categories: ICategory[];
}

const CompareBox: React.FC<CompareBoxProps> = ({ categories }) => {
  const { compareProducts, removeFromCompare, clearCompare } = useCompare();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Chức năng thêm vào giỏ hàng
  const handleAddToCart = (product: IProduct) => {
    console.log("Added to cart:", product);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
            SO SÁNH SẢN PHẨM ({compareProducts.length}/3)
          </h4>
          {compareProducts.length > 0 && (
            <button
              onClick={clearCompare}
              className="text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {compareProducts.length === 0 ? (
          <div className="text-center py-8">
            <FaBalanceScale className="mx-auto text-gray-300 text-2xl mb-2" />
            <p className="text-gray-500 text-sm">
              Bạn chưa có sản phẩm để so sánh
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Nhấp vào sản phẩm để thêm vào so sánh
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              {compareProducts.map((product) => (
                <div
                  key={String(product._id)}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <SafeImage
                      src={product.images?.[0] || ""}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 object-cover rounded"
                      fallbackClassName="w-10 h-10 rounded"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-[#8ba63a] font-semibold">
                      {product.salePrice.toLocaleString("vi-VN")}₫
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCompare(String(product._id))}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-[#8ba63a] hover:bg-[#7a942c] text-white py-2 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-2"
              >
                <FaBalanceScale className="text-xs" />
                So sánh chi tiết
              </button>

              {compareProducts.length >= 2 && (
                <p className="text-xs text-center text-gray-500">
                  Tối đa 3 sản phẩm
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Compare Modal */}
      <CompareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={compareProducts}
        categories={categories}
        onRemoveProduct={removeFromCompare}
        onAddToCart={handleAddToCart}
      />
    </>
  );
};

export default CompareBox;
