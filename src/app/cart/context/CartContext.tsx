"use client";

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useTransition,
  useMemo,
} from "react";
import { updateItemQuantity, removeItemsFromCart } from "@/lib/actions/cart";
import { toast } from "react-hot-toast";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
export interface PopulatedCartItem {
  _id: string;
  quantity: number;
  product: {
    _id: string;
    name: string;
    images: string[];
    price: number;
    salePrice?: number;
    stock: number;
    slug: string;
  };
}

export interface PopulatedCart {
  _id: string;
  user: string;
  items: PopulatedCartItem[];
  totalItems: number;
}

interface CartContextType {
  items: PopulatedCartItem[];
  totalItems: number;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  removeItems: (cartItemIds: string[]) => void;
  selectedItemIds: string[];
  toggleItemSelected: (cartItemId: string) => void;
  toggleSelectAll: () => void;
  isPending: boolean; // Trạng thái chờ cho các action
  clearOrderedItems: (orderedItemIds: string[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  initialCart,
}: {
  children: ReactNode;
  initialCart: PopulatedCart | null;
}) {
  const [items, setItems] = useState<PopulatedCartItem[]>(
    initialCart?.items || []
  );
  const [totalItems, setTotalItems] = useState<number>(
    initialCart?.totalItems || 0
  );
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setItems(initialCart?.items || []);
    setTotalItems(initialCart?.totalItems || 0);
  }, [initialCart]);

  // tự động chọn sản phẩm trong card nếu có id trong param (chức năng mua hàng trong product detail sẽ dẫn đến card khi mua hàng)
  // Logic tự động chọn sản phẩm và xóa param khỏi URL để tránh vòng lặp
  useEffect(() => {
    const selectItemId = searchParams.get('selectItemId');
    if (selectItemId) {
      if (items.some(item => item._id === selectItemId) && !selectedItemIds.includes(selectItemId)) {
        setSelectedItemIds(prev => [...prev, selectItemId]);
      }
      // Xóa param khỏi URL sau khi đã xử lý
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('selectItemId');
      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
    }
  }, [items, searchParams, selectedItemIds, pathname, router]);


  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    startTransition(async () => {
      const result = await updateItemQuantity(cartItemId, newQuantity);
      if (!result.success) {
        toast.error(result.message);
      }
    });
  };

  const removeItems = (cartItemIds: string[]) => {
    startTransition(async () => {
      const result = await removeItemsFromCart(cartItemIds);
      if (result.success) {
        toast.success(result.message);
        setSelectedItemIds((prev) =>
          prev.filter((id) => !cartItemIds.includes(id))
        );
      } else {
        toast.error(result.message);
      }
    });
  };

  const clearOrderedItems = (orderedItemIds: string[]) => {
    // Cập nhật lại state của items và selectedItemIds
    setItems((prev) =>
      prev.filter((item) => !orderedItemIds.includes(item._id))
    );
    setSelectedItemIds((prev) =>
      prev.filter((id) => !orderedItemIds.includes(id))
    );
  };

  const toggleItemSelected = (cartItemId: string) => {
    setSelectedItemIds((current) =>
      current.includes(cartItemId)
        ? current.filter((id) => id !== cartItemId)
        : [...current, cartItemId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItemIds.length === items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map((item) => item._id));
    }
  };

  const contextValue = useMemo(
    () => ({
      items,
      totalItems,
      selectedItemIds,
      isPending,
      updateQuantity,
      removeItems,
      clearOrderedItems,
      toggleItemSelected,
      toggleSelectAll,
    }),
    [items, totalItems, selectedItemIds, isPending]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
