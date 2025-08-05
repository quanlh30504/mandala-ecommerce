"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { IProduct } from "@/models/Product";
import { FaHeart, FaShoppingCart, FaBalanceScale } from "react-icons/fa";
import SafeImage from "@/components/SafeImage";
import StarRating from "@/app/products/components/StarRating";
import { useCompare } from "@/contexts/CompareContext";

interface ProductCardProps {
  product: IProduct;
  onAddToCompare?: (product: IProduct) => void;
  onAddToCart?: (product: IProduct) => void;
  onToggleFavorite?: (product: IProduct) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCompare,
  onAddToCart,
  onToggleFavorite,
}) => {
  const router = useRouter();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const hasDiscount = product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const isProductInCompare = isInCompare(String(product._id));

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const productId = String(product._id) || product.productId || product.id;

    if (isProductInCompare) {
      // Nếu đã có trong danh sách so sánh, loại bỏ
      removeFromCompare(productId);
    } else {
      // Nếu chưa có, thêm vào danh sách so sánh
      addToCompare(product);
    }
  };

  const handleProductClick = () => {
    router.push(`/products/${product.slug}`);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${
        isProductInCompare ? "ring-2 ring-[#8ba63a] ring-opacity-50" : ""
      }`}
    >
      <div
        className="relative group/image cursor-pointer"
        onClick={handleProductClick}
      >
        <SafeImage
          src={product.images?.[0] || ""}
          alt={product.name}
          width={300}
          height={300}
          className="w-full h-48 md:h-56 object-cover transition-transform duration-300 group-hover/image:scale-105"
          fallbackClassName="w-full h-48 md:h-56"
        />

        {/* Phần discount */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
            -{discountPercent}%
          </div>
        )}

        {/* Button So sánh ở góc trên bên phải */}
        <button
          onClick={handleCompareClick}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 ${
            isProductInCompare
              ? "bg-[#8ba63a] text-white hover:bg-red-500"
              : "bg-white bg-opacity-90 text-gray-600 hover:bg-[#8ba63a] hover:text-white"
          }`}
          title={
            isProductInCompare
              ? "Bỏ khỏi danh sách so sánh"
              : "Thêm vào so sánh"
          }
        >
          <FaBalanceScale className="text-sm" />
        </button>
      </div>

      {/* Product Information */}
      <div className="p-4">
        <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
          {product.attributes?.brand || "Brand"}
        </p>

        <h3
          className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12 cursor-pointer hover:text-[#8ba63a] transition-colors"
          onClick={handleProductClick}
        >
          {product.name}
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
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#8ba63a]">
              {product.salePrice.toLocaleString("vi-VN")}₫
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {product.price.toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(product);
            }}
            className="flex-1 bg-[#8ba63a] hover:bg-[#7a942c] text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1"
          >
            <FaShoppingCart className="text-xs" />
            MUA HÀNG
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(product);
            }}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center"
          >
            <FaHeart className="text-gray-400 hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
