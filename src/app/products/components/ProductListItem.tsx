"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { IProduct } from "@/models/Product";
import { FaHeart, FaShoppingCart, FaBalanceScale } from "react-icons/fa";
import SafeImage from "@/components/SafeImage";
import StarRating from "@/app/products/components/StarRating";
import { useCompare } from "@/contexts/CompareContext";

interface ProductListItemProps {
  product: IProduct;
  onAddToCompare?: (product: IProduct) => void;
  onAddToCart?: (product: IProduct) => void;
  onToggleFavorite?: (product: IProduct) => void;
}

const ProductListItem: React.FC<ProductListItemProps> = ({
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
    // Navigate to product detail page
    const productId = String(product._id) || product.productId || product.id;
    router.push(`/products/${productId}`);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden p-4 mb-4 ${
        isProductInCompare ? "ring-2 ring-[#8ba63a] ring-opacity-50" : ""
      }`}
    >
      <div className="flex flex-col md:flex-row gap-4">
        {/* Product Image */}
        <div
          className="relative flex-shrink-0 w-full md:w-48 group/image cursor-pointer"
          onClick={handleProductClick}
        >
          <SafeImage
            src={product.images?.[0] || ""}
            alt={product.name}
            width={200}
            height={200}
            className="w-full h-48 md:h-32 object-cover rounded-lg transition-transform duration-300 group-hover/image:scale-105"
            fallbackClassName="w-full h-48 md:h-32 rounded-lg"
          />

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              -{discountPercent}%
            </div>
          )}

          {/* Button So sánh ở góc trên bên phải */}
          <button
            onClick={handleCompareClick}
            className={`absolute top-2 right-2 p-1 rounded-full transition-all duration-300 ${
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
            <FaBalanceScale className="text-xs" />
          </button>
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col">
          {/* Product Details */}
          <div className="flex-1">
            {/* Brand */}
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
              {product.attributes?.brand || "Brand"}
            </p>

            {/* Product Name */}
            <h3
              className="font-semibold text-lg text-gray-800 mb-2 cursor-pointer hover:text-[#8ba63a] transition-colors"
              onClick={handleProductClick}
            >
              {product.name}
            </h3>

            {/* Rating */}
            <div className="mb-2">
              <StarRating
                rating={product.rating?.average || 0}
                size="sm"
                showValue={true}
                reviewCount={product.rating?.count || 0}
              />
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.shortDescription || product.description}
            </p>

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-[#8ba63a]">
                  {product.salePrice.toLocaleString("vi-VN")}₫
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-500 line-through">
                    {product.price.toLocaleString("vi-VN")}₫
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Now at bottom */}
          <div className="flex gap-2 mt-auto">
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
    </div>
  );
};

export default ProductListItem;
