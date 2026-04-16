export interface Product {
  id: string;
  name: string;
  price: number; // in Sierra Leonean Leones
  collection: "gara" | "batik" | "woven";
  category: string;
  description: string;
  image: string; // Unsplash placeholder
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// Format price in Leones
export function formatPrice(amount: number): string {
  return `SLE ${amount.toLocaleString()}`;
}

export const products: Product[] = [
  // Gara Tie-Dye Collection
  {
    id: "gara-1",
    name: "Gara Wrap Dress",
    price: 450000,
    collection: "gara",
    category: "Dress",
    description: "Flowing wrap dress in hand-dyed Gara tie-dye with indigo and white spiral patterns",
    image: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400&h=500&fit=crop",
  },
  {
    id: "gara-2",
    name: "Gara Headwrap",
    price: 120000,
    collection: "gara",
    category: "Accessory",
    description: "Traditional headwrap in vibrant Gara tie-dye, perfect for everyday or ceremonies",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
  },
  {
    id: "gara-3",
    name: "Gara Tote Bag",
    price: 180000,
    collection: "gara",
    category: "Bag",
    description: "Spacious tote bag crafted from reinforced Gara fabric with leather handles",
    image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&h=500&fit=crop",
  },
  {
    id: "gara-4",
    name: "Gara A-Line Skirt",
    price: 320000,
    collection: "gara",
    category: "Skirt",
    description: "Elegant A-line skirt with deep indigo Gara dye and freeform pattern",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=500&fit=crop",
  },
  {
    id: "gara-5",
    name: "Gara Bedspread",
    price: 650000,
    collection: "gara",
    category: "Home",
    description: "King-size bedspread in layered Gara tie-dye, a centrepiece for any bedroom",
    image: "https://images.unsplash.com/photo-1616627561950-9f746e330187?w=400&h=500&fit=crop",
  },
  {
    id: "gara-6",
    name: "Gara Men's Shirt",
    price: 280000,
    collection: "gara",
    category: "Shirt",
    description: "Relaxed-fit men's shirt in classic Gara tie-dye with wooden buttons",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop",
  },

  // Batik Collection
  {
    id: "batik-1",
    name: "Batik Maxi Dress",
    price: 520000,
    collection: "batik",
    category: "Dress",
    description: "Full-length maxi dress in wax-resist batik with floral motifs",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop",
  },
  {
    id: "batik-2",
    name: "Batik Clutch Purse",
    price: 150000,
    collection: "batik",
    category: "Bag",
    description: "Compact evening clutch in hand-stamped batik with brass clasp",
    image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=500&fit=crop",
  },
  {
    id: "batik-3",
    name: "Batik Palazzo Pants",
    price: 350000,
    collection: "batik",
    category: "Pants",
    description: "Wide-leg palazzo pants in bold batik print for effortless style",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop",
  },
  {
    id: "batik-4",
    name: "Batik Table Runner",
    price: 200000,
    collection: "batik",
    category: "Home",
    description: "Hand-crafted table runner featuring geometric batik patterns",
    image: "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=400&h=500&fit=crop",
  },
  {
    id: "batik-5",
    name: "Batik Kimono Jacket",
    price: 480000,
    collection: "batik",
    category: "Jacket",
    description: "Lightweight kimono-style jacket in earthy batik tones",
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=500&fit=crop",
  },
  {
    id: "batik-6",
    name: "Batik Scarf",
    price: 95000,
    collection: "batik",
    category: "Accessory",
    description: "Soft cotton scarf with delicate batik patterns in warm earth tones",
    image: "https://images.unsplash.com/photo-1601924921557-45e879e8e3c6?w=400&h=500&fit=crop",
  },

  // Woven / Country Cloth Collection
  {
    id: "woven-1",
    name: "Woven Shift Dress",
    price: 580000,
    collection: "woven",
    category: "Dress",
    description: "Structured shift dress in hand-woven country cloth with stripe detail",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop",
  },
  {
    id: "woven-2",
    name: "Woven Crossbody Bag",
    price: 220000,
    collection: "woven",
    category: "Bag",
    description: "Compact crossbody bag in woven cloth with adjustable leather strap",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=500&fit=crop",
  },
  {
    id: "woven-3",
    name: "Woven Throw Blanket",
    price: 400000,
    collection: "woven",
    category: "Home",
    description: "Cozy throw blanket in traditional country cloth weave patterns",
    image: "https://images.unsplash.com/photo-1580301762395-21ce12d4bc4b?w=400&h=500&fit=crop",
  },
  {
    id: "woven-4",
    name: "Woven Blazer",
    price: 620000,
    collection: "woven",
    category: "Jacket",
    description: "Tailored blazer in structured woven cloth with modern cut",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop",
  },
  {
    id: "woven-5",
    name: "Woven Cap",
    price: 85000,
    collection: "woven",
    category: "Accessory",
    description: "Unisex cap in country cloth weave, perfect for sun protection with style",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=500&fit=crop",
  },
  {
    id: "woven-6",
    name: "Woven Wide-Leg Trousers",
    price: 380000,
    collection: "woven",
    category: "Pants",
    description: "Relaxed wide-leg trousers in hand-woven cloth with drawstring waist",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
  },
];

export function getProductsByCollection(collection: "gara" | "batik" | "woven"): Product[] {
  return products.filter((p) => p.collection === collection);
}
