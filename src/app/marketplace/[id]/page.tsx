"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Check,
  ArrowLeft,
  Leaf,
  Shirt,
  ShieldCheck,
} from "lucide-react";
import {
  getProductById,
  products,
  formatPrice,
  formatPriceUSD,
  COLLECTION_LABELS,
} from "@/lib/products";
import { useCart } from "@/context/cart-context";
import { SiteNav } from "@/components/site-nav";
import { CartDrawer } from "@/components/cart-drawer";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const product = getProductById(id);
  const { addToCart, setIsCartOpen } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  if (!product) return notFound();

  const collectionLabel = COLLECTION_LABELS[product.collection];

  const handleAdd = () => {
    if (!product.inStock) return;
    for (let i = 0; i < qty; i++) {
      addToCart(product, {
        size: size || product.sizes[0],
        color: color || product.colors[0],
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const handleBuyNow = () => {
    if (!product.inStock) return;
    handleAdd();
    setTimeout(() => setIsCartOpen(true), 200);
  };

  // Surface SS26 (in-stock) pieces in "you may also love" — never push
  // sold-out archive items as recommendations.
  const related = products
    .filter(
      (p) => p.id !== product.id && p.inStock
    )
    .slice(0, 4);

  return (
    <>
      <SiteNav />

      <main className="bg-[var(--cream)] min-h-screen pt-20 sm:pt-24 pb-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12">
          {/* Breadcrumb */}
          <div className="py-4 sm:py-6 flex items-center gap-2 text-xs sm:text-sm font-[family-name:var(--font-body)] text-[var(--warm-gray)]">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1.5 hover:text-[var(--terracotta)] transition-colors"
            >
              <ArrowLeft size={14} />
              Marketplace
            </Link>
            <span>/</span>
            <span>{collectionLabel}</span>
            <span>/</span>
            <span className="text-[var(--charcoal)] font-semibold truncate">
              {product.name}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-10 lg:gap-16">
            {/* Gallery */}
            <div className="space-y-3 sm:space-y-4">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative aspect-[4/5] rounded-[20px] sm:rounded-[32px] overflow-hidden bg-[var(--cream-dark)] shadow-lg"
              >
                <Image
                  src={product.images[selectedImage] || product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </motion.div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all ${
                        selectedImage === i
                          ? "border-[var(--terracotta)]"
                          : "border-transparent hover:border-[var(--warm-gray-light)]"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-5 sm:space-y-6 md:sticky md:top-24 md:self-start">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="inline-block font-[family-name:var(--font-body)] text-xs tracking-[0.3em] uppercase text-[var(--terracotta)] font-bold">
                    {collectionLabel} · {product.category}
                  </span>
                  {product.inStock ? (
                    <span className="inline-flex items-center bg-emerald-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase">
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center bg-stone-700 text-white px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase">
                      Sold Out
                    </span>
                  )}
                </div>
                <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[var(--charcoal)] leading-[1.05] mb-4">
                  {product.name}
                </h1>
                <p className="font-[family-name:var(--font-accent)] text-xl sm:text-2xl italic text-[var(--warm-gray)]">
                  {product.fabric}
                </p>
              </div>

              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span
                  className={`font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-black ${
                    product.inStock
                      ? "text-[var(--terracotta)]"
                      : "text-stone-400 line-through"
                  }`}
                >
                  {formatPrice(product.priceUSD)}
                </span>
                <span
                  className={`font-[family-name:var(--font-body)] text-base sm:text-lg font-semibold ${
                    product.inStock
                      ? "text-[var(--warm-gray)]"
                      : "text-stone-400 line-through"
                  }`}
                >
                  {formatPriceUSD(product.priceUSD)}
                </span>
                <span className="font-[family-name:var(--font-body)] text-xs text-[var(--warm-gray-light)]">
                  Le 24 = $1
                </span>
              </div>

              <p className="font-[family-name:var(--font-body)] text-sm sm:text-base text-[var(--warm-gray)] leading-relaxed">
                {product.description}
              </p>

              {!product.inStock && (
                <div className="bg-[var(--terracotta)]/10 border border-[var(--terracotta)]/30 rounded-2xl px-4 sm:px-5 py-4">
                  <p className="font-[family-name:var(--font-body)] text-sm text-[var(--charcoal)] leading-relaxed">
                    <span className="font-semibold text-[var(--terracotta-dark)]">
                      This piece is from our archive.
                    </span>{" "}
                    Some pieces can be remade to order. Reach out on{" "}
                    <a
                      href="https://wa.me/23277413684"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[var(--terracotta-dark)] underline underline-offset-2"
                    >
                      WhatsApp
                    </a>{" "}
                    or{" "}
                    <a
                      href="mailto:tesmaranehgroup@gmail.com"
                      className="font-semibold text-[var(--terracotta-dark)] underline underline-offset-2"
                    >
                      email
                    </a>{" "}
                    and we&rsquo;ll let you know what&rsquo;s possible.
                  </p>
                </div>
              )}

              {/* Color selector */}
              {product.colors.length > 0 && (
                <div>
                  <p className="font-[family-name:var(--font-body)] text-xs tracking-widest uppercase text-[var(--charcoal)] font-semibold mb-2">
                    Colour{product.colors.length > 1 ? " options" : ""}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-[family-name:var(--font-body)] border transition-all ${
                          color === c
                            ? "bg-[var(--charcoal)] text-white border-[var(--charcoal)]"
                            : "bg-white text-[var(--charcoal)] border-[var(--cream-dark)] hover:border-[var(--terracotta)]"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              {product.sizes.length > 0 && (
                <div>
                  <p className="font-[family-name:var(--font-body)] text-xs tracking-widest uppercase text-[var(--charcoal)] font-semibold mb-2">
                    Size
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`cursor-pointer px-3 py-2 rounded-xl text-sm font-[family-name:var(--font-body)] font-semibold border transition-all min-w-[56px] ${
                          size === s
                            ? "bg-[var(--terracotta)] text-white border-[var(--terracotta)]"
                            : "bg-white text-[var(--charcoal)] border-[var(--cream-dark)] hover:border-[var(--terracotta)]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <p className="font-[family-name:var(--font-body)] text-xs tracking-widest uppercase text-[var(--charcoal)] font-semibold mb-2">
                  Quantity
                </p>
                <div className="inline-flex items-center border border-[var(--cream-dark)] rounded-full bg-white">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="cursor-pointer w-10 h-10 flex items-center justify-center text-[var(--charcoal)] hover:bg-[var(--cream)] rounded-l-full"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-[family-name:var(--font-body)] font-semibold">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="cursor-pointer w-10 h-10 flex items-center justify-center text-[var(--charcoal)] hover:bg-[var(--cream)] rounded-r-full"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTAs */}
              {product.inStock ? (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleAdd}
                    className={`cursor-pointer flex-1 inline-flex items-center justify-center gap-2 py-4 rounded-full text-sm sm:text-base font-[family-name:var(--font-body)] font-semibold tracking-wide transition-all duration-300 ${
                      added
                        ? "bg-[var(--forest)] text-white"
                        : "bg-[var(--charcoal)] text-white hover:bg-[var(--charcoal-soft)]"
                    }`}
                  >
                    {added ? (
                      <>
                        <Check size={16} /> Added to cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={16} /> Add to Cart
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2 bg-[var(--terracotta)] text-white py-4 rounded-full text-sm sm:text-base font-[family-name:var(--font-body)] font-semibold tracking-wide hover:bg-[var(--terracotta-dark)] transition-all duration-300 shadow-lg"
                  >
                    Buy Now
                  </button>
                </div>
              ) : (
                <div className="pt-2 space-y-3">
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4">
                    <p className="font-[family-name:var(--font-body)] text-sm font-semibold text-stone-800">
                      This piece is sold out
                    </p>
                    <p className="font-[family-name:var(--font-body)] text-xs text-stone-600 mt-1 leading-relaxed">
                      It&rsquo;s part of our archive. Browse the SS26 Summer
                      Collection for pieces in stock now — or message us on
                      Instagram about a custom remake.
                    </p>
                  </div>
                  <Link
                    href="/marketplace"
                    className="cursor-pointer w-full inline-flex items-center justify-center gap-2 bg-[var(--terracotta)] text-white py-4 rounded-full text-sm sm:text-base font-[family-name:var(--font-body)] font-semibold tracking-wide hover:bg-[var(--terracotta-dark)] transition-all duration-300 shadow-lg"
                  >
                    Shop SS26 Collection →
                  </Link>
                </div>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--cream-dark)]">
                <TrustBadge
                  icon={<Shirt size={16} />}
                  title="Hand-made"
                  subtitle="In Sierra Leone"
                />
                <TrustBadge
                  icon={<Leaf size={16} />}
                  title="Sustainable"
                  subtitle="Natural dyes"
                />
                <TrustBadge
                  icon={<ShieldCheck size={16} />}
                  title="Secure"
                  subtitle="Checkout"
                />
              </div>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-16 sm:mt-24">
              <div className="flex items-end justify-between mb-6 sm:mb-10">
                <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-black text-[var(--charcoal)]">
                  You may also love
                </h2>
                <Link
                  href="/marketplace"
                  className="font-[family-name:var(--font-body)] text-xs sm:text-sm text-[var(--terracotta)] hover:underline"
                >
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    href={`/marketplace/${p.id}`}
                    className="group block"
                  >
                    <div className="relative aspect-[4/5] rounded-[16px] sm:rounded-[20px] overflow-hidden bg-[var(--cream-dark)]">
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                    <div className="mt-3">
                      <p className="font-[family-name:var(--font-display)] text-sm sm:text-base font-bold text-[var(--charcoal)] group-hover:text-[var(--terracotta)] transition-colors">
                        {p.name}
                      </p>
                      <p className="font-[family-name:var(--font-body)] text-xs sm:text-sm text-[var(--terracotta)] font-semibold">
                        {formatPrice(p.priceUSD)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <CartDrawer />
    </>
  );
}

function TrustBadge({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[var(--charcoal)]">
      <div className="w-8 h-8 rounded-full bg-[var(--cream-dark)] flex items-center justify-center text-[var(--terracotta)] shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-[family-name:var(--font-body)] text-xs font-bold leading-tight truncate">
          {title}
        </p>
        <p className="font-[family-name:var(--font-body)] text-[10px] text-[var(--warm-gray)] leading-tight truncate">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
