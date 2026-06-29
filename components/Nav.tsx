"use client";

import Link from "next/link";
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

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{ background: "rgba(10,10,10,0.8)", backdropFilter: "blur(12px)" }}
    >
      <Link
        href="/"
        className="text-lg font-bold"
        style={{ color: "var(--accent)", fontFamily: "var(--font-display)" }}
      >
        AE
      </Link>

      <ul className="hidden list-none gap-8 md:flex">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--text-muted)" }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <button
        className="text-[var(--accent)] md:hidden"
        onClick={() => setOpen((value) => !value)}
        aria-label="Menu"
      >
        {open ? "X" : "☰"}
      </button>

      {open ? (
        <ul
          className="absolute top-full left-0 right-0 flex list-none flex-col gap-4 p-6 md:hidden"
          style={{ background: "var(--surface)" }}
        >
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-lg"
                style={{ color: "var(--text)" }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </nav>
  );
}
