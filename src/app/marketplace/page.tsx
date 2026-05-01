"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, Filter, Check } from "lucide-react";
import { products, formatPrice, type Product } from "@/lib/products";
import { useCart } from "@/context/cart-context";
import { SiteNav } from "@/components/site-nav";
import { CartDrawer } from "@/components/cart-drawer";

type Filter = "all" | "gara" | "batik" | "woven";

const filters: { key: Filter; label: string; hint: string }[] = [
  { key: "all", label: "All", hint: "Every piece" },
  { key: "gara", label: "Gara Tie-Dye", hint: "Hand-dyed" },
  { key: "batik", label: "Batik", hint: "Wax-resist" },
  { key: "woven", label: "Woven Cloth", hint: "Country / Leppi" },
];

function ProductCard({ product }: { product: Product }) {
  const { addToCart, items } = useCart();
  const [added, setAdded] = useState(false);
  const cartItem = items.find((i) => i.product.id === product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-[16px] sm:rounded-[22px] overflow-hidden shadow-sm border border-[var(--cream-dark)] hover:shadow-xl transition-all duration-500 flex flex-col"
    >
      <Link href={`/marketplace/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--cream-dark)]">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1.5">
            <span className="bg-white/90 backdrop-blur-sm text-[var(--charcoal)] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-[family-name:var(--font-body)] font-semibold tracking-wider uppercase">
              {product.category}
            </span>
            <span className="bg-[var(--charcoal)]/80 backdrop-blur-sm text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] font-[family-name:var(--font-body)] tracking-wider uppercase">
              {product.collection === "gara"
                ? "Gara"
                : product.collection === "batik"
                ? "Batik"
                : "Woven"}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-3 sm:p-5 space-y-2 sm:space-y-3 flex-1 flex flex-col">
        <Link href={`/marketplace/${product.id}`}>
          <h4 className="font-[family-name:var(--font-display)] text-base sm:text-lg font-bold text-[var(--charcoal)] leading-tight hover:text-[var(--terracotta)] transition-colors">
            {product.name}
          </h4>
        </Link>
        <p className="font-[family-name:var(--font-body)] text-[10px] sm:text-xs text-[var(--warm-gray)] leading-relaxed line-clamp-2 hidden sm:block">
          {product.fabric}
        </p>
        <div className="flex items-center justify-between pt-1 mt-auto">
          <span className="font-[family-name:var(--font-display)] text-base sm:text-xl font-bold text-[var(--terracotta)]">
            {formatPrice(product.priceUSD)}
          </span>
        </div>
        <button
          onClick={handleAdd}
          className={`cursor-pointer w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-[family-name:var(--font-body)] font-semibold tracking-wide transition-all duration-300 ${
            added
              ? "bg-[var(--forest)] text-white"
              : "bg-[var(--charcoal)] text-white hover:bg-[var(--terracotta)]"
          }`}
        >
          {added ? (
            <>
              <Check size={14} /> Added!
            </>
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

export default function MarketplacePage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const { setIsCartOpen, totalItems } = useCart();

  const filtered =
    activeFilter === "all"
      ? products
      : products.filter((p) => p.collection === activeFilter);

  return (
    <>
      <SiteNav />

      <main className="bg-[var(--cream)] min-h-screen pt-20 sm:pt-24 pb-24">
        {/* Hero header */}
        <section className="relative overflow-hidden bg-[var(--terracotta)] text-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-12 sm:py-16 md:py-20 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <span className="font-[family-name:var(--font-body)] text-xs sm:text-sm tracking-[0.3em] uppercase text-white/80 font-semibold block mb-4">
                Marketplace
              </span>
              <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] mb-6">
                SHOP THE <span className="text-[var(--charcoal)]">COLLECTION</span>
              </h1>
              <p className="font-[family-name:var(--font-body)] text-sm sm:text-base text-white/85 max-w-xl leading-relaxed">
                Every piece is hand-dyed, hand-batiked or hand-woven in Sierra
                Leone. Made by women, for women, with care.
              </p>
            </motion.div>
          </div>

          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="marketPat"
                  x="0"
                  y="0"
                  width="60"
                  height="60"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="30" cy="30" r="22" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#marketPat)" />
            </svg>
          </div>
        </section>

        {/* Filters */}
        <section className="sticky top-16 sm:top-20 md:top-24 z-30 bg-[var(--cream)]/95 backdrop-blur-md border-b border-[var(--cream-dark)]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-4 flex items-center gap-3 overflow-x-auto">
            <div className="flex items-center gap-2 text-[var(--warm-gray)] shrink-0 hidden sm:flex">
              <Filter size={14} />
              <span className="text-xs font-[family-name:var(--font-body)] tracking-widest uppercase">
                Filter
              </span>
            </div>
            <div className="flex gap-2">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`cursor-pointer whitespace-nowrap px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-[family-name:var(--font-body)] font-semibold transition-all duration-300 ${
                    activeFilter === f.key
                      ? "bg-[var(--charcoal)] text-white"
                      : "bg-white text-[var(--charcoal)] border border-[var(--cream-dark)] hover:border-[var(--terracotta)]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="ml-auto shrink-0 hidden sm:block">
              <span className="text-xs font-[family-name:var(--font-body)] text-[var(--warm-gray)]">
                {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
              </span>
            </div>
          </div>
        </section>

        {/* Product grid */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-10 sm:py-14">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="font-[family-name:var(--font-body)] text-[var(--warm-gray)]">
                No products found in this collection yet.
              </p>
            </div>
          )}
        </section>

        {/* CTA band */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 mt-8">
          <div className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-gradient-to-br from-[var(--terracotta)] to-[var(--ochre)] p-8 sm:p-12 md:p-16 text-white">
            <div className="relative z-10 max-w-2xl">
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight">
                Can&rsquo;t find your size?
              </h2>
              <p className="text-sm sm:text-base text-white/80 mb-6 font-[family-name:var(--font-body)]">
                Most of our pieces can be custom-tailored. Message us on Instagram or
                WhatsApp and our team will build something that fits you perfectly.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.instagram.com/tesmaraneh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-[var(--charcoal)] px-6 py-3 rounded-full text-sm font-[family-name:var(--font-body)] font-semibold hover:bg-[var(--charcoal)] hover:text-white transition-colors duration-300"
                >
                  Message on Instagram
                </a>
                <a
                  href="tel:+23277413684"
                  className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white px-6 py-3 rounded-full text-sm font-[family-name:var(--font-body)] font-semibold hover:bg-white/20 transition-colors duration-300"
                >
                  Call +232 77 413 684
                </a>
              </div>
            </div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
          </div>
        </section>
      </main>

      {/* Floating cart button (mobile) */}
      {totalItems > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="cursor-pointer sm:hidden fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[var(--terracotta)] text-white shadow-2xl flex items-center justify-center"
          aria-label="Open cart"
        >
          <ShoppingBag size={20} />
          <span className="absolute -top-1 -right-1 bg-[var(--charcoal)] text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">
            {totalItems}
          </span>
        </button>
      )}

      <CartDrawer />
    </>
  );
}
