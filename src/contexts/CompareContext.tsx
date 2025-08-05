'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { IProduct } from '@/models/Product';

interface CompareContextType {
  compareProducts: IProduct[];
  addToCompare: (product: IProduct) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  compareCount: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};

interface CompareProviderProps {
  children: React.ReactNode;
}

export const CompareProvider: React.FC<CompareProviderProps> = ({ children }) => {
  const [compareProducts, setCompareProducts] = useState<IProduct[]>([]);

  const addToCompare = useCallback((product: IProduct) => {
    setCompareProducts((prev) => {
      // Kiểm tra sản phẩm đã tồn tại chưa, nếu có không thêm
      if (prev.some(p => p._id === product._id)) {
        return prev;
      }
      
      // Nếu chọn sản phẩm thứ 4 trở đi, giữ lại 3 sản phẩm cuối
      if (prev.length >= 3) {
        return [...prev.slice(1), product];
      }
      
      return [...prev, product];
    });
  }, []);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareProducts((prev) => prev.filter(p => p._id !== productId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareProducts([]);
  }, []);

  const isInCompare = useCallback((productId: string) => {
    return compareProducts.some(p => p._id === productId);
  }, [compareProducts]);

  const compareCount = compareProducts.length;

  const value: CompareContextType = {
    compareProducts,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    compareCount,
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
};

export default CompareProvider;
