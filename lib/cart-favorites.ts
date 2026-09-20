import type { Product } from "@/types/database";

/**
 * Mesmas chaves de localStorage do site original (rd_cart / rd_favs),
 * para que quem já tinha itens guardados no browser não os perca com
 * a migração para Next.js.
 */
const CART_KEY = "rd_cart";
const FAV_KEY = "rd_favs";

export interface StoredProduct {
  id: string;
  name: string;
  brand?: string | null;
  price: number;
  image?: string | null;
}

export interface CartItem extends StoredProduct {
  qty: number;
}

export function toStoredProduct(product: Product): StoredProduct {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.promo_price ?? product.price,
    image: product.image_url,
  };
}

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const cartStorage = {
  get: (): CartItem[] => readList<CartItem>(CART_KEY),
  save: (cart: CartItem[]) => writeList(CART_KEY, cart),
};

export const favStorage = {
  get: (): StoredProduct[] => readList<StoredProduct>(FAV_KEY),
  save: (favs: StoredProduct[]) => writeList(FAV_KEY, favs),
};
