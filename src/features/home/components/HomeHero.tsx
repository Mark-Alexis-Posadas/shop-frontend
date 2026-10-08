import { Link } from "@tanstack/react-router";
import { ArrowRight, Headphones, Leaf, Mouse, Sparkles } from "lucide-react";
import { Container } from "../../../shared/components/Container";

export function HomeHero() {
  return (
    <section className="overflow-hidden bg-[#f2f3eb]">
      <Container className="grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-900">
            <span className="h-2 w-2 rounded-full bg-emerald-700" /> A little
            upgrade. A better everyday.
          </p>
          <h1 className="max-w-xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            Good finds.
            <br />
            Great{" "}
            <span className="font-serif italic text-emerald-800">
              everydays.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-stone-600">
            From your desk to your downtime, discover the little things that
            make your day feel a little more you.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Link
              to="/products"
              className="inline-flex items-center gap-3 rounded-full bg-emerald-900 px-7 py-3.5 font-medium text-white transition hover:bg-emerald-800"
            >
              Shop the collection <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a
              href="#discover"
              className="text-sm font-medium underline decoration-stone-400 underline-offset-4"
            >
              Take a look around
            </a>
          </div>
          <p className="mt-9 flex items-center gap-2 text-sm text-stone-500">
            <Sparkles size={16} aria-hidden="true" /> Find something that fits
            your everyday.
          </p>
        </div>
        <div
          aria-hidden="true"
          className="relative mx-auto flex aspect-square w-full max-w-lg items-center justify-center rounded-[2rem] bg-[#dce5d5]"
        >
          <div className="absolute inset-10 rounded-full border border-white/60" />
          <div className="absolute inset-20 rounded-full border border-white/60" />
          <div className="relative flex h-52 w-52 -rotate-12 items-center justify-center rounded-[3rem] bg-emerald-950 text-[#e0e8d6] shadow-2xl sm:h-64 sm:w-64">
            <Headphones className="h-32 w-32 sm:h-40 sm:w-40" strokeWidth={1} />
          </div>
          <div className="absolute bottom-8 right-6 rotate-12 rounded-3xl bg-[#f6e5c9] p-6 shadow-lg sm:bottom-12 sm:right-8">
            <Mouse size={68} strokeWidth={1.2} className="text-stone-700" />
          </div>
          <div className="absolute left-5 top-7 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium shadow-sm">
            <Leaf size={15} className="text-emerald-800" /> Everyday inspiration
          </div>
          <span className="absolute bottom-7 left-7 text-xs font-medium uppercase tracking-widest text-emerald-950">
            Work. Unwind. Repeat.
          </span>
        </div>
      </Container>
    </section>
  );
}
