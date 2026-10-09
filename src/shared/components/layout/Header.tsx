import { Link, NavLink, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../features/auth/store/authStore";

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

  const handleLogout = () => {
    // Clear user-specific cached API data
    queryClient.clear();

    // Remove user and token from Zustand
    logout();

    // Redirect to login
    navigate("/login", { replace: true });
  };

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

          {isAuthenticated ? (
            <>
              <span className="text-gray-700">Hi, {user?.name}</span>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-red-200 px-4 py-2 text-red-600 transition hover:bg-red-50"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
