"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus } from "lucide-react";
import { getProductsByCollection, formatPrice, type Product } from "@/lib/products";
import { useCart } from "@/context/cart-context";
import { useState } from "react";
import Image from "next/image";

const collectionMeta = {
  gara: {
    title: "Gara Tie-Dye",
    subtitle: "Ancient dyeing techniques creating unique, flowing patterns",
    gradient: "from-[var(--terracotta)] to-[var(--ochre)]",
  },
  batik: {
    title: "Batik Collection",
    subtitle: "Wax-resist dyed fabrics transformed into contemporary silhouettes",
    gradient: "from-[var(--indigo)] to-[var(--indigo-light)]",
  },
  woven: {
    title: "Woven Cloth",
    subtitle: "Traditional country cloth hand-woven into modern statement pieces",
    gradient: "from-[var(--forest)] to-[var(--forest-light)]",
  },
};

interface CollectionModalProps {
  collection: "gara" | "batik" | "woven" | null;
  onClose: () => void;
}

function ProductCard({ product }: { product: Product }) {
  const { addToCart, items } = useCart();
  const [added, setAdded] = useState(false);
  const cartItem = items.find((i) => i.product.id === product.id);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-[14px] sm:rounded-[20px] overflow-hidden shadow-sm border border-[var(--cream-dark)] hover:shadow-lg transition-all duration-500"
    >
      {/* Product image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--cream-dark)]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 640px) 45vw, (max-width: 768px) 50vw, 25vw"
        />
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <span className="bg-white/90 backdrop-blur-sm text-[var(--charcoal)] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-[family-name:var(--font-body)] font-semibold tracking-wider uppercase">
            {product.category}
          </span>
        </div>
      </div>

      {/* Product info */}
      <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-3">
        <h4 className="font-[family-name:var(--font-display)] text-sm sm:text-lg font-bold text-[var(--charcoal)] leading-tight">
          {product.name}
        </h4>
        <p className="font-[family-name:var(--font-body)] text-[10px] sm:text-xs text-[var(--warm-gray)] leading-relaxed line-clamp-2 hidden sm:block">
          {product.description}
        </p>
        <div className="flex items-center justify-between pt-0.5 sm:pt-1">
          <span className="font-[family-name:var(--font-display)] text-base sm:text-xl font-bold text-[var(--terracotta)]">
            {formatPrice(product.price)}
          </span>
        </div>
        <button
          onClick={handleAdd}
          className={`cursor-pointer w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-[family-name:var(--font-body)] font-semibold tracking-wide transition-all duration-300 ${
            added
              ? "bg-[var(--forest)] text-white"
              : "bg-[var(--charcoal)] text-white hover:bg-[var(--terracotta)]"
          }`}
        >
          {added ? (
            <>Added!</>
          ) : (
            <>
              <ShoppingBag size={14} />
              Add to Cart
              {cartItem && cartItem.quantity > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {cartItem.quantity}
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

export function CollectionModal({ collection, onClose }: CollectionModalProps) {
  const { totalItems, setIsCartOpen } = useCart();

  if (!collection) return null;

  const meta = collectionMeta[collection];
  const collectionProducts = getProductsByCollection(collection);

  return (
    <AnimatePresence>
      {collection && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 sm:inset-4 md:inset-8 lg:inset-12 bg-[var(--cream)] rounded-none sm:rounded-[28px] z-[61] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div
              className={`bg-gradient-to-r ${meta.gradient} px-4 sm:px-6 md:px-10 py-5 sm:py-8 flex items-center justify-between shrink-0`}
            >
              <div className="min-w-0 flex-1 mr-3">
                <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-black text-white truncate">
                  {meta.title}
                </h2>
                <p className="font-[family-name:var(--font-body)] text-xs sm:text-sm text-white/60 mt-1 line-clamp-1">
                  {meta.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {totalItems > 0 && (
                  <button
                    onClick={() => {
                      onClose();
                      setTimeout(() => setIsCartOpen(true), 300);
                    }}
                    className="cursor-pointer relative flex items-center gap-1.5 sm:gap-2 bg-white/20 backdrop-blur-sm text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-[family-name:var(--font-body)] font-semibold hover:bg-white/30 transition-colors duration-300"
                  >
                    <ShoppingBag size={14} />
                    <span className="hidden sm:inline">Cart</span>
                    <span className="bg-white text-[var(--charcoal)] w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">
                      {totalItems}
                    </span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="cursor-pointer w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-300"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Products grid */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-10">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {collectionProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer with cart summary */}
            {totalItems > 0 && (
              <div className="shrink-0 border-t border-[var(--cream-dark)] bg-white px-4 sm:px-6 md:px-10 py-3 sm:py-4 flex items-center justify-between">
                <p className="font-[family-name:var(--font-body)] text-sm text-[var(--warm-gray)]">
                  <span className="font-bold text-[var(--charcoal)]">{totalItems}</span>{" "}
                  {totalItems === 1 ? "item" : "items"} in cart
                </p>
                <button
                  onClick={() => {
                    onClose();
                    setTimeout(() => setIsCartOpen(true), 300);
                  }}
                  className="cursor-pointer inline-flex items-center gap-2 bg-[var(--terracotta)] text-white px-6 py-3 rounded-full text-sm font-[family-name:var(--font-body)] font-semibold hover:bg-[var(--terracotta-dark)] transition-colors duration-300"
                >
                  <ShoppingBag size={14} />
                  View Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
