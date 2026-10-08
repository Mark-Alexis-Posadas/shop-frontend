import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Coffee,
  Headphones,
  Laptop,
  ShoppingBag,
} from "lucide-react";
import { Container } from "../../../shared/components/Container";
import { HomeHero } from "../components/HomeHero";
import { ProductPreview } from "../components/ProductPreview";

const highlights = [
  {
    icon: Laptop,
    title: "Make work feel better",
    description: "A fresh perspective on your everyday setup.",
  },
  {
    icon: Headphones,
    title: "Find your downtime",
    description: "Make a little room for the things you enjoy.",
  },
  {
    icon: Coffee,
    title: "Enjoy the little things",
    description: "Turn familiar routines into favorite moments.",
  },
];

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <section
        id="discover"
        aria-labelledby="discover-heading"
        className="scroll-mt-8 border-b border-stone-200 py-14"
      >
        <Container>
          <h2
            id="discover-heading"
            className="mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500"
          >
            Made for the way you spend your day
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {highlights.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4">
                <span className="rounded-2xl bg-stone-100 p-3 text-emerald-900">
                  <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="mb-2 font-semibold">{title}</h3>
                  <p className="text-sm leading-6 text-stone-500">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
      <ProductPreview />
      <Container className="pb-20">
        <section className="flex flex-col items-start justify-between gap-8 rounded-3xl bg-emerald-950 p-8 text-white sm:p-12 md:flex-row md:items-center">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-emerald-200">
              Something for your everyday
            </p>
            <h2 className="max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl">
              Small changes.
              <br />A fresh start.
            </h2>
            <p className="mt-4 max-w-md leading-7 text-emerald-100/80">
              Give your routine a refresh. Explore the collection and find your
              next good thing.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex shrink-0 items-center gap-3 rounded-full bg-white px-6 py-3.5 font-medium text-emerald-950 hover:bg-emerald-50"
          >
            Explore products <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
      </Container>
      <footer className="border-t border-stone-200 bg-stone-50 py-8">
        <Container className="flex flex-col justify-between gap-5 text-sm sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingBag size={18} aria-hidden="true" /> MERN Shop{" "}
            <span className="ml-2 font-normal text-stone-500">
              Good finds for everyday life.
            </span>
          </div>
          <Link to="/products" className="font-medium text-emerald-900">
            Browse the collection
          </Link>
        </Container>
      </footer>
    </>
  );
}
