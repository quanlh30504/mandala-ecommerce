'use client';
import React from 'react';
import { IProduct } from '@/models/Product';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: IProduct[];
  onAddToCompare?: (product: IProduct) => void;
  onAddToCart?: (product: IProduct) => void;
  onToggleFavorite?: (product: IProduct) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  onAddToCompare, 
  onAddToCart, 
  onToggleFavorite 
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard
          key={String(product._id) || product.productId || product.id}
          product={product}
          onAddToCompare={onAddToCompare}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
