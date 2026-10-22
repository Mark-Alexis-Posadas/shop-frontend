import { Link, NavLink, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingBag,
  ShoppingCart,
  LogOut,
  LogIn,
  UserRound,
} from "lucide-react";

import { useAuthStore } from "../../../features/auth/store/authStore";
import { cartService } from "../../../features/cart/services/cartService";

const navigation = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/products" },
  { label: "Orders", path: "/orders" },
];

const Header = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const isAuthenticated = Boolean(token && user);

  const { data: cart } = useQuery({
    queryKey: ["cart", token],
    queryFn: ({ signal }) => cartService.getCart(signal),
    enabled: isAuthenticated,
  });

  const cartCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  const handleLogout = () => {
    queryClient.clear();
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <ShoppingBag size={20} />
          </span>

          <span className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            Shop<span className="text-indigo-600">Sphere.</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav
          aria-label="Main navigation"
          className="order-3 flex w-full items-center justify-center gap-6 border-t border-slate-100 pt-3 sm:order-none sm:w-auto sm:border-0 sm:pt-0"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `relative text-sm font-semibold transition ${
                  isActive
                    ? "text-indigo-600"
                    : "text-slate-500 hover:text-indigo-600"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Cart icon with badge */}
          <Link
            to={isAuthenticated ? "/cart" : "/login"}
            aria-label={`Shopping cart, ${cartCount} items`}
            title="Shopping Cart"
            className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <ShoppingCart
              size={21}
              className="transition group-hover:scale-110"
            />

            {isAuthenticated && cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-indigo-600 px-1 text-[10px] font-extrabold text-white shadow-sm">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              {/* User */}
              <div className="hidden items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 sm:flex">
                <UserRound size={17} className="text-indigo-600" />

                <span className="max-w-28 truncate text-sm font-semibold text-slate-700">
                  {user?.name}
                </span>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl border border-red-100 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={17} />

                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
            >
              <LogIn size={17} />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
