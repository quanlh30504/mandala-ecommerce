export interface CartItem {
  productId: string;
  quantity: number;
  selectedAttributes: {
    size?: string;
    [key: string]: string | undefined;
  };
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
}
