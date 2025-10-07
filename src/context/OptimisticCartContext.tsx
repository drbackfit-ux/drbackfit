"use client";

import "client-only";
import { createContext, useContext, ReactNode, useOptimistic } from "react";
import type { CartItem as CartItemType } from "@/models/Cart";

// Simple client-side cart context for optimistic updates
interface CartContextType {
  itemCount: number;
  optimisticAdd: () => void;
  optimisticRemove: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({
  children,
  initialItemCount = 0,
}: {
  children: ReactNode;
  initialItemCount?: number;
}) => {
  const [optimisticItemCount, addOptimisticItemCount] = useOptimistic(
    initialItemCount,
    (state, delta: number) => Math.max(0, state + delta)
  );

  const optimisticAdd = () => addOptimisticItemCount(1);
  const optimisticRemove = () => addOptimisticItemCount(-1);

  return (
    <CartContext.Provider
      value={{
        itemCount: optimisticItemCount,
        optimisticAdd,
        optimisticRemove,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
