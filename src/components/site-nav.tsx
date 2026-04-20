"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "@/context/cart-context";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <div className="w-6 h-5 flex flex-col justify-between">
      <span
        className={`block h-0.5 w-full bg-current transition-all duration-300 origin-center ${
          open ? "rotate-45 translate-y-[9px]" : ""
        }`}
      />
      <span
        className={`block h-0.5 w-full bg-current transition-all duration-300 ${
          open ? "opacity-0 scale-0" : ""
        }`}
      />
      <span
        className={`block h-0.5 w-full bg-current transition-all duration-300 origin-center ${
          open ? "-rotate-45 -translate-y-[9px]" : ""
        }`}
      />
    </div>
  );
}

/** Site-wide navbar used by /marketplace and product pages. Pinned cream theme
 *  (unlike the homepage nav which transitions over the dark hero). */
export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "Values", href: "/#values" },
    { label: "Impact", href: "/#impact" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[var(--cream)]/90 border-b border-[var(--cream-dark)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between h-14 sm:h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo-nobg.png"
              alt="Tesmaraneh"
              width={40}
              height={40}
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
              priority
            />
            <span className="font-[family-name:var(--font-logo)] text-lg sm:text-xl md:text-2xl tracking-tight text-[var(--charcoal)]">
              Tesmaraneh
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-[family-name:var(--font-body)] font-medium tracking-widest uppercase text-[var(--warm-gray)]">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-[var(--terracotta)] transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="cursor-pointer relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-[var(--cream-dark)] text-[var(--charcoal)] hover:bg-[var(--warm-gray-light)] transition-colors duration-300"
              aria-label="Open cart"
            >
              <ShoppingBag size={16} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--terracotta)] text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold font-[family-name:var(--font-body)]">
                  {totalItems}
                </span>
              )}
            </button>

            <Link
              href="/marketplace"
              className="cursor-pointer hidden sm:inline-flex items-center gap-2 bg-[var(--terracotta)] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-[family-name:var(--font-body)] font-semibold tracking-wide hover:bg-[var(--terracotta-dark)] transition-colors duration-300"
            >
              <Sparkles size={14} />
              Shop Now
            </Link>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="cursor-pointer md:hidden w-9 h-9 rounded-full flex items-center justify-center text-[var(--charcoal)]"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <MenuIcon open={mobileOpen} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 top-14 z-40 bg-[var(--cream)] md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-6 pb-20">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--charcoal)] hover:text-[var(--terracotta)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  href="/marketplace"
                  onClick={() => setMobileOpen(false)}
                  className="mt-4 inline-flex items-center gap-2 bg-[var(--terracotta)] text-white px-8 py-3.5 rounded-full text-base font-[family-name:var(--font-body)] font-semibold tracking-wide"
                >
                  <Sparkles size={16} />
                  Shop Now
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
