import type { Product } from "../services/productService";

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(price);
};

export const getPrimaryImage = (product: Product): string | undefined => {
  const primary = product.images?.find((image) => image.isPrimary);

  return primary?.url || product.images?.[0]?.url;
};

export const getDiscountPercentage = (product: Product): number => {
  const originalPrice = product.compareAtPrice;

  if (
    originalPrice == null ||
    originalPrice <= product.price ||
    originalPrice <= 0
  ) {
    return 0;
  }

  return Math.round(((originalPrice - product.price) / originalPrice) * 100);
};

export const isLowStock = (product: Product): boolean => {
  return product.stock > 0 && product.stock <= product.lowStockThreshold;
};
