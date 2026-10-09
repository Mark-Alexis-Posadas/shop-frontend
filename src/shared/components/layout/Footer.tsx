import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-gray-950 py-10 text-gray-300">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 md:flex-row">
        <div>
          <h2 className="text-xl font-bold text-white">ShopSphere.</h2>
          <p className="mt-2 text-sm text-gray-400">
            Your everyday online shopping destination.
          </p>
        </div>

        <div className="flex gap-6 text-sm">
          <Link to="/" className="hover:text-white">
            Home
          </Link>
          <Link to="/products" className="hover:text-white">
            Products
          </Link>
          <Link to="/cart" className="hover:text-white">
            Cart
          </Link>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} ShopSphere. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
