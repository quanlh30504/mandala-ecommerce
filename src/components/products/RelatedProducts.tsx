"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { getImageUrl } from "@/lib/getImageUrl";
import { IProduct } from "@/models/Product";
import { formatCurrency } from "@/lib/utils";
interface RelatedProductsProps {
  products: IProduct[];
  title?: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({
  products,
  title = "SẢN PHẨM BÁN CHẠY",
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center pb-2 border-b border-[#8BC34A]">
        {title}
      </h3>

      <div className="space-y-4">
        {products.slice(0, 4).map((product) => (
          <Link key={product.productId} href={`/products/${product.slug}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-3">
                <div className="flex space-x-3">
                  {/* Product Image */}
                  <div className="w-16 h-16 flex-shrink-0">
                    <Image
                      src={getImageUrl(product.images?.[0] || "")}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">
                      {product.name}
                    </h4>

                    {/* Rating */}
                    <div className="flex items-center space-x-1 mb-2">
                      <div className="flex">
                        {renderStars(product.rating.average)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({product.rating.count || 0})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center space-x-2">
                      {product.salePrice &&
                      product.salePrice < product.price ? (
                        <>
                          <span className="font-bold text-[#8BC34A] text-sm">
                            {formatCurrency(product.salePrice)}
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            {formatCurrency(product.price)}
                          </span>
                          {product.salePrice &&
                            product.salePrice < product.price && (
                              <Badge
                                variant="destructive"
                                className="text-xs px-1 py-0"
                              >
                                -
                                {Math.round(
                                  ((product.price - product.salePrice) /
                                    product.price) *
                                    100
                                )}
                                %
                              </Badge>
                            )}
                        </>
                      ) : (
                        <span className="font-bold text-foreground text-sm">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
