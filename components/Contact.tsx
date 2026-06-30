import Image from "next/image";

import InkDoodle from "./InkDoodle";

const links = [
  { label: "GitHub", href: "https://github.com/amitamit10" },
  { label: "LinkedIn", href: "https://linkedin.com/in/amitelgabsy" },
  { label: "Email", href: "mailto:amit.elgabsy@gmail.com" },
];

export default function Contact() {
  return (
    <section id="contact" className="px-4 pb-24 pt-12 md:px-8 md:pb-32">
      <div className="paper-stack mx-auto max-w-4xl px-6 py-8 md:px-8 md:py-10">
        <div className="rough-frame border px-6 py-8 paper-panel md:px-8 md:py-10">
          <div className="space-y-5">
            <div className="max-w-[290px] fps-jitter">
              <Image
                src="/wordmarks/contact.png"
                alt="Contact wordmark"
                width={720}
                height={220}
                className="h-auto w-full"
              />
            </div>
            <p className="max-w-2xl text-sm leading-6 md:text-base" style={{ color: "var(--ink-soft)" }}>
              Open to product work, creative engineering, collaborations, and roles where design taste matters as
              much as implementation speed.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {links.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  className="border px-4 py-3 text-sm transition-opacity duration-150 hover:opacity-70"
                  style={{
                    color: link.label === "Email" ? "#231a13" : "var(--ink)",
                    background: link.label === "Email" ? "var(--water-beige)" : "rgba(255,250,243,0.75)",
                    borderColor: "rgba(95,81,69,0.18)",
                    transform: `rotate(${index === 1 ? "-2deg" : index === 2 ? "3deg" : "1deg"})`,
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-2">
              <InkDoodle className="w-36 fps-drift" variant="arrow" />
              <p className="text-sm leading-6" style={{ color: "var(--water-shadow)" }}>
                Good fits usually start with one specific message and one interesting problem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
