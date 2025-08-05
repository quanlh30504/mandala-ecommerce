import { getCart } from "@/lib/actions/cart";
import { CartProvider } from "@/app/cart/context/CartContext";
import CompareProvider from "@/contexts/CompareContext";

export default async function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const cartResult = await getCart();
  const initialCart = cartResult.success ? cartResult.data : null;

  return (
    <CartProvider initialCart={JSON.parse(JSON.stringify(initialCart))}>
      <CompareProvider>{children}</CompareProvider>
    </CartProvider>
  );
}
