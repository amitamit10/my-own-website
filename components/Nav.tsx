"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#github", label: "GitHub" },
  { href: "/blog", label: "Blog" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const resolveHref = (href: string) => {
    if (!href.startsWith("#")) {
      return href;
    }

    return pathname === "/" ? href : `/${href}`;
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8">
      <div
        className="mx-auto flex max-w-6xl items-center justify-between border px-4 py-3 md:px-5"
        style={{
          background: "rgba(255,250,243,0.86)",
          borderColor: "rgba(95,81,69,0.18)",
          boxShadow: "0 2px 10px rgba(90,72,54,0.08)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Link href="/" className="text-sm font-semibold tracking-[0.08em]" style={{ color: "var(--ink)" }}>
          AMIT ELGABSY
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={resolveHref(link.href)}
                className="text-sm transition-opacity duration-150 hover:opacity-65"
                style={{ color: "var(--ink-soft)" }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="text-sm font-medium md:hidden"
          aria-label="Toggle navigation"
          onClick={() => setOpen((value) => !value)}
          style={{ color: "var(--ink)" }}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <div
          className="mx-auto mt-2 max-w-6xl border px-4 py-3 md:hidden"
          style={{
            background: "rgba(255,250,243,0.95)",
            borderColor: "rgba(95,81,69,0.18)",
          }}
        >
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={resolveHref(link.href)}
                  onClick={() => setOpen(false)}
                  className="block text-sm"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
