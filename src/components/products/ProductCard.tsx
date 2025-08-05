"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import React, { useState, useTransition } from "react";
import { formatCurrency } from "@/lib/utils";
import { buyNowAndRedirect } from "@/lib/actions/cart";
import { Toast } from "react-hot-toast";
interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  image: string;
  rating: {
    average: number;
    count: number;
  };
  isHotTrend?: boolean;
  isFeatured?: boolean;
}

const ProductCard = ({
  id,
  name,
  slug,
  price,
  salePrice,
  image,
  rating,
  isHotTrend,
  isFeatured,
}: ProductCardProps) => {
  const [isPending, startTransition] = useTransition();

  console;

  const handleBuyNow = () => {
    startTransition(async () => {
      try {
        const result = await buyNowAndRedirect(id, 1);
        if (result?.error) {
          toast.error(result.error);
        }
      } catch (error) {
        // toast.error(error.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    });
  };

  const discountPercentage = salePrice
    ? Math.round(((price - salePrice) / price) * 100)
    : 0;

  return (
    <Card className="group hover:shadow-medium transition-all duration-300 overflow-hidden">
      <div className="relative">
        <Link href={`/products/${slug}`}>
          <div className="aspect-square overflow-hidden">
            <Image
              src={image}
              alt={name}
              width={500}
              height={500}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isHotTrend && (
            <Badge variant="destructive" className="text-xs bg-red-500">
              HOT
            </Badge>
          )}
          {salePrice && (
            <Badge variant="secondary" className="text-xs">
              -{discountPercentage}%
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
        >
          <Heart className="h-4 w-4" />
        </Button>

        {/* Quick Actions */}
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            className="w-full bg-[#8BC34A] hover:bg-[#7AB23C] text-white"
            size="sm"
            onClick={handleBuyNow}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            MUA HÀNG
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <Link href={`/products/${slug}`}>
          <h3 className="font-medium text-sm mb-2 line-clamp-2 hover:text-[#8BC34A] transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < Math.floor(rating.average)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            ({rating.count || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          {salePrice ? (
            <>
              <span className="font-bold text-[#8BC34A]">
                {formatCurrency(salePrice)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(price)}
              </span>
            </>
          ) : (
            <span className="font-bold text-foreground">
              {formatCurrency(price)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
