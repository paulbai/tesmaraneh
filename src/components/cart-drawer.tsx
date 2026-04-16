"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/products";
import Image from "next/image";

export function CartDrawer() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const handleCheckout = () => {
    // Open Flot payment in a popup window
    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(
      "https://pay.flotme.ai/pay",
      "FlotCheckout",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-white z-[71] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--cream-dark)]">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-[var(--charcoal)]" />
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--charcoal)]">
                  Your Cart
                </h3>
                {totalItems > 0 && (
                  <span className="bg-[var(--terracotta)] text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold font-[family-name:var(--font-body)]">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="cursor-pointer w-10 h-10 rounded-full bg-[var(--cream)] flex items-center justify-center text-[var(--charcoal)] hover:bg-[var(--cream-dark)] transition-colors duration-300"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--cream)] flex items-center justify-center mb-4">
                    <ShoppingBag size={28} className="text-[var(--warm-gray-light)]" />
                  </div>
                  <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--charcoal)] mb-2">
                    Your cart is empty
                  </p>
                  <p className="font-[family-name:var(--font-body)] text-sm text-[var(--warm-gray)]">
                    Explore our collections to find something you love
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--cream-dark)]">
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 px-6 py-5"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-[var(--cream-dark)] shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--charcoal)] truncate">
                          {item.product.name}
                        </h4>
                        <p className="font-[family-name:var(--font-body)] text-xs text-[var(--warm-gray)] capitalize mt-0.5">
                          {item.product.collection === "gara"
                            ? "Gara Tie-Dye"
                            : item.product.collection === "batik"
                            ? "Batik"
                            : "Woven Cloth"}
                        </p>
                        <p className="font-[family-name:var(--font-display)] text-sm font-bold text-[var(--terracotta)] mt-1">
                          {formatPrice(item.product.price)}
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-[var(--cream-dark)] rounded-full">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                              className="cursor-pointer w-8 h-8 flex items-center justify-center text-[var(--warm-gray)] hover:text-[var(--charcoal)] transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-[family-name:var(--font-body)] font-semibold text-[var(--charcoal)]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                              className="cursor-pointer w-8 h-8 flex items-center justify-center text-[var(--warm-gray)] hover:text-[var(--charcoal)] transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="cursor-pointer w-8 h-8 flex items-center justify-center text-[var(--warm-gray)] hover:text-red-500 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Line total */}
                      <div className="text-right shrink-0">
                        <p className="font-[family-name:var(--font-body)] text-sm font-bold text-[var(--charcoal)]">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="shrink-0 border-t border-[var(--cream-dark)] bg-[var(--cream)] px-6 py-5 space-y-4">
                {/* Totals */}
                <div className="flex items-center justify-between">
                  <span className="font-[family-name:var(--font-body)] text-sm text-[var(--warm-gray)]">
                    Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                  </span>
                  <span className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--charcoal)]">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                {/* Checkout button */}
                <button
                  onClick={handleCheckout}
                  className="cursor-pointer w-full flex items-center justify-center gap-2 bg-[var(--terracotta)] text-white py-4 rounded-full text-base font-[family-name:var(--font-body)] font-semibold tracking-wide hover:bg-[var(--terracotta-dark)] transition-colors duration-300 shadow-lg"
                >
                  Checkout with Flot
                </button>

                {/* Clear cart */}
                <button
                  onClick={clearCart}
                  className="cursor-pointer w-full text-center text-xs text-[var(--warm-gray)] hover:text-red-500 transition-colors duration-300 font-[family-name:var(--font-body)]"
                >
                  Clear cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
