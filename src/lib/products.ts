export type Collection = "ss26" | "gara" | "batik" | "woven";

export interface Product {
  id: string;
  name: string;
  priceUSD: number; // client pricing
  collection: Collection;
  category: string;
  fabric: string;
  description: string;
  colors: string[];
  sizes: string[];
  images: string[]; // paths under /public
  /** When false the product is shown for browsing only — the cart and
   *  checkout reject it server-side. */
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

/* ─── Pricing model ───
 *
 *  The catalog stores `priceUSD` as a price-point integer (legacy field
 *  name; not literally a USD price any more). Display layers convert:
 *
 *     SLE = round(priceUSD × 22 / 10) × 10           ← anchored local price
 *     USD = round(SLE / 24 × 10) / 10                ← FX equivalent at our rate
 *
 *  Customers see both. The SLE figure is the primary local price; the USD
 *  figure is what the same Leones are worth at our published rate of
 *  Le 24 = $1, rounded to the nearest 10¢.
 *
 *  Why 22 for SLE but 24 for USD: SLE values are anchored from the
 *  founder's pricing memory (e.g. "Le 1,430 for the Aisha dress"). The
 *  catalog field that produces those rounded SLE figures was set against
 *  the older Le 22 / $1 rate. Today's published rate is Le 24 / $1, so
 *  the SLE → USD direction uses 24. We don't re-anchor SLE values to
 *  avoid moving every price tag.
 */

/** Sierra Leonean Leones per USD — the rate published to customers. */
export const SLE_PER_USD = 24;

/** Numeric SLE price for a product, rounded to the nearest 10 Le. */
export function priceInSll(priceUSD: number): number {
  return Math.round((priceUSD * 22) / 10) * 10;
}

/** Numeric USD price for a product at the published FX rate, rounded to
 *  the nearest 10¢ for clean display. */
export function priceInUsd(priceUSD: number): number {
  return Math.round((priceInSll(priceUSD) / SLE_PER_USD) * 10) / 10;
}

/** "Le 1,430" */
export function formatPrice(priceUSD: number): string {
  return `Le ${priceInSll(priceUSD).toLocaleString()}`;
}

/** "$59.60" */
export function formatPriceUSD(priceUSD: number): string {
  return `$${priceInUsd(priceUSD).toFixed(2)}`;
}

/** "Le 1,430 · $59.60" */
export function formatPriceBoth(priceUSD: number): string {
  return `${formatPrice(priceUSD)} · ${formatPriceUSD(priceUSD)}`;
}

/** Convert a raw SLE total (already summed across the cart) into USD at
 *  the published rate, rounded to 10¢. Used for cart totals + Flot URL. */
export function sllToUsd(sll: number): number {
  return Math.round((sll / SLE_PER_USD) * 10) / 10;
}

// Helper to build image paths
const img = (slug: string, n: number) => `/products/${slug}/${n}.jpg`;
const imgs = (slug: string, count: number) =>
  Array.from({ length: count }, (_, i) => img(slug, i + 1));

// Default sizes used across most fitted SS26 pieces. Override per product
// when the piece is free-size or has a different range.
const FITTED_SIZES = ["UK8", "UK10", "UK12", "UK14", "UK16"];
const FREE_SIZE = ["Free Size (UK8–UK16)"];

export const products: Product[] = [
  // ─── SS26 SUMMER COLLECTION (in stock, prioritized) ───
  {
    id: "ss26-aisha",
    name: "Aisha Dress",
    priceUSD: 65,
    collection: "ss26",
    category: "Dress",
    fabric: "Hand-batik cotton",
    description:
      "A breezy summer dress hand-batiked and tailored in Sierra Leone. Light, flowing, and made for the season.",
    colors: ["Mix colors"],
    sizes: FITTED_SIZES,
    images: imgs("ss26-aisha", 7),
    inStock: true,
  },
  {
    id: "ss26-amy",
    name: "Amy Dress",
    priceUSD: 65,
    collection: "ss26",
    category: "Dress",
    fabric: "Hand-batik cotton",
    description:
      "Relaxed-fit summer dress with our signature batik patterning. Soft cotton hand, easy through hot afternoons.",
    colors: ["Mix colors"],
    sizes: FITTED_SIZES,
    images: imgs("ss26-amy", 11),
    inStock: true,
  },
  {
    id: "ss26-assie",
    name: "Assie Dress",
    priceUSD: 65,
    collection: "ss26",
    category: "Dress",
    fabric: "Hand-batik cotton",
    description:
      "A clean, modern silhouette in hand-batik cotton. Made by women artisans in the provinces of Sierra Leone.",
    colors: ["Mix colors"],
    sizes: FITTED_SIZES,
    images: imgs("ss26-assie", 2),
    inStock: true,
  },
  {
    id: "ss26-galleh-chic",
    name: "Galleh Chic Kimono",
    priceUSD: 100,
    collection: "ss26",
    category: "Kimono",
    fabric: "Hand-batik cotton",
    description:
      "Statement kimono with chic batik patterning — open through the body, fluid in movement, perfect over a dress or denim.",
    colors: ["Mix colors"],
    sizes: FREE_SIZE,
    images: imgs("ss26-galleh-chic", 3),
    inStock: true,
  },
  {
    id: "ss26-gbinti",
    name: "Gbinti Jacket",
    priceUSD: 125,
    collection: "ss26",
    category: "Jacket",
    fabric: "Sierra Leonean Contri Cloth + hand batik",
    description:
      "Statement jacket pairing Sierra Leonean hand-woven contri cloth with hand-batik cotton. A new edition for SS26.",
    colors: ["Mix colors"],
    sizes: FITTED_SIZES,
    images: imgs("ss26-gbinti", 2),
    inStock: true,
  },
  {
    id: "ss26-gigi",
    name: "Gigi Pantsuit",
    priceUSD: 79,
    collection: "ss26",
    category: "Pants Suit",
    fabric: "Hand-batik cotton",
    description:
      "Two-piece batik pantsuit with a relaxed fit. Wear together for impact or split across the wardrobe.",
    colors: ["Mix colors"],
    sizes: FITTED_SIZES,
    images: imgs("ss26-gigi", 6),
    inStock: true,
  },
  {
    id: "ss26-isatu",
    name: "Isatu Dress",
    priceUSD: 79,
    collection: "ss26",
    category: "Dress",
    fabric: "Hand-batik cotton",
    description:
      "Named for our founder. A graceful summer silhouette in hand-batik cotton, finished by Tesmaraneh's tailors.",
    colors: ["Mix colors"],
    sizes: FITTED_SIZES,
    images: imgs("ss26-isatu", 2),
    inStock: true,
  },
  {
    id: "ss26-juldeh",
    name: "Juldeh Shirt",
    priceUSD: 55,
    collection: "ss26",
    category: "Shirt",
    fabric: "Hand-batik cotton",
    description:
      "Easy summer shirt — relaxed cut, soft hand, layered over anything. Hand-batiked in Sierra Leone.",
    colors: ["Mix colors"],
    sizes: FITTED_SIZES,
    images: imgs("ss26-juldeh", 17),
    inStock: true,
  },
  {
    id: "ss26-mary",
    name: "Mary Kimono",
    priceUSD: 65,
    collection: "ss26",
    category: "Kimono",
    fabric: "Hand-batik cotton",
    description:
      "Light, open kimono with a soft drape. Throw over the shoulders or wear belted as a dress.",
    colors: ["Mix colors"],
    sizes: FREE_SIZE,
    images: imgs("ss26-mary", 6),
    inStock: true,
  },
  {
    id: "ss26-miriam-blazer",
    name: "Miriam Blazer",
    priceUSD: 65,
    collection: "ss26",
    category: "Blazer",
    fabric: "Hand-batik cotton",
    description:
      "Tailored blazer in hand-batik cotton — structured shoulders, relaxed body. Equal parts ceremony and everyday.",
    colors: ["Mix colors"],
    sizes: FITTED_SIZES,
    images: imgs("ss26-miriam-blazer", 1),
    inStock: true,
  },
  {
    id: "ss26-nema",
    name: "Nema Dress",
    priceUSD: 100,
    collection: "ss26",
    category: "Dress",
    fabric: "Hand-batik cotton + silk",
    description:
      "An evening-leaning piece for SS26 — hand-batik cotton with light silk detail. Soft, elegant, with movement.",
    colors: ["Mix colors"],
    sizes: FITTED_SIZES,
    images: imgs("ss26-nema", 5),
    inStock: true,
  },
  {
    id: "ss26-peagie",
    name: "Peagie Dress",
    priceUSD: 65,
    collection: "ss26",
    category: "Dress",
    fabric: "Hand-batik cotton",
    description:
      "Easy summer dress with a defined waist and floating skirt. Hand-batiked by our artisans in the North.",
    colors: ["Mix colors"],
    sizes: FITTED_SIZES,
    images: imgs("ss26-peagie", 5),
    inStock: true,
  },
  {
    id: "ss26-ranya",
    name: "Ranya Jacket-Cover",
    priceUSD: 30,
    collection: "ss26",
    category: "Jacket",
    fabric: "Hand-batik cotton",
    description:
      "Light open cover-up — equal parts jacket and shrug. The accessible entry point into the SS26 collection.",
    colors: ["Mix colors"],
    sizes: FREE_SIZE,
    images: imgs("ss26-ranya", 8),
    inStock: true,
  },
  {
    id: "ss26-sajor",
    name: "Sajor Dress",
    priceUSD: 86,
    collection: "ss26",
    category: "Dress",
    fabric: "Hand-batik cotton",
    description:
      "A statement summer dress — bold hand-batik patterning, flowing skirt, finished by Tesmaraneh tailors.",
    colors: ["Mix colors"],
    sizes: FITTED_SIZES,
    images: imgs("ss26-sajor", 9),
    inStock: true,
  },
  {
    id: "ss26-seray",
    name: "Seray Pants",
    priceUSD: 55,
    collection: "ss26",
    category: "Pants",
    fabric: "Hand-batik cotton",
    description:
      "Relaxed-fit hand-batik pants with natural drape. Wear with the Juldeh Shirt or anything from the wardrobe.",
    colors: ["Mix colors"],
    sizes: FITTED_SIZES,
    images: imgs("ss26-seray", 6),
    inStock: true,
  },
  {
    id: "ss26-sinky",
    name: "Sinky Recycled Shirt",
    priceUSD: 49,
    collection: "ss26",
    category: "Shirt",
    fabric: "Recycled cotton + hand batik",
    description:
      "Made with recycled cotton offcuts and hand-batik panels. Each piece is its own composition — colourways vary.",
    colors: ["Mix colors"],
    sizes: FITTED_SIZES,
    images: imgs("ss26-sinky", 9),
    inStock: true,
  },
  {
    id: "ss26-tia",
    name: "Tia Dress",
    priceUSD: 79,
    collection: "ss26",
    category: "Dress",
    fabric: "Hand-batik cotton",
    description:
      "A quiet, confident summer piece — clean lines, light cotton, hand-batiked in the provinces.",
    colors: ["Mix colors"],
    sizes: FITTED_SIZES,
    images: imgs("ss26-tia", 6),
    inStock: true,
  },
  {
    id: "ss26-zenita",
    name: "Zenita Kimono",
    priceUSD: 55,
    collection: "ss26",
    category: "Kimono",
    fabric: "Hand-batik cotton",
    description:
      "A versatile open-front kimono. Pairs effortlessly with anything in the SS26 line — or anything you already own.",
    colors: ["Mix colors"],
    sizes: FREE_SIZE,
    images: imgs("ss26-zenita", 7),
    inStock: true,
  },
  {
    id: "ss26-zenobia",
    name: "Zenobia Dress",
    priceUSD: 79,
    collection: "ss26",
    category: "Dress",
    fabric: "Hand-batik cotton",
    description:
      "An anchor piece for the collection — flowing hand-batik cotton, balanced silhouette, made for warm days.",
    colors: ["Mix colors"],
    sizes: FITTED_SIZES,
    images: imgs("ss26-zenobia", 2),
    inStock: true,
  },

  // ─── ARCHIVE — previous collections, sold out ───
  // Browseable for context but not purchasable. The /api/orders endpoint
  // double-checks inStock so a tampered client can't slip these into a cart.

  // ─── GARA (Hand-dyed) Collection — ARCHIVE ───
  {
    id: "hawawa-pants",
    name: "Hawawa Pants",
    priceUSD: 79,
    collection: "gara",
    category: "Pants",
    fabric: "Hand dyed cotton",
    description:
      "Relaxed-fit, light-weight hand-dyed pants with natural movement. Hand-tailored by our artisans in the North of Sierra Leone.",
    colors: [
      "Yellow & Orange",
      "Red & Yellow",
      "Orange & Purple",
      "Lemon Green & Pink",
      "Pink & Yellow",
      "Blue & Purple",
    ],
    sizes: ["UK6", "UK8", "UK10", "UK12", "UK14", "UK16"],
    images: imgs("hawawa-pants", 4),
    inStock: false,
  },
  {
    id: "mabel-dress",
    name: "Mabel Dress",
    priceUSD: 44,
    collection: "gara",
    category: "Dress",
    fabric: "Hand-dyed satin",
    description:
      "Free-size, relaxed-fit hand-dyed satin dress with signature cloud design. Light, flowing, and made for every day.",
    colors: ["Mix colors"],
    sizes: ["Free Size"],
    images: imgs("mabel-dress", 4),
    inStock: false,
  },
  {
    id: "sowa-jumpsuit",
    name: "Sowa Jumpsuit",
    priceUSD: 85,
    collection: "gara",
    category: "Jumpsuit",
    fabric: "Hand-dyed cotton",
    description:
      "Relaxed-fit hand-batik cotton jumpsuit with a mix of flower, draft and straight-line designs. Light-weight with beautiful movement.",
    colors: ["Mix color"],
    sizes: ["UK8", "UK10", "UK12", "UK14", "UK16"],
    images: imgs("sowa-jumpsuit", 4),
    inStock: false,
  },
  {
    id: "mamani-dress",
    name: "Mamani Dress",
    priceUSD: 85,
    collection: "gara",
    category: "Dress",
    fabric: "Hand-dyed cotton",
    description:
      "Relaxed-fit, hand-batik cotton dress with line design. Hand-dyed and tailored in Sierra Leone.",
    colors: ["Mix color"],
    sizes: ["UK8", "UK10", "UK12", "UK14", "UK16"],
    images: imgs("mamani-dress", 2),
    inStock: false,
  },
  {
    id: "yabom",
    name: "Yabom",
    priceUSD: 69,
    collection: "gara",
    category: "Dress",
    fabric: "Hand-dyed cotton",
    description:
      "Soft, hand-dyed cotton piece crafted by Sierra Leonean artisans. A timeless everyday design.",
    colors: ["Mix colors"],
    sizes: ["UK8", "UK10", "UK12", "UK14", "UK16"],
    images: imgs("yabom", 3),
    inStock: false,
  },

  // ─── BATIK Collection — ARCHIVE ───
  {
    id: "aissatou-jumpsuit",
    name: "Aissatou Jumpsuit",
    priceUSD: 85,
    collection: "batik",
    category: "Jumpsuit",
    fabric: "Hand batik cotton",
    description:
      "Relaxed-fit light-weight hand-batik jumpsuit with draft design. Three-day artisan process: hand batik, hand-dye, then hand-tailor.",
    colors: ["Purple", "Green", "Blue", "Pink", "Orange"],
    sizes: ["UK8", "UK10", "UK12", "UK14", "UK16"],
    images: imgs("aissatou-jumpsuit", 4),
    inStock: false,
  },
  {
    id: "ami-rap-dress",
    name: "Ami Rap Dress",
    priceUSD: 98,
    collection: "batik",
    category: "Dress",
    fabric: "Hand batik (Coligy) with silk",
    description:
      "Free-size hand-batik cotton rap dress mixed with light silk. Light-weight, flowing and crafted over three days by our artisans.",
    colors: ["Purple", "Green", "Blue", "Pink", "Orange", "Yellow"],
    sizes: ["Free Size (UK8–UK16)"],
    images: imgs("ami-rap-dress", 4),
    inStock: false,
  },
  {
    id: "ariana-patch-dress",
    name: "Ariana Patch Dress",
    priceUSD: 49,
    collection: "batik",
    category: "Dress",
    fabric: "100% cotton — hand batik",
    description:
      "Relaxed-fit patch dress in a mix of four colours with draft, flower and straight-line coligy designs. Light-weight with movement.",
    colors: ["4-color mix"],
    sizes: ["UK8", "UK10", "UK12", "UK14", "UK16"],
    images: imgs("ariana-patch-dress", 1),
    inStock: false,
  },
  {
    id: "dija-shirt-dress",
    name: "Dija Shirt Dress",
    priceUSD: 85,
    collection: "batik",
    category: "Dress",
    fabric: "Hand batik + hand-woven cloth",
    description:
      "Relaxed-fit hand-batik shirt dress tailored with Sierra Leonean hand-woven cloth detail. Light-weight with natural drape.",
    colors: ["Purple", "Green", "Blue", "Pink", "Orange"],
    sizes: ["UK8", "UK10", "UK12", "UK14", "UK16"],
    images: imgs("dija-shirt-dress", 4),
    inStock: false,
  },
  {
    id: "isata-jacket-rap",
    name: "Isata Rap Dress",
    priceUSD: 98,
    collection: "batik",
    category: "Dress",
    fabric: "Hand batik",
    description:
      "Free-size rap dress that fits UK8–UK16 beautifully. Light-weight hand-batik with a mix of draft, flower and line coligy designs.",
    colors: ["Orange & Purple", "Blue & Red", "Yellow & Pink"],
    sizes: ["Free Size (UK8–UK16)"],
    images: imgs("isata-jacket-rap", 4),
    inStock: false,
  },
  {
    id: "iyekallay-dress",
    name: "Iyekallay Dress",
    priceUSD: 98,
    collection: "batik",
    category: "Dress",
    fabric: "Hand batik + light silk",
    description:
      "Relaxed-fit hand-batik dress tailored with light silk. Draft, flower or straight-line designs — chosen at the artisan's hand.",
    colors: ["Purple", "Green", "Blue", "Yellow", "Orange"],
    sizes: ["UK8", "UK10", "UK12", "UK14", "UK16"],
    images: imgs("iyekallay-dress", 4),
    inStock: false,
  },
  {
    id: "marie-dress",
    name: "Marie Dress",
    priceUSD: 45,
    collection: "batik",
    category: "Dress",
    fabric: "100% hand-batik cotton",
    description:
      "Relaxed-fit batik cotton dress with signature pineapple print. Light-weight and perfect for warm days.",
    colors: ["Green", "Orange", "Red", "Pink", "Purple"],
    sizes: ["UK8", "UK10", "UK12", "UK14", "UK16"],
    images: imgs("marie-dress", 4),
    inStock: false,
  },
  {
    id: "miriam-kimono",
    name: "Miriam Kimono",
    priceUSD: 62,
    collection: "batik",
    category: "Kimono",
    fabric: "100% hand-batik cotton",
    description:
      "Relaxed-fit kimono with straight-line batik design and delicate embroidery. Light-weight with beautiful drape.",
    colors: ["Pink", "Yellow", "Blue", "Green", "Orange", "Purple", "Lemon Green"],
    sizes: ["UK8", "UK10", "UK12", "UK14", "UK16"],
    images: imgs("miriam-kimono", 4),
    inStock: false,
  },
  {
    id: "nenegalleh-boubou",
    name: "Nenegalleh Boubou",
    priceUSD: 117,
    collection: "batik",
    category: "Boubou",
    fabric: "100% hand-batik cotton",
    description:
      "Free-size boubou gown with embroidery detail, crafted in hand-batik cotton. Elegant, light-weight and ceremony-ready.",
    colors: [
      "Yellow/Pink",
      "Purple/Green",
      "Grey",
      "Grey/Red",
      "Red",
      "Purple",
    ],
    sizes: ["Free Size (UK8–UK18)"],
    images: imgs("nenegalleh-boubou", 4),
    inStock: false,
  },
  {
    id: "tutu-kaftan-patch",
    name: "Tutu Kaftan (Patch)",
    priceUSD: 45,
    collection: "batik",
    category: "Kaftan",
    fabric: "100% hand-batik cotton",
    description:
      "Every-day batik kaftan in straight-line and draft designs. Free-size, 100% cotton, crafted over three days.",
    colors: ["Mix colors"],
    sizes: ["Free Size (UK8–UK16)"],
    images: imgs("tutu-kaftan-patch", 4),
    inStock: false,
  },
  {
    id: "zaza-pants-suit",
    name: "Zaza Pants Suit",
    priceUSD: 79,
    collection: "batik",
    category: "Pants Suit",
    fabric: "100% hand-batik cotton",
    description:
      "Classic hand-batik cotton pants suit in straight-line, flower and draft designs. Suitable for the modern classic woman.",
    colors: [
      "Yellow",
      "Orange",
      "Blue",
      "Lime Green",
      "Purple",
      "Pink",
      "Mix colors",
    ],
    sizes: ["UK8", "UK10", "UK12", "UK14", "UK16"],
    images: imgs("zaza-pants-suit", 4),
    inStock: false,
  },

  // ─── WOVEN / COUNTRY CLOTH Collection — ARCHIVE ───
  {
    id: "bunduka-jacket",
    name: "Bunduka Jacket",
    priceUSD: 153,
    collection: "woven",
    category: "Jacket",
    fabric: "Leppi (Fulani cotton) + hand batik",
    description:
      "Relaxed-fit statement jacket — indigo Leppi sourced from Guinea, mixed with hand-batik cotton. Hand-wash to preserve the natural dye.",
    colors: ["Indigo Blue mix (Yellow, Orange, Blue, Red, Pink)"],
    sizes: ["UK8", "UK10", "UK12", "UK14", "UK16"],
    images: imgs("bunduka-jacket", 4),
    inStock: false,
  },
  {
    id: "gbinti-jacket",
    name: "Gbinti Jacket (Archive)",
    priceUSD: 153,
    collection: "woven",
    category: "Jacket",
    fabric: "Sierra Leonean Contri Cloth + hand batik",
    description:
      "Statement jacket in Sierra Leonean hand-woven contri cloth mixed with hand-batik cotton. Relaxed fit with natural movement.",
    colors: ["Yellow", "Orange", "Blue", "Red", "Pink mix"],
    sizes: ["UK8", "UK10", "UK12", "UK14", "UK16"],
    images: imgs("gbinti-jacket", 4),
    inStock: false,
  },
  {
    id: "umu-leppi-top",
    name: "Umu Leppi Top",
    priceUSD: 45,
    collection: "woven",
    category: "Top",
    fabric: "Leppi (Fulani cotton) — naturally dyed",
    description:
      "Warm, flexible cover made from Fulani leppi cloth, traditionally dyed with natural leaves. Perfect for cooler seasons.",
    colors: ["Indigo Blue"],
    sizes: ["Free Size (UK8–UK16)"],
    images: imgs("umu-leppi-top", 2),
    inStock: false,
  },
];

export function getProductsByCollection(collection: Collection): Product[] {
  return products.filter((p) => p.collection === collection);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/** In-stock products, in display order. SS26 first by virtue of array
 *  position. Sold-out archive comes after. */
export const inStockProducts = products.filter((p) => p.inStock);

export const COLLECTION_LABELS: Record<Collection, string> = {
  ss26: "SS26 Summer",
  gara: "Gara Tie-Dye",
  batik: "Batik",
  woven: "Woven Country Cloth",
};
