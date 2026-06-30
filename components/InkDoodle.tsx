type InkDoodleProps = {
  className?: string;
  variant?: "arrow" | "loop" | "spark";
};

const doodles = {
  arrow: (
    <path d="M5 53C40 38 84 31 130 31C174 31 212 38 249 46M219 17C234 27 245 38 255 53C236 60 220 67 203 77" />
  ),
  loop: (
    <path d="M34 51C37 27 60 10 92 10C128 10 155 30 155 58C155 83 133 100 106 100C76 100 56 83 56 59C56 41 67 27 86 17M152 52C177 49 199 53 220 67" />
  ),
  spark: (
    <>
      <path d="M51 6L56 35" />
      <path d="M14 24L40 39" />
      <path d="M89 24L63 39" />
      <path d="M26 72L45 54" />
      <path d="M77 72L58 54" />
    </>
  ),
};

export default function InkDoodle({ className, variant = "arrow" }: InkDoodleProps) {
  const viewBox = variant === "arrow" ? "0 0 260 90" : variant === "loop" ? "0 0 240 110" : "0 0 102 80";

  return (
    <svg
      viewBox={viewBox}
      fill="none"
      aria-hidden="true"
      className={className}
      style={{ overflow: "visible" }}
    >
      <g
        stroke="rgba(47,36,27,0.68)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {doodles[variant]}
      </g>
    </svg>
  );
}
