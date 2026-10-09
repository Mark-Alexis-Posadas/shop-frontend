import { Link } from "react-router-dom";

interface PagePlaceholderProps {
  title: string;
  description: string;
}

const PagePlaceholder = ({ title, description }: PagePlaceholderProps) => {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">
      <h1 className="text-4xl font-bold">{title}</h1>
      <p className="mt-4 max-w-lg text-gray-500">{description}</p>
      <Link
        to="/products"
        className="mt-8 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
      >
        Browse Products
      </Link>
    </section>
  );
};

export default PagePlaceholder;
