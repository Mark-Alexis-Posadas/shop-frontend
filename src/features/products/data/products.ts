export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 2499,
    category: "Electronics",
    image: "https://placehold.co/600x450?text=Headphones",
    description: "Comfortable wireless headphones for everyday listening.",
  },
  {
    id: "2",
    name: "Minimalist Smart Watch",
    price: 3299,
    category: "Accessories",
    image: "https://placehold.co/600x450?text=Smart+Watch",
    description: "A modern smartwatch designed for daily use.",
  },
  {
    id: "3",
    name: "Everyday Sneakers",
    price: 1899,
    category: "Fashion",
    image: "https://placehold.co/600x450?text=Sneakers",
    description: "Versatile sneakers with a comfortable fit.",
  },
  {
    id: "4",
    name: "Classic Backpack",
    price: 1299,
    category: "Accessories",
    image: "https://placehold.co/600x450?text=Backpack",
    description: "A practical backpack for work and travel.",
  },
];
