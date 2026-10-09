import { Link, NavLink } from "react-router-dom";

const navigation = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/products" },
  { label: "Orders", path: "/orders" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight text-indigo-600"
        >
          ShopSphere.
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex flex-wrap items-center gap-5"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `text-sm font-medium transition hover:text-indigo-600 ${
                  isActive ? "text-indigo-600" : "text-gray-600"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/cart" className="hover:text-indigo-600">
            Cart
          </Link>
          <Link
            to="/login"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
