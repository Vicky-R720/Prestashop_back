import { createContext, useContext, useMemo, useState } from "react";

import { mockProducts } from "./mockData";

const StoreContext = createContext(null);

const productMap = new Map(mockProducts.map((product) => [product.id, product]));

const initialCart = [
  { productId: "ps-101", qty: 1 },
  { productId: "ps-104", qty: 1 },
];

const initialWishlist = ["ps-102", "ps-108"];

export function StoreProvider({ children }) {
  const [cartItems, setCartItems] = useState(initialCart);
  const [wishlist, setWishlist] = useState(initialWishlist);

  const addToCart = (productId, qty = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, qty: item.qty + qty }
            : item
        );
      }
      return [...prev, { productId, qty }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQty = (productId, qty) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, qty: Math.max(1, qty) }
          : item
      )
    );
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const wishlistCount = wishlist.length;
  const cartCount = cartItems.reduce((total, item) => total + item.qty, 0);

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        return total;
      }
      return total + product.price * item.qty;
    }, 0);
  }, [cartItems]);

  const cartLines = cartItems
    .map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        return null;
      }
      return { ...item, product };
    })
    .filter(Boolean);

  const value = {
    cartItems: cartLines,
    wishlist,
    cartCount,
    wishlistCount,
    cartSubtotal,
    addToCart,
    removeFromCart,
    updateQty,
    toggleWishlist,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
}
