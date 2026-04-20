"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowLeft, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/products";
import Image from "next/image";
import { useState } from "react";

/*
 * CHECKOUT_URL — replace this once the client provides the Flot checkout link.
 * The customer details (name, phone, address) and cart contents are appended
 * as URL query params so the checkout page can pre-fill them.
 */
const CHECKOUT_URL = "https://pay.flotme.ai/pay";

type CheckoutForm = {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
};

const emptyForm: CheckoutForm = {
  name: "",
  phone: "",
  address: "",
  city: "",
  notes: "",
};

export function CartDrawer() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPriceUSD,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [step, setStep] = useState<"cart" | "details">("cart");
  const [form, setForm] = useState<CheckoutForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});

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

  const handleProceed = () => {
    if (!validate()) return;

    const summary = items
      .map(
        (i) =>
          `${i.product.name}${i.size ? ` (${i.size})` : ""}${
            i.color ? ` [${i.color}]` : ""
          } x${i.quantity}`
      )
      .join("; ");

    const params = new URLSearchParams({
      customer: form.name,
      phone: form.phone,
      address: `${form.address}, ${form.city}`,
      notes: form.notes,
      items: summary,
      total: totalPriceUSD.toString(),
      currency: "USD",
    });

    const url = `${CHECKOUT_URL}?${params.toString()}`;

    const width = 500;
    const height = 720;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(
      url,
      "TesmaranehCheckout",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  };

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
                              {formatPrice(item.product.priceUSD)}
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
                              {formatPrice(item.product.priceUSD * item.quantity)}
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
                      <span className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--charcoal)]">
                        {formatPrice(totalPriceUSD)}
                      </span>
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
                  <p className="font-[family-name:var(--font-body)] text-sm text-[var(--warm-gray)] mb-4">
                    Enter your delivery details. We&rsquo;ll confirm your order by phone
                    once payment is received.
                  </p>

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

                  <FormField
                    label="Order Notes (optional)"
                    name="notes"
                    value={form.notes}
                    onChange={(v) => setForm({ ...form, notes: v })}
                    placeholder="Delivery instructions, sizing preferences…"
                    textarea
                  />

                  <div className="bg-[var(--cream)] rounded-2xl p-4 space-y-2 border border-[var(--cream-dark)]">
                    <p className="font-[family-name:var(--font-body)] text-xs tracking-widest uppercase text-[var(--warm-gray)]">
                      Order Summary
                    </p>
                    {items.map((i) => (
                      <div
                        key={i.product.id}
                        className="flex justify-between text-sm font-[family-name:var(--font-body)]"
                      >
                        <span className="text-[var(--charcoal)]">
                          {i.product.name} × {i.quantity}
                        </span>
                        <span className="text-[var(--warm-gray)]">
                          {formatPrice(i.product.priceUSD * i.quantity)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-[var(--cream-dark)] pt-2 mt-2">
                      <span className="font-[family-name:var(--font-body)] font-semibold text-[var(--charcoal)]">
                        Total
                      </span>
                      <span className="font-[family-name:var(--font-display)] font-bold text-[var(--terracotta)]">
                        {formatPrice(totalPriceUSD)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-[var(--warm-gray)] font-[family-name:var(--font-body)]">
                    <ShieldCheck size={14} className="shrink-0 mt-0.5 text-[var(--forest)]" />
                    <span>
                      Your payment is processed securely. You&rsquo;ll receive a
                      confirmation once the transaction is complete.
                    </span>
                  </div>
                </div>

                <div className="shrink-0 border-t border-[var(--cream-dark)] bg-[var(--cream)] px-5 sm:px-6 py-4">
                  <button
                    onClick={handleProceed}
                    className="cursor-pointer w-full flex items-center justify-center gap-2 bg-[var(--terracotta)] text-white py-4 rounded-full text-base font-[family-name:var(--font-body)] font-semibold tracking-wide hover:bg-[var(--terracotta-dark)] transition-colors duration-300 shadow-lg"
                  >
                    Pay {formatPrice(totalPriceUSD)}
                  </button>
                </div>
              </>
            )}
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
