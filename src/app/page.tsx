"use client";

import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { SpiralAnimation } from "@/components/ui/spiral-animation";
import { CollectionModal } from "@/components/collection-modal";
import { CartDrawer } from "@/components/cart-drawer";
import { useCart } from "@/context/cart-context";
import {
  ArrowRight,
  Leaf,
  ShoppingBag,
  Heart,
  Globe,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  ChevronDown,
  Award,
  Users,
  Scissors,
} from "lucide-react";

/* Inline social icons (not available in lucide-react) */
function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.321 5.562a5.124 5.124 0 0 1-3.414-1.267 5.124 5.124 0 0 1-1.537-2.969V1h-3.363v12.528a3.065 3.065 0 0 1-5.506 1.884 3.065 3.065 0 0 1 3.065-4.949v-3.4A6.465 6.465 0 0 0 3.3 13.53a6.465 6.465 0 0 0 11.08 4.567 6.465 6.465 0 0 0 1.886-4.567V8.687a8.466 8.466 0 0 0 4.945 1.578V6.9a5.124 5.124 0 0 1-1.89-1.338Z"/>
    </svg>
  );
}

/* ─── Reusable animated section wrapper ─── */
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Wavy Divider SVG ─── */
function WavyDivider({
  fillTop = "#FAF6F1",
  fillBottom = "#C4633A",
  flip = false,
}: {
  fillTop?: string;
  fillBottom?: string;
  flip?: boolean;
}) {
  return (
    <div
      className="wavy-divider"
      style={{ transform: flip ? "rotate(180deg)" : undefined }}
    >
      <svg
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,40 C150,80 350,0 600,40 C850,80 1050,0 1200,40 L1200,80 L0,80 Z"
          fill={fillBottom}
        />
        <path
          d="M0,50 C150,80 350,10 600,50 C850,80 1050,10 1200,50 L1200,0 L0,0 Z"
          fill={fillTop}
        />
      </svg>
    </div>
  );
}

/* ─── Floating Badge ─── */
function FloatingBadge({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`inline-flex items-center gap-2 rounded-full border border-[var(--warm-gray-light)] bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-[family-name:var(--font-body)] tracking-wide ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ─── Mobile menu icon ─── */
function MenuIcon({ open, className = "" }: { open: boolean; className?: string }) {
  return (
    <div className={`w-6 h-5 flex flex-col justify-between ${className}`}>
      <span className={`block h-0.5 w-full bg-current transition-all duration-300 origin-center ${open ? "rotate-45 translate-y-[9px]" : ""}`} />
      <span className={`block h-0.5 w-full bg-current transition-all duration-300 ${open ? "opacity-0 scale-0" : ""}`} />
      <span className={`block h-0.5 w-full bg-current transition-all duration-300 origin-center ${open ? "-rotate-45 -translate-y-[9px]" : ""}`} />
    </div>
  );
}

/* ─── NAVBAR ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Collections", href: "#collections" },
    { label: "Values", href: "#values" },
    { label: "Impact", href: "#impact" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || mobileOpen
            ? "backdrop-blur-md bg-[var(--cream)]/90 border-b border-[var(--cream-dark)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between h-14 sm:h-16 md:h-20">
          <a
            href="#"
            className={`font-[family-name:var(--font-display)] text-lg sm:text-xl md:text-2xl font-bold tracking-tight transition-colors duration-500 ${
              scrolled || mobileOpen ? "text-[var(--charcoal)]" : "text-white"
            }`}
          >
            Tesmaraneh
          </a>

          {/* Desktop nav links */}
          <div
            className={`hidden md:flex items-center gap-8 text-sm font-[family-name:var(--font-body)] font-medium tracking-widest uppercase transition-colors duration-500 ${
              scrolled ? "text-[var(--warm-gray)]" : "text-white/60"
            }`}
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[var(--terracotta)] transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`cursor-pointer relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                scrolled || mobileOpen
                  ? "bg-[var(--cream-dark)] text-[var(--charcoal)] hover:bg-[var(--warm-gray-light)]"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              aria-label="Open cart"
            >
              <ShoppingBag size={16} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--terracotta)] text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold font-[family-name:var(--font-body)]">
                  {totalItems}
                </span>
              )}
            </button>

            <a
              href="https://marketplace.anka.africa/en/shops/tesmaraneh"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer hidden sm:inline-flex items-center gap-2 bg-[var(--terracotta)] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-[family-name:var(--font-body)] font-semibold tracking-wide hover:bg-[var(--terracotta-dark)] transition-colors duration-300"
            >
              <Sparkles size={14} />
              Shop Now
            </a>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className={`cursor-pointer md:hidden w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300 ${
                scrolled || mobileOpen
                  ? "text-[var(--charcoal)]"
                  : "text-white"
              }`}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <MenuIcon open={mobileOpen} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
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
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--charcoal)] hover:text-[var(--terracotta)] transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.a
                href="https://marketplace.anka.africa/en/shops/tesmaraneh"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 inline-flex items-center gap-2 bg-[var(--terracotta)] text-white px-8 py-3.5 rounded-full text-base font-[family-name:var(--font-body)] font-semibold tracking-wide"
              >
                <Sparkles size={16} />
                Shop Now
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── HERO ─── */
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setContentVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden pt-14 sm:pt-16 md:pt-20 bg-black"
    >
      {/* Spiral Animation Background */}
      <div className="absolute inset-0 opacity-60">
        <SpiralAnimation />
      </div>

      <motion.div
        style={{ opacity }}
        className={`relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 w-full transition-all duration-[2000ms] ease-out ${
          contentVisible ? "opacity-100" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center min-h-[85vh] md:min-h-[80vh] py-8 md:py-0">
          {/* Left: Text */}
          <div className="space-y-5 sm:space-y-6 md:space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={contentVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-5 py-2.5 text-sm font-[family-name:var(--font-body)] tracking-widest uppercase text-white/70">
                <Leaf size={14} className="text-[var(--ochre-light)]" />
                Sustainable Fashion
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={contentVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="font-[family-name:var(--font-display)] text-[3.2rem] sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tight text-white"
            >
              WEAR
              <br />
              <span className="hero-text-stroke">THE</span>
              <br />
              <span className="text-[var(--ochre-light)]">CULTURE</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={contentVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-wrap gap-3"
            >
              {["Heritage", "Craftsmanship", "Purpose"].map((word, i) => (
                <span
                  key={word}
                  className="font-[family-name:var(--font-accent)] text-lg sm:text-2xl md:text-3xl italic text-white/50"
                >
                  {word}
                  {i < 2 && (
                    <span className="text-[var(--ochre-light)] mx-3">&bull;</span>
                  )}
                </span>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={contentVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="text-sm sm:text-base md:text-xl text-white/40 leading-relaxed max-w-md font-[family-name:var(--font-body)] font-light"
            >
              A Sierra Leonean clothing brand creating beautiful, timeless
              designs for women — crafted with local, sustainable techniques
              that empower women and artisans across the region.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={contentVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <a
                href="#collections"
                className="cursor-pointer group inline-flex items-center gap-2 sm:gap-3 bg-white text-black px-5 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base font-[family-name:var(--font-body)] font-semibold tracking-wide hover:bg-[var(--ochre-light)] hover:text-white transition-all duration-500"
              >
                Explore Collection
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </a>
              <a
                href="#about"
                className="cursor-pointer inline-flex items-center gap-2 sm:gap-3 border-2 border-white/30 text-white px-5 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base font-[family-name:var(--font-body)] font-semibold tracking-wide hover:bg-white/10 hover:border-white/50 transition-all duration-500"
              >
                Our Story
              </a>
            </motion.div>
          </div>

          {/* Right: Card with spiral visible through */}
          <div className="relative hidden sm:flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={contentVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Card */}
              <div className="relative w-[240px] h-[320px] sm:w-[280px] sm:h-[370px] md:w-[420px] md:h-[560px] rounded-[28px] sm:rounded-[40px] overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/90 p-4 sm:p-6 md:p-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-2 border-white/20 flex items-center justify-center mb-4 md:mb-6">
                    <Scissors size={28} className="text-white/50 sm:hidden" />
                    <Scissors size={36} className="text-white/50 hidden sm:block" />
                  </div>
                  <p className="font-[family-name:var(--font-accent)] text-xl sm:text-2xl md:text-4xl italic text-center leading-tight text-white/80">
                    Handcrafted in
                    <br />
                    Freetown
                  </p>
                  <p className="font-[family-name:var(--font-body)] text-xs sm:text-sm tracking-widest uppercase mt-2 sm:mt-4 text-white/40">
                    Sierra Leone
                  </p>
                </div>

                {/* Decorative pattern overlay */}
                <div className="absolute inset-0 opacity-5">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern
                        id="africanPattern"
                        x="0"
                        y="0"
                        width="60"
                        height="60"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M30 0 L60 30 L30 60 L0 30 Z"
                          fill="none"
                          stroke="white"
                          strokeWidth="1"
                        />
                        <circle
                          cx="30"
                          cy="30"
                          r="8"
                          fill="none"
                          stroke="white"
                          strokeWidth="1"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#africanPattern)" />
                  </svg>
                </div>
              </div>

              {/* Floating badges around the card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={contentVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="absolute right-0 sm:-right-4 md:-right-16 top-8 sm:top-16 bg-white/10 backdrop-blur-md text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-[family-name:var(--font-body)] font-bold tracking-wider uppercase shadow-lg border border-white/10"
              >
                Est. 2018
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={contentVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="absolute left-0 sm:-left-4 md:-left-16 bottom-20 sm:bottom-32 bg-white/10 backdrop-blur-md text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-[family-name:var(--font-body)] font-bold tracking-wider uppercase shadow-lg border border-white/10"
              >
                <span className="flex items-center gap-2">
                  <Heart size={12} className="text-[var(--terracotta-light)] fill-[var(--terracotta-light)]" />
                  Women Led
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={contentVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.6 }}
                className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 bg-[var(--ochre)] text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-[family-name:var(--font-body)] font-bold tracking-wider uppercase shadow-lg"
              >
                <span className="flex items-center gap-2">
                  <Globe size={12} />
                  Made in Africa
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={contentVisible ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hidden sm:flex"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-white/30 font-[family-name:var(--font-body)]">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={20} className="text-white/30" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── MARQUEE STRIP ─── */
function MarqueeStrip() {
  const items = [
    "Gara Tie-Dye",
    "Batik",
    "Woven Cloth",
    "Sustainable",
    "Handcrafted",
    "Sierra Leone",
    "Ethical Fashion",
    "Women Empowerment",
  ];

  return (
    <div className="bg-[var(--charcoal)] py-4 overflow-hidden">
      <div className="animate-marquee flex whitespace-nowrap">
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            className="mx-8 text-sm md:text-base tracking-[0.3em] uppercase font-[family-name:var(--font-body)] font-medium text-white/70"
          >
            {item}
            <span className="text-[var(--ochre)] ml-8">&#x2726;</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── ABOUT SECTION ─── */
function About() {
  return (
    <section id="about" className="py-16 sm:py-24 md:py-36 bg-[var(--cream)] relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-10 sm:gap-16 md:gap-24 items-center">
          {/* Image side */}
          <AnimatedSection>
            <div className="relative">
              <div className="w-full aspect-[3/4] rounded-[32px] bg-gradient-to-br from-[var(--indigo)] to-[var(--indigo-light)] overflow-hidden relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-10">
                  <div className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center mb-6">
                    <Users size={32} className="text-white/60" />
                  </div>
                  <p className="font-[family-name:var(--font-accent)] text-3xl sm:text-4xl md:text-5xl italic text-center leading-tight">
                    Isatu Bundu
                  </p>
                  <p className="font-[family-name:var(--font-body)] text-sm tracking-widest uppercase mt-4 opacity-60">
                    Founder & Designer
                  </p>
                  <div className="mt-6 px-4 py-1.5 rounded-full border border-white/20 text-xs tracking-wider uppercase opacity-60">
                    Winner &middot; Women in Africa 2021
                  </div>
                </div>
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-5">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern
                        id="zigzag"
                        x="0"
                        y="0"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M0 20 L10 0 L20 20 L30 0 L40 20"
                          fill="none"
                          stroke="white"
                          strokeWidth="1.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#zigzag)" />
                  </svg>
                </div>
              </div>

              {/* Decorative offset box */}
              <div className="absolute -bottom-6 -right-6 w-[60%] h-[40%] rounded-[24px] border-2 border-[var(--ochre)]/30 -z-10" />
            </div>
          </AnimatedSection>

          {/* Text side */}
          <div className="space-y-8">
            <AnimatedSection delay={0.1}>
              <span className="font-[family-name:var(--font-body)] text-sm tracking-[0.3em] uppercase text-[var(--terracotta)] font-semibold">
                Our Story
              </span>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] text-[var(--charcoal)]">
                A Stylish Journey Toward a{" "}
                <span className="text-[var(--terracotta)]">Verdant</span>{" "}
                Tomorrow
              </h2>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <p className="text-base sm:text-lg text-[var(--warm-gray)] leading-relaxed font-[family-name:var(--font-body)] font-light">
                Tesmaraneh is a local Sierra Leonean clothing brand founded by
                Isatu Bundu in Freetown — unofficially in 2016 and officially
                launched in 2018. We use local and sustainable techniques to
                create beautiful, timeless designs for women, working with
                handmade fabrics including Gara tie-dye, batik, and hand-woven
                country cloth.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <p className="text-base sm:text-lg text-[var(--warm-gray)] leading-relaxed font-[family-name:var(--font-body)] font-light">
                Our mission is to showcase Sierra Leonean clothing around the
                region and beyond, while empowering women and local artisans in
                the process. Every piece tells a story of heritage, craft, and
                the women who make it possible.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.5}>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-sm border border-[var(--cream-dark)]">
                  <div className="w-10 h-10 rounded-full bg-[var(--terracotta)]/10 flex items-center justify-center">
                    <Award size={18} className="text-[var(--terracotta)]" />
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-body)] font-bold text-sm text-[var(--charcoal)]">
                      2021 Winner
                    </p>
                    <p className="font-[family-name:var(--font-body)] text-xs text-[var(--warm-gray)]">
                      Women in Africa
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-sm border border-[var(--cream-dark)]">
                  <div className="w-10 h-10 rounded-full bg-[var(--indigo)]/10 flex items-center justify-center">
                    <Sparkles size={18} className="text-[var(--indigo)]" />
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-body)] font-bold text-sm text-[var(--charcoal)]">
                      TEF Alumni 2019
                    </p>
                    <p className="font-[family-name:var(--font-body)] text-xs text-[var(--warm-gray)]">
                      Tony Elumelu Foundation
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── COLLECTIONS SECTION ─── */
function Collections({
  onCollectionClick,
}: {
  onCollectionClick: (collection: "gara" | "batik" | "woven") => void;
}) {
  const collections: {
    name: string;
    description: string;
    color: string;
    key: "gara" | "batik" | "woven";
  }[] = [
    {
      name: "Gara Tie-Dye",
      key: "gara",
      description:
        "Ancient dyeing techniques creating unique, flowing patterns on every piece",
      color: "from-[var(--terracotta)] to-[var(--ochre)]",
    },
    {
      name: "Batik Collection",
      key: "batik",
      description:
        "Wax-resist dyed fabrics transformed into contemporary silhouettes",
      color: "from-[var(--indigo)] to-[var(--indigo-light)]",
    },
    {
      name: "Woven Cloth",
      key: "woven",
      description:
        "Traditional country cloth hand-woven into modern statement pieces",
      color: "from-[var(--forest)] to-[var(--forest-light)]",
    },
  ];

  return (
    <section
      id="collections"
      className="bg-[var(--charcoal)] py-16 sm:py-24 md:py-36 relative grain-overlay"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 sm:gap-6 mb-10 sm:mb-16">
          <AnimatedSection>
            <span className="font-[family-name:var(--font-body)] text-sm tracking-[0.3em] uppercase text-[var(--ochre)] font-semibold block mb-4">
              What We Create
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95]">
              OUR
              <br />
              COLLECTIONS
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <p className="text-lg text-white/50 max-w-md font-[family-name:var(--font-body)] font-light leading-relaxed">
              Each collection celebrates a unique West African textile tradition,
              reimagined for the modern world.
            </p>
          </AnimatedSection>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {collections.map((item, i) => (
            <AnimatedSection key={item.name} delay={i * 0.15}>
              <div
                className="group cursor-pointer"
                onClick={() => onCollectionClick(item.key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onCollectionClick(item.key);
                }}
              >
                <div
                  className={`aspect-[4/3] sm:aspect-[3/4] rounded-[20px] sm:rounded-[28px] bg-gradient-to-br ${item.color} overflow-hidden relative shadow-lg group-hover:shadow-2xl transition-shadow duration-500`}
                >
                  {/* Pattern overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <svg
                      width="100%"
                      height="100%"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <pattern
                          id={`pat-${i}`}
                          x="0"
                          y="0"
                          width="50"
                          height="50"
                          patternUnits="userSpaceOnUse"
                        >
                          {i === 0 && (
                            <circle
                              cx="25"
                              cy="25"
                              r="20"
                              fill="none"
                              stroke="white"
                              strokeWidth="1"
                            />
                          )}
                          {i === 1 && (
                            <rect
                              x="5"
                              y="5"
                              width="40"
                              height="40"
                              fill="none"
                              stroke="white"
                              strokeWidth="1"
                              transform="rotate(45 25 25)"
                            />
                          )}
                          {i === 2 && (
                            <path
                              d="M0 25 L25 0 L50 25 L25 50 Z"
                              fill="none"
                              stroke="white"
                              strokeWidth="1"
                            />
                          )}
                        </pattern>
                      </defs>
                      <rect
                        width="100%"
                        height="100%"
                        fill={`url(#pat-${i})`}
                      />
                    </svg>
                  </div>

                  <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
                    <div className="transform group-hover:-translate-y-2 transition-transform duration-500">
                      <p className="font-[family-name:var(--font-body)] text-[10px] sm:text-xs tracking-[0.3em] uppercase text-white/50 mb-1 sm:mb-2">
                        Collection {String(i + 1).padStart(2, "0")}
                      </p>
                      <h3 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-3">
                        {item.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/70 font-[family-name:var(--font-body)] font-light leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Hover arrow */}
                  <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:bg-white/20">
                    <ArrowRight size={16} className="text-white" />
                  </div>
                </div>

                {/* Bottom label */}
                <div className="flex items-center justify-between mt-4 px-2">
                  <span className="font-[family-name:var(--font-body)] text-sm font-semibold text-white/80 tracking-wide uppercase">
                    {item.name}
                  </span>
                  <span className="font-[family-name:var(--font-body)] text-xs text-white/40 tracking-wider uppercase">
                    View More
                  </span>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Products row */}
        <AnimatedSection delay={0.3}>
          <div className="mt-8 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              "Women's Clothing",
              "Bags & Accessories",
              "Custom Designs",
              "#RedoCollection",
            ].map((product) => (
              <div
                key={product}
                className="cursor-pointer group bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:bg-white/10 transition-all duration-500"
              >
                <p className="font-[family-name:var(--font-body)] text-sm font-medium text-white/70 tracking-wide group-hover:text-white transition-colors duration-300">
                  {product}
                </p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

/* ─── VALUES SECTION ─── */
function Values() {
  const values = [
    {
      icon: <Leaf size={28} />,
      title: "Sustainability",
      description:
        "Eco-friendly, locally sourced production methods that honour the earth",
      bg: "var(--forest)",
    },
    {
      icon: <Heart size={28} />,
      title: "Authenticity",
      description:
        "Rooted in centuries-old West African textile traditions and craftsmanship",
      bg: "var(--terracotta)",
    },
    {
      icon: <Users size={28} />,
      title: "Empowerment",
      description:
        "Skills training for women, supporting tailors, and promoting education",
      bg: "var(--indigo)",
    },
    {
      icon: <Globe size={28} />,
      title: "Global Vision",
      description:
        "Taking African fashion to international markets while building local industry",
      bg: "var(--ochre)",
    },
  ];

  return (
    <section id="values" className="py-16 sm:py-24 md:py-36 bg-[var(--cream)] relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12">
        <div className="text-center mb-10 sm:mb-16 md:mb-24">
          <AnimatedSection>
            <span className="font-[family-name:var(--font-body)] text-sm tracking-[0.3em] uppercase text-[var(--terracotta)] font-semibold block mb-4">
              What We Stand For
            </span>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[var(--charcoal)] leading-[0.95]">
              DON&rsquo;T JUST WEAR,
              <br />
              <span className="text-[var(--terracotta)]">
                CHANGE THE STORY
              </span>
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="mt-6 text-lg text-[var(--warm-gray)] max-w-2xl mx-auto font-[family-name:var(--font-body)] font-light leading-relaxed">
              Every Tesmaraneh piece is crafted with care and eco-consciousness.
              A stylish journey toward a verdant tomorrow.
            </p>
          </AnimatedSection>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {values.map((value, i) => (
            <AnimatedSection key={value.title} delay={i * 0.1}>
              <div className="group cursor-pointer bg-white rounded-[16px] sm:rounded-[24px] p-5 sm:p-8 shadow-sm border border-[var(--cream-dark)] hover:shadow-xl hover:-translate-y-2 transition-all duration-500 h-full">
                <div
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 text-white transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundColor: value.bg }}
                >
                  {value.icon}
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-lg sm:text-2xl font-bold text-[var(--charcoal)] mb-2 sm:mb-3">
                  {value.title}
                </h3>
                <p className="font-[family-name:var(--font-body)] text-xs sm:text-sm text-[var(--warm-gray)] leading-relaxed font-light">
                  {value.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── IMPACT SECTION ─── */
function Impact() {
  const stats = [
    { number: "2016", label: "Founded", suffix: "" },
    { number: "4", label: "Global Recognitions", suffix: "" },
    { number: "100", label: "Locally Made", suffix: "%" },
    { number: "10", label: "Years of Impact", suffix: "+" },
  ];

  return (
    <section id="impact" className="relative">
      <WavyDivider fillTop="#FAF6F1" fillBottom="#C4633A" />

      <div className="bg-[var(--terracotta)] py-16 sm:py-24 md:py-36 relative grain-overlay">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 sm:gap-16 items-center">
            <div className="space-y-8">
              <AnimatedSection>
                <span className="font-[family-name:var(--font-body)] text-sm tracking-[0.3em] uppercase text-white/60 font-semibold">
                  Our Impact
                </span>
              </AnimatedSection>

              <AnimatedSection delay={0.1}>
                <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95]">
                  MADE WITH
                  <br />
                  PURPOSE
                </h2>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <p className="text-base sm:text-lg text-white/70 leading-relaxed font-[family-name:var(--font-body)] font-light max-w-lg">
                  Every purchase supports women artisans, promotes
                  girls&rsquo; education, and reduces Sierra Leone&rsquo;s
                  dependence on imported textiles. Fashion with meaning, made by
                  hand.
                </p>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <div className="flex flex-wrap gap-3">
                  {[
                    "Skills Training",
                    "Girls' Education",
                    "Local Industry",
                    "Gender Equality",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/10 text-white/80 px-4 py-2 rounded-full text-sm font-[family-name:var(--font-body)] font-medium tracking-wide border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </AnimatedSection>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {stats.map((stat, i) => (
                <AnimatedSection key={stat.label} delay={i * 0.1}>
                  <div className="bg-white/10 backdrop-blur-sm rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 md:p-8 border border-white/10 text-center">
                    <p className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-black text-white">
                      {stat.number}
                      <span className="text-[var(--ochre-light)]">
                        {stat.suffix}
                      </span>
                    </p>
                    <p className="font-[family-name:var(--font-body)] text-sm text-white/50 mt-2 tracking-wider uppercase">
                      {stat.label}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </div>

      <WavyDivider fillTop="#C4633A" fillBottom="#FAF6F1" flip />
    </section>
  );
}

/* ─── RECOGNITION SECTION ─── */
function Recognition() {
  return (
    <section className="py-16 sm:py-24 md:py-36 bg-[var(--cream)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12">
        <div className="text-center mb-10 sm:mb-16">
          <AnimatedSection>
            <span className="font-[family-name:var(--font-body)] text-sm tracking-[0.3em] uppercase text-[var(--terracotta)] font-semibold block mb-4">
              Recognition
            </span>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[var(--charcoal)] leading-[0.95]">
              ON THE WORLD STAGE
            </h2>
          </AnimatedSection>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {[
            {
              year: "2019",
              title: "Tony Elumelu Foundation",
              subtitle: "Alumni",
              description:
                "Selected for the prestigious Tony Elumelu Foundation Entrepreneurship Programme, joining a pan-African community of high-impact entrepreneurs driving economic transformation across the continent.",
              icon: <Sparkles size={20} />,
              color: "terracotta",
            },
            {
              year: "2021",
              title: "Women in Africa",
              subtitle: "Winner / Laureate",
              description:
                "Founder Isatu Bundu was named a Laureate of Women in Africa, recognizing her outstanding contribution to empowering women through sustainable fashion and economic development in Sierra Leone.",
              icon: <Award size={20} />,
              color: "ochre",
            },
            {
              year: "2025",
              title: "ShowcaseHer Africa",
              subtitle: "Impacther Export Readiness",
              description:
                "Completed the Impacther Export Readiness Training (ShowcaseHer Africa), equipping Tesmaraneh with the tools and partnerships to scale African-made fashion to international markets.",
              icon: <Globe size={20} />,
              color: "indigo",
            },
            {
              year: "2026",
              title: "Alibaba eFounders Initiative",
              subtitle: "Innovator Masters Program",
              description:
                "Part of the Alibaba Innovator Masters Program — a global cohort of entrepreneurs learning to harness technology and e-commerce to grow their businesses and create jobs at home.",
              icon: <Users size={20} />,
              color: "forest",
            },
          ].map((item, i) => (
            <AnimatedSection key={item.year} delay={i * 0.1}>
              <div className="group bg-white rounded-[20px] sm:rounded-[28px] p-6 sm:p-8 shadow-sm border border-[var(--cream-dark)] hover:shadow-xl transition-all duration-500 h-full">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `var(--${item.color})15` }}
                  >
                    <span style={{ color: `var(--${item.color})` }}>{item.icon}</span>
                  </div>
                  <div>
                    <span
                      className="font-[family-name:var(--font-body)] text-sm font-bold tracking-wider uppercase block leading-tight"
                      style={{ color: `var(--${item.color})` }}
                    >
                      {item.year}
                    </span>
                    <span className="font-[family-name:var(--font-body)] text-[10px] tracking-widest uppercase text-[var(--warm-gray)] block leading-tight">
                      {item.subtitle}
                    </span>
                  </div>
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[var(--charcoal)] mb-3 sm:mb-4">
                  {item.title}
                </h3>
                <p className="font-[family-name:var(--font-body)] text-sm text-[var(--warm-gray)] leading-relaxed font-light">
                  {item.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── BIG QUOTE / CTA ─── */
function BigQuote() {
  return (
    <section className="py-16 sm:py-24 md:py-40 bg-[var(--cream-dark)] relative grain-overlay overflow-hidden">
      {/* Large decorative text */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
        <span className="font-[family-name:var(--font-display)] text-[20vw] font-black text-[var(--charcoal)] whitespace-nowrap">
          TESMARANEH
        </span>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 md:px-12 text-center relative z-10">
        <AnimatedSection>
          <blockquote className="font-[family-name:var(--font-accent)] text-2xl sm:text-4xl md:text-5xl lg:text-6xl italic text-[var(--charcoal)] leading-[1.2] mb-6 sm:mb-8">
            &ldquo;Timeless designs. Local fabrics. Global vision.&rdquo;
          </blockquote>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <p className="font-[family-name:var(--font-body)] text-lg text-[var(--warm-gray)] mb-10 font-light">
            Made in Sierra Leone. Made with purpose.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <a
            href="https://marketplace.anka.africa/en/shops/tesmaraneh"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer group inline-flex items-center gap-2 sm:gap-3 bg-[var(--terracotta)] text-white px-6 sm:px-10 py-3.5 sm:py-5 rounded-full text-base sm:text-lg font-[family-name:var(--font-body)] font-semibold tracking-wide hover:bg-[var(--terracotta-dark)] transition-all duration-500 shadow-lg hover:shadow-2xl"
          >
            Shop on ANKA Marketplace
            <ExternalLink
              size={18}
              className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
            />
          </a>
        </AnimatedSection>
      </div>
    </section>
  );
}

/* ─── CONTACT / FOOTER ─── */
function Footer() {
  return (
    <footer
      id="contact"
      className="bg-[var(--charcoal)] text-white pt-16 sm:pt-24 pb-8 relative grain-overlay"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 sm:gap-12 md:gap-16 mb-12 sm:mb-20">
          {/* Brand */}
          <AnimatedSection>
            <div className="space-y-6">
              <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold">
                Tesmaraneh
              </h3>
              <p className="font-[family-name:var(--font-body)] text-white/50 leading-relaxed font-light">
                A Sierra Leonean clothing brand creating beautiful, timeless
                designs for women — using local, sustainable techniques that
                empower women and artisans across the region.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.instagram.com/tesmaraneh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--terracotta)] transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={18} />
                </a>
                <a
                  href="https://www.instagram.com/tesmaranehfoundation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--terracotta)] transition-colors duration-300"
                  aria-label="Tesmaraneh Foundation Instagram"
                >
                  <InstagramIcon size={18} />
                </a>
                <a
                  href="https://www.facebook.com/tesmaraneh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--terracotta)] transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <FacebookIcon size={18} />
                </a>
                <a
                  href="https://www.tiktok.com/@tesmaraneh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--terracotta)] transition-colors duration-300"
                  aria-label="TikTok"
                >
                  <TikTokIcon size={18} />
                </a>
              </div>
            </div>
          </AnimatedSection>

          {/* Quick Links */}
          <AnimatedSection delay={0.1}>
            <div className="space-y-6">
              <h4 className="font-[family-name:var(--font-body)] text-sm tracking-[0.3em] uppercase text-white/40 font-semibold">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "About Us", href: "#about" },
                  { label: "Collections", href: "#collections" },
                  { label: "Our Values", href: "#values" },
                  { label: "Impact", href: "#impact" },
                  {
                    label: "Shop on ANKA",
                    href: "https://marketplace.anka.africa/en/shops/tesmaraneh",
                  },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={
                        link.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        link.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="cursor-pointer font-[family-name:var(--font-body)] text-white/60 hover:text-white transition-colors duration-300 text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>

          {/* Contact */}
          <AnimatedSection delay={0.2}>
            <div className="space-y-6">
              <h4 className="font-[family-name:var(--font-body)] text-sm tracking-[0.3em] uppercase text-white/40 font-semibold">
                Get in Touch
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="mailto:tesmaranehgroup@gmail.com"
                    className="cursor-pointer flex items-center gap-3 text-white/60 hover:text-white transition-colors duration-300"
                  >
                    <Mail size={16} />
                    <span className="font-[family-name:var(--font-body)] text-sm">
                      tesmaranehgroup@gmail.com
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+23277413684"
                    className="cursor-pointer flex items-center gap-3 text-white/60 hover:text-white transition-colors duration-300"
                  >
                    <Phone size={16} />
                    <span className="font-[family-name:var(--font-body)] text-sm">
                      +232 77413684
                    </span>
                  </a>
                </li>
                <li>
                  <div className="flex items-center gap-3 text-white/60">
                    <MapPin size={16} />
                    <span className="font-[family-name:var(--font-body)] text-sm">
                      Freetown, Sierra Leone
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </AnimatedSection>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-[family-name:var(--font-body)] text-xs text-white/30">
            &copy; {new Date().getFullYear()} Tesmaraneh. All rights reserved.
          </p>
          <p className="font-[family-name:var(--font-accent)] text-sm italic text-white/20">
            Wear the culture. Change the story.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── MAIN PAGE ─── */
export default function Home() {
  const [activeCollection, setActiveCollection] = useState<
    "gara" | "batik" | "woven" | null
  >(null);

  return (
    <main>
      <Navbar />
      <Hero />
      <MarqueeStrip />
      <About />
      <Collections onCollectionClick={setActiveCollection} />
      <Values />
      <Impact />
      <Recognition />
      <BigQuote />
      <Footer />

      {/* Collection product modal */}
      <CollectionModal
        collection={activeCollection}
        onClose={() => setActiveCollection(null)}
      />

      {/* Cart drawer */}
      <CartDrawer />
    </main>
  );
}
