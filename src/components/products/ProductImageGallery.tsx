"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/getImageUrl";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  description?: string;
  shortDescription?: string;
}

export default function ProductImageGallery({
  images,
  productName,
  description,
  shortDescription,
}: ProductImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const safeImages = images && Array.isArray(images) ? images : [];

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? safeImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === safeImages.length - 1 ? 0 : prev + 1
    );
  };

  if (safeImages.length === 0) {
    return (
      <div className="aspect-square bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
        <Image
          src="/placeholder.svg"
          alt="Không có hình ảnh"
          width={400}
          height={400}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {safeImages.length > 1 && (
        <div className="flex flex-col gap-2 w-20">
          {safeImages.slice(0, 4).map((image, index) => (
            <div
              key={index}
              className={`aspect-square bg-secondary rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-all duration-200 ${
                currentImageIndex === index
                  ? "ring-2 ring-primary ring-offset-2"
                  : ""
              }`}
              onClick={() => handleThumbnailClick(index)}
            >
              <Image
                src={getImageUrl(image)}
                alt={`${productName} ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 space-y-4">
        <div className="relative aspect-square bg-secondary rounded-lg overflow-hidden group">
          <Image
            src={getImageUrl(safeImages[currentImageIndex])}
            alt={`${productName} - Ảnh ${currentImageIndex + 1}`}
            width={600}
            height={600}
            className="w-full h-full object-cover transition-all duration-300"
            priority
          />

          {safeImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={handlePreviousImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {safeImages.length > 1 && (
          <div className="text-center text-sm text-muted-foreground">
            {currentImageIndex + 1} / {safeImages.length}
          </div>
        )}
      </div>
    </div>
  );
}
