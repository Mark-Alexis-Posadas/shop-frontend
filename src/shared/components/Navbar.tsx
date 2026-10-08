import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu, ShoppingBag, X } from "lucide-react";
import { useUIStore } from "../stores/ui-store";
import { Container } from "./Container";

export default function Navbar() {
  const menuOpen = useUIStore((state) => state.menuOpen);
  const toggleMenu = useUIStore((state) => state.toggleMenu);

  return (
    <header className="border-b border-stone-200 bg-white">
      <Container>
        <div className="flex h-20 items-center justify-between gap-6">
          <Link
            to="/"
            aria-label="MERN Shop home"
            className="flex items-center gap-2.5 text-xl font-bold tracking-tight"
          >
            <span className="rounded-xl bg-emerald-900 p-2 text-white">
              <ShoppingBag size={20} aria-hidden="true" />
            </span>
            MERN<span className="font-normal text-stone-500">Shop</span>
          </Link>
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-8 text-sm font-medium md:flex"
          >
            <Link
              to="/"
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-emerald-800" }}
            >
              Home
            </Link>
            <Link
              to="/products"
              activeProps={{ className: "text-emerald-800" }}
            >
              Products
            </Link>
          </nav>
          <Link
            to="/products"
            className="hidden items-center gap-2 rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 md:flex"
          >
            Explore the shop <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <button
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="rounded-lg border border-stone-200 p-2 md:hidden"
          >
            {menuOpen ? (
              <X size={22} aria-hidden="true" />
            ) : (
              <Menu size={22} aria-hidden="true" />
            )}
          </button>
        </div>
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          hidden={!menuOpen}
          className="space-y-3 border-t border-stone-200 py-4 md:hidden"
        >
          <Link to="/" onClick={toggleMenu} className="block py-2">
            Home
          </Link>
          <Link to="/products" onClick={toggleMenu} className="block py-2">
            Products
          </Link>
        </nav>
      </Container>
    </header>
  );
}
