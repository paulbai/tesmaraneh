export interface Product {
  id: string;
  name: string;
  priceUSD: number; // client pricing
  collection: "gara" | "batik" | "woven";
  category: string;
  fabric: string;
  description: string;
  colors: string[];
  sizes: string[];
  images: string[]; // paths under /public
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

// Display price in new Sierra Leonean Leones (~22 per USD; old Le/1000).
// E.g. $85 → Le 1,870 (was Le 1,870,000 under the old note-set).
export function formatPrice(priceUSD: number): string {
  const sle = Math.round((priceUSD * 22) / 10) * 10;
  return `Le ${sle.toLocaleString()}`;
}

export function formatPriceUSD(priceUSD: number): string {
  return `$${priceUSD}`;
}

// Helper to build image paths
const img = (slug: string, n: number) => `/products/${slug}/${n}.jpg`;
const imgs = (slug: string, count: number) =>
  Array.from({ length: count }, (_, i) => img(slug, i + 1));

export const products: Product[] = [
  // ─── GARA (Hand-dyed) Collection ───
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
  },

  // ─── BATIK Collection ───
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
  },

  // ─── WOVEN / COUNTRY CLOTH Collection ───
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
  },
  {
    id: "gbinti-jacket",
    name: "Gbinti Jacket",
    priceUSD: 153,
    collection: "woven",
    category: "Jacket",
    fabric: "Sierra Leonean Contri Cloth + hand batik",
    description:
      "Statement jacket in Sierra Leonean hand-woven contri cloth mixed with hand-batik cotton. Relaxed fit with natural movement.",
    colors: ["Yellow", "Orange", "Blue", "Red", "Pink mix"],
    sizes: ["UK8", "UK10", "UK12", "UK14", "UK16"],
    images: imgs("gbinti-jacket", 4),
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
  },
];

export function getProductsByCollection(
  collection: "gara" | "batik" | "woven"
): Product[] {
  return products.filter((p) => p.collection === collection);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
