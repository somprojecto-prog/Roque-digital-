"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { cartStorage, favStorage, type CartItem, type StoredProduct } from "@/lib/cart-favorites";

interface StoreContextValue {
  cart: CartItem[];
  favorites: StoredProduct[];
  ready: boolean;
  addToCart: (product: StoredProduct, qty?: number) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleFavorite: (product: StoredProduct) => boolean;
  isFavorite: (id: string) => boolean;
  cartCount: number;
  favCount: number;
  cartTotal: number;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<StoredProduct[]>([]);
  const [ready, setReady] = useState(false);

  // O localStorage só existe no browser — carrega depois da hidratação.
  useEffect(() => {
    setCart(cartStorage.get());
    setFavorites(favStorage.get());
    setReady(true);
  }, []);

  const addToCart = useCallback(
    (product: StoredProduct, qty = 1) => {
      setCart((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        const next = existing
          ? prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i))
          : [...prev, { ...product, qty }];
        cartStorage.save(next);
        return next;
      });
    },
    []
  );

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => {
      const next = prev.filter((i) => i.id !== id);
      cartStorage.save(next);
      return next;
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setCart((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i));
      cartStorage.save(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    cartStorage.save([]);
  }, []);

  const toggleFavorite = useCallback(
    (product: StoredProduct) => {
      const exists = favorites.some((i) => i.id === product.id);
      const next = exists ? favorites.filter((i) => i.id !== product.id) : [...favorites, product];
      setFavorites(next);
      favStorage.save(next);
      return !exists;
    },
    [favorites]
  );

  const isFavorite = useCallback((id: string) => favorites.some((i) => i.id === id), [favorites]);

  const cartCount = cart.reduce((n, i) => n + i.qty, 0);
  const cartTotal = cart.reduce((n, i) => n + i.qty * i.price, 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        favorites,
        ready,
        addToCart,
        removeFromCart,
        setQty,
        clearCart,
        toggleFavorite,
        isFavorite,
        cartCount,
        favCount: favorites.length,
        cartTotal,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore deve ser usado dentro de <StoreProvider>");
  return ctx;
}
