'use client';
import React from 'react';
import { IProduct } from '@/models/Product';
import ProductListItem from './ProductListItem';

interface ProductListProps {
  products: IProduct[];
  onAddToCompare?: (product: IProduct) => void;
  onAddToCart?: (product: IProduct) => void;
  onToggleFavorite?: (product: IProduct) => void;
}

const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  onAddToCompare, 
  onAddToCart, 
  onToggleFavorite 
}) => {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <ProductListItem
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

export default ProductList;
