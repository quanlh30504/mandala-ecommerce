"use client";

import { useState } from 'react';

interface SizeSelectorProps {
  sizes: string[] | string | Record<string, string>;
}

export default function SizeSelector({ sizes }: SizeSelectorProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');

  const getSizeOptions = () => {
    if (Array.isArray(sizes)) {
      return sizes;
    } else if (typeof sizes === 'string') {
      return [sizes];
    } else {
      return Object.values(sizes);
    }
  };

  const sizeOptions = getSizeOptions();

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-lg">SIZE</h3>
      <div className="flex flex-wrap gap-2">
        {sizeOptions.map((size, index) => (
          <button
            key={index}
            onClick={() => setSelectedSize(size)}
            className={`px-4 py-2 border rounded-md transition-colors text-sm font-medium ${
              selectedSize === size
                ? 'border-[#8BC34A] bg-[#8BC34A] text-white'
                : 'border-gray-300 hover:border-[#8BC34A] hover:bg-[#8BC34A]/5'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
      {selectedSize && (
        <p className="text-sm text-muted-foreground">
          Size đã chọn: <span className="font-medium">{selectedSize}</span>
        </p>
      )}
    </div>
  );
}
