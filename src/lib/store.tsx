import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  gift?: { occasion: string; recipient: string; message: string };
};

type Store = {
  cart: CartItem[];
  add: (item: Omit<CartItem, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  count: number;
  total: number;
  wishlist: string[];
  toggleWish: (id: string) => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem("ke-cart") || "[]"));
      setWishlist(JSON.parse(localStorage.getItem("ke-wish") || "[]"));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem("ke-cart", JSON.stringify(cart));
  }, [cart, loaded]);
  useEffect(() => {
    if (loaded) localStorage.setItem("ke-wish", JSON.stringify(wishlist));
  }, [wishlist, loaded]);

  const add: Store["add"] = (item, qty = 1) => {
    const key = item.gift ? `${item.productId}-${Date.now()}` : item.productId;
    setCart((c) => {
      const existing = c.find((i) => i.key === key);
      if (existing) return c.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      return [...c, { ...item, key, qty }];
    });
    toast.success(`${item.name} added to your cart`);
  };

  const value: Store = {
    cart,
    add,
    setQty: (key, qty) =>
      setCart((c) => (qty <= 0 ? c.filter((i) => i.key !== key) : c.map((i) => (i.key === key ? { ...i, qty } : i)))),
    remove: (key) => setCart((c) => c.filter((i) => i.key !== key)),
    clear: () => setCart([]),
    count: cart.reduce((s, i) => s + i.qty, 0),
    total: cart.reduce((s, i) => s + i.qty * i.price, 0),
    wishlist,
    toggleWish: (id) =>
      setWishlist((w) => {
        const has = w.includes(id);
        toast(has ? "Removed from My Moments of Light" : "Saved to My Moments of Light");
        return has ? w.filter((x) => x !== id) : [...w, id];
      }),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
