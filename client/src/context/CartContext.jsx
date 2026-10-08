import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1, openDrawer = false) => {
    setItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === product.id);
      if (existing) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock_quantity) }
            : item
        );
      }
      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          shop_id: product.shop_id,
          shop_name: product.shop_name || 'Verified Vendor',
          stock_quantity: product.stock_quantity,
          quantity: Math.min(quantity, product.stock_quantity)
        }
      ];
    });
    if (openDrawer) {
      setIsDrawerOpen(true);
    }
  };

  const updateQuantity = (id, delta) => {
    setItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.stock_quantity) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = Number((subtotal * 0.10).toFixed(2)); // 10% VAT
  const shippingFee = 0.01; // $0.01 delivery fee
  const grandTotal = Number((subtotal + taxAmount + shippingFee).toFixed(2));
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Group items by Vendor/Shop
  const vendorGroups = items.reduce((groups, item) => {
    const shopName = item.shop_name || 'General Vendor';
    if (!groups[shopName]) {
      groups[shopName] = [];
    }
    groups[shopName].push(item);
    return groups;
  }, {});

  return (
    <CartContext.Provider
      value={{
        items,
        vendorGroups,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        taxAmount,
        shippingFee,
        grandTotal,
        totalCount,
        isDrawerOpen,
        setIsDrawerOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
