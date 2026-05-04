"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowLeft, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/cart-context";
import {
  formatPrice,
  formatPriceUSD,
  priceInSll,
  priceInUsd,
  sllToUsd,
} from "@/lib/products";
import Image from "next/image";
import { useState } from "react";

/*
 * Flot merchant checkout for Tesmaraneh. Customer details + cart summary +
 * total amount are appended as URL query params so the checkout page
 * pre-fills automatically. The shopper picks SLE or USD before the redirect
 * — we send Flot the amount + currency for that choice so Flot honours the
 * Le 24 = $1 rate, not its own.
 */
const CHECKOUT_URL = "https://pay.flotme.ai/tesmaraneh";

type PayCurrency = "SLL" | "USD";

type CheckoutForm = {
  name: string;
  phone: string;
  address: string;
  city: string;
};

const emptyForm: CheckoutForm = {
  name: "",
  phone: "",
  address: "",
  city: "",
};

export function CartDrawer() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [step, setStep] = useState<"cart" | "details">("cart");
  const [form, setForm] = useState<CheckoutForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [payCurrency, setPayCurrency] = useState<PayCurrency>("SLL");

  // Cart totals in both currencies. The SLE figure is the cart line-by-line
  // sum (each line rounded to 10 Le), then USD is the converted total at
  // Le 24 = $1. This keeps the per-line and total figures consistent with
  // what the shopper sees on each row.
  const totalSll = items.reduce(
    (s, i) => s + priceInSll(i.product.priceUSD) * i.quantity,
    0
  );
  const totalUsd = sllToUsd(totalSll);

  const validate = () => {
    const e: Partial<Record<keyof CheckoutForm, string>> = {};
    if (!form.name.trim()) e.name = "Please enter your full name";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (form.phone.replace(/\D/g, "").length < 8)
      e.phone = "Please enter a valid phone number";
    if (!form.address.trim()) e.address = "Delivery address is required";
    if (!form.city.trim()) e.city = "City / area is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProceed = async () => {
    if (!validate()) return;
    setSubmitError(null);
    setSubmitting(true);

    try {
      // 1. Persist the order server-side FIRST so we have a record even if
      //    the shopper abandons payment. The server re-prices from the
      //    canonical catalog and issues the reference we hand to Flot.
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name,
            phone: form.phone,
            address: form.address,
            city: form.city,
          },
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            size: i.size ?? null,
            color: i.color ?? null,
          })),
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Unable to create order");
      }

      const { reference, totalSll: serverSll } = (await res.json()) as {
        reference: string;
        totalSll: number;
      };

      // 2. Build the Flot URL. Server issues the canonical SLE total; we
      //    derive USD at our published rate (Le 24 = $1) and hand Flot
      //    whichever currency the shopper picked. We also pass the other
      //    currency's amount so Flot can display the alternate total
      //    without applying its own FX rate.
      const summary = items
        .map(
          (i) =>
            `${i.product.name}${i.size ? ` (${i.size})` : ""}${
              i.color ? ` [${i.color}]` : ""
            } x${i.quantity}`
        )
        .join("; ");

      const usdTotal = sllToUsd(serverSll);
      const isUsd = payCurrency === "USD";
      const primaryAmount = isUsd ? usdTotal.toFixed(2) : serverSll.toString();

      const params = new URLSearchParams({
        amount: primaryAmount,
        total: primaryAmount,
        price: primaryAmount,
        currency: payCurrency,
        // Pass both totals so Flot's currency switcher uses our rate, not
        // its own. Field names follow Flot's documented variants.
        amount_sll: serverSll.toString(),
        amount_usd: usdTotal.toFixed(2),
        merchant: "tesmaraneh",
        reference,
        description: `Tesmaraneh order — ${totalItems} item${
          totalItems === 1 ? "" : "s"
        }`,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_address: `${form.address}, ${form.city}`,
        items: summary,
      });

      setCheckoutUrl(`${CHECKOUT_URL}?${params.toString()}`);
    } catch (err) {
      console.error("[checkout] order creation failed:", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const closeCheckout = () => setCheckoutUrl(null);

  const handleClose = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      setStep("cart");
      setErrors({});
    }, 400);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-white z-[71] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-[var(--cream-dark)]">
              <div className="flex items-center gap-3">
                {step === "details" && (
                  <button
                    onClick={() => setStep("cart")}
                    className="cursor-pointer w-8 h-8 rounded-full hover:bg-[var(--cream)] flex items-center justify-center text-[var(--charcoal)] transition-colors"
                    aria-label="Back to cart"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                <ShoppingBag size={20} className="text-[var(--charcoal)]" />
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--charcoal)]">
                  {step === "cart" ? "Your Cart" : "Delivery Details"}
                </h3>
                {step === "cart" && totalItems > 0 && (
                  <span className="bg-[var(--terracotta)] text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold font-[family-name:var(--font-body)]">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={handleClose}
                className="cursor-pointer w-10 h-10 rounded-full bg-[var(--cream)] flex items-center justify-center text-[var(--charcoal)] hover:bg-[var(--cream-dark)] transition-colors duration-300"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* CART STEP */}
            {step === "cart" && (
              <>
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
                        Explore our marketplace to find something you love
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
                          className="flex gap-4 px-5 sm:px-6 py-5"
                        >
                          <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-[var(--cream-dark)] shrink-0">
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--charcoal)] truncate">
                              {item.product.name}
                            </h4>
                            <p className="font-[family-name:var(--font-body)] text-xs text-[var(--warm-gray)] capitalize mt-0.5">
                              {item.product.category}
                              {item.size ? ` · ${item.size}` : ""}
                              {item.color ? ` · ${item.color}` : ""}
                            </p>
                            <p className="font-[family-name:var(--font-display)] text-sm font-bold text-[var(--terracotta)] mt-1">
                              {formatPrice(item.product.priceUSD)}{" "}
                              <span className="font-[family-name:var(--font-body)] text-[11px] font-medium text-[var(--warm-gray)]">
                                · {formatPriceUSD(item.product.priceUSD)}
                              </span>
                            </p>

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

                          <div className="text-right shrink-0">
                            <p className="font-[family-name:var(--font-body)] text-sm font-bold text-[var(--charcoal)]">
                              Le{" "}
                              {(
                                priceInSll(item.product.priceUSD) *
                                item.quantity
                              ).toLocaleString()}
                            </p>
                            <p className="font-[family-name:var(--font-body)] text-[11px] text-[var(--warm-gray)] mt-0.5">
                              $
                              {(
                                priceInUsd(item.product.priceUSD) *
                                item.quantity
                              ).toFixed(2)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="shrink-0 border-t border-[var(--cream-dark)] bg-[var(--cream)] px-5 sm:px-6 py-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-[family-name:var(--font-body)] text-sm text-[var(--warm-gray)]">
                        Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                      </span>
                      <div className="text-right">
                        <div className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--charcoal)] leading-tight">
                          Le {totalSll.toLocaleString()}
                        </div>
                        <div className="font-[family-name:var(--font-body)] text-xs text-[var(--warm-gray)] mt-0.5">
                          ${totalUsd.toFixed(2)} at Le 24 = $1
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setStep("details")}
                      className="cursor-pointer w-full flex items-center justify-center gap-2 bg-[var(--terracotta)] text-white py-4 rounded-full text-base font-[family-name:var(--font-body)] font-semibold tracking-wide hover:bg-[var(--terracotta-dark)] transition-colors duration-300 shadow-lg"
                    >
                      Proceed to Checkout
                    </button>

                    <button
                      onClick={clearCart}
                      className="cursor-pointer w-full text-center text-xs text-[var(--warm-gray)] hover:text-red-500 transition-colors duration-300 font-[family-name:var(--font-body)]"
                    >
                      Clear cart
                    </button>
                  </div>
                )}
              </>
            )}

            {/* DETAILS STEP */}
            {step === "details" && (
              <>
                <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
                  <p className="font-[family-name:var(--font-body)] text-sm text-[var(--warm-gray)] mb-2">
                    Enter your delivery details. We&rsquo;ll confirm your order by phone
                    once payment is received.
                  </p>

                  <div className="bg-[var(--terracotta)]/8 border border-[var(--terracotta)]/30 rounded-xl px-4 py-3 mb-2">
                    <p className="font-[family-name:var(--font-body)] text-xs text-[var(--charcoal)] leading-relaxed">
                      <span className="font-semibold text-[var(--terracotta-dark)]">
                        Delivery is arranged personally.
                      </span>{" "}
                      After your payment is confirmed, please contact us on{" "}
                      <a
                        href="https://wa.me/23277413684"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[var(--terracotta-dark)] underline underline-offset-2"
                      >
                        +232 77 413 684
                      </a>{" "}
                      or{" "}
                      <a
                        href="mailto:tesmaranehgroup@gmail.com"
                        className="font-semibold text-[var(--terracotta-dark)] underline underline-offset-2"
                      >
                        tesmaranehgroup@gmail.com
                      </a>{" "}
                      so we can coordinate delivery — locally in Sierra Leone
                      or shipped internationally.
                    </p>
                  </div>

                  <FormField
                    label="Full Name *"
                    name="name"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    error={errors.name}
                    placeholder="Jane Doe"
                  />

                  <FormField
                    label="Phone Number *"
                    name="phone"
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    error={errors.phone}
                    placeholder="+232 77 000 0000"
                    type="tel"
                  />

                  <FormField
                    label="Delivery Address *"
                    name="address"
                    value={form.address}
                    onChange={(v) => setForm({ ...form, address: v })}
                    error={errors.address}
                    placeholder="House number, street name"
                    textarea
                  />

                  <FormField
                    label="City / Area *"
                    name="city"
                    value={form.city}
                    onChange={(v) => setForm({ ...form, city: v })}
                    error={errors.city}
                    placeholder="Freetown"
                  />

                  <div>
                    <p className="font-[family-name:var(--font-body)] text-xs tracking-widest uppercase text-[var(--warm-gray)] mb-2">
                      Pay In
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPayCurrency("SLL")}
                        className={`cursor-pointer rounded-xl border px-4 py-3 text-left transition-all ${
                          payCurrency === "SLL"
                            ? "border-[var(--terracotta)] bg-[var(--terracotta)]/5"
                            : "border-[var(--cream-dark)] bg-white hover:border-[var(--warm-gray-light)]"
                        }`}
                      >
                        <span className="block font-[family-name:var(--font-body)] text-[10px] tracking-widest uppercase text-[var(--warm-gray)]">
                          Leones
                        </span>
                        <span className="block font-[family-name:var(--font-display)] text-base font-bold text-[var(--charcoal)]">
                          Le {totalSll.toLocaleString()}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayCurrency("USD")}
                        className={`cursor-pointer rounded-xl border px-4 py-3 text-left transition-all ${
                          payCurrency === "USD"
                            ? "border-[var(--terracotta)] bg-[var(--terracotta)]/5"
                            : "border-[var(--cream-dark)] bg-white hover:border-[var(--warm-gray-light)]"
                        }`}
                      >
                        <span className="block font-[family-name:var(--font-body)] text-[10px] tracking-widest uppercase text-[var(--warm-gray)]">
                          US Dollars
                        </span>
                        <span className="block font-[family-name:var(--font-display)] text-base font-bold text-[var(--charcoal)]">
                          ${totalUsd.toFixed(2)}
                        </span>
                      </button>
                    </div>
                    <p className="mt-2 font-[family-name:var(--font-body)] text-[11px] text-[var(--warm-gray)]">
                      Exchange rate: Le 24 = $1.
                    </p>
                  </div>

                  <div className="bg-[var(--cream)] rounded-2xl p-4 space-y-3 border border-[var(--cream-dark)]">
                    <p className="font-[family-name:var(--font-body)] text-xs tracking-widest uppercase text-[var(--warm-gray)]">
                      Order Summary
                    </p>
                    {items.map((i) => (
                      <div
                        key={i.product.id}
                        className="flex justify-between gap-3 text-sm font-[family-name:var(--font-body)]"
                      >
                        <div className="min-w-0">
                          <p className="text-[var(--charcoal)] font-semibold truncate">
                            {i.product.name} × {i.quantity}
                          </p>
                          {(i.size || i.color) && (
                            <p className="text-xs text-[var(--warm-gray)] mt-0.5">
                              {i.size ? `Size ${i.size}` : ""}
                              {i.size && i.color ? " · " : ""}
                              {i.color ? `Color ${i.color}` : ""}
                            </p>
                          )}
                        </div>
                        <span className="text-[var(--warm-gray)] shrink-0 text-right">
                          {payCurrency === "SLL" ? (
                            <>
                              Le{" "}
                              {(
                                priceInSll(i.product.priceUSD) * i.quantity
                              ).toLocaleString()}
                            </>
                          ) : (
                            <>
                              $
                              {(
                                priceInUsd(i.product.priceUSD) * i.quantity
                              ).toFixed(2)}
                            </>
                          )}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-[var(--cream-dark)] pt-2 mt-2">
                      <span className="font-[family-name:var(--font-body)] font-semibold text-[var(--charcoal)]">
                        Total
                      </span>
                      <span className="font-[family-name:var(--font-display)] font-bold text-[var(--terracotta)]">
                        {payCurrency === "SLL"
                          ? `Le ${totalSll.toLocaleString()}`
                          : `$${totalUsd.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-[var(--warm-gray)] font-[family-name:var(--font-body)]">
                    <ShieldCheck size={14} className="shrink-0 mt-0.5 text-[var(--forest)]" />
                    <span>
                      Your payment is processed securely by{" "}
                      <a
                        href="https://www.flotme.ai/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-[var(--forest)]/40 underline-offset-2 hover:text-[var(--charcoal)] hover:decoration-[var(--forest)] transition-colors"
                      >
                        Flot
                      </a>
                      . You&rsquo;ll receive a confirmation once the
                      transaction is complete.
                    </span>
                  </div>
                </div>

                <div className="shrink-0 border-t border-[var(--cream-dark)] bg-[var(--cream)] px-5 sm:px-6 py-4 space-y-3">
                  {submitError && (
                    <p
                      role="alert"
                      className="text-xs font-[family-name:var(--font-body)] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2"
                    >
                      {submitError}
                    </p>
                  )}
                  <button
                    onClick={handleProceed}
                    disabled={submitting}
                    className="cursor-pointer w-full flex items-center justify-center gap-2 bg-[var(--terracotta)] text-white py-4 rounded-full text-base font-[family-name:var(--font-body)] font-semibold tracking-wide hover:bg-[var(--terracotta-dark)] transition-colors duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? "Creating order…"
                      : payCurrency === "USD"
                      ? `Pay $${totalUsd.toFixed(2)}`
                      : `Pay Le ${totalSll.toLocaleString()}`}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}

      {/* Flot checkout popup — in-page modal card with embedded checkout */}
      {checkoutUrl && (
        <>
          <motion.div
            key="checkout-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCheckout}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[80]"
          />
          <motion.div
            key="checkout-card"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[81] flex items-center justify-center p-0 sm:p-6 pointer-events-none"
          >
            <div className="relative w-full h-full sm:w-[480px] sm:h-[760px] sm:max-h-[92vh] bg-white sm:rounded-[24px] overflow-hidden shadow-2xl pointer-events-auto flex flex-col">
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--cream-dark)] bg-[var(--cream)] shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[var(--forest)]" />
                  <span className="font-[family-name:var(--font-body)] text-sm font-semibold text-[var(--charcoal)]">
                    Secure Checkout ·{" "}
                    {payCurrency === "USD"
                      ? `$${totalUsd.toFixed(2)}`
                      : `Le ${totalSll.toLocaleString()}`}
                  </span>
                </div>
                <button
                  onClick={closeCheckout}
                  className="cursor-pointer w-9 h-9 rounded-full bg-white hover:bg-[var(--cream-dark)] flex items-center justify-center text-[var(--charcoal)] transition-colors"
                  aria-label="Close checkout"
                >
                  <X size={16} />
                </button>
              </div>
              <iframe
                src={checkoutUrl}
                title="Tesmaraneh secure checkout"
                allow="payment *; clipboard-write"
                className="flex-1 w-full border-0 bg-white"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  textarea = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
}) {
  const base =
    "w-full px-4 py-3 rounded-xl border font-[family-name:var(--font-body)] text-sm text-[var(--charcoal)] placeholder:text-[var(--warm-gray-light)] focus:outline-none focus:ring-2 focus:ring-[var(--terracotta)]/40 transition-all";
  const border = error
    ? "border-red-400"
    : "border-[var(--cream-dark)] focus:border-[var(--terracotta)]";

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs font-[family-name:var(--font-body)] tracking-wider uppercase text-[var(--warm-gray)] mb-1.5"
      >
        {label}
      </label>
      {textarea ? (
        <textarea
          id={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className={`${base} ${border} resize-none`}
        />
      ) : (
        <input
          id={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${base} ${border}`}
        />
      )}
      {error && (
        <p className="mt-1 text-xs text-red-500 font-[family-name:var(--font-body)]">
          {error}
        </p>
      )}
    </div>
  );
}
