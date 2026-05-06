import { notFound } from "next/navigation";
import { getProductById, products } from "@/lib/products";
import { ProductDetail } from "./product-detail";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) return notFound();

  const related = products
    .filter((p) => p.id !== product.id && p.inStock)
    .slice(0, 4);

  return <ProductDetail product={product} related={related} />;
}
