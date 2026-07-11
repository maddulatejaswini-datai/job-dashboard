function tier(score: number) {
  if (score >= 80) {
    return {
      label: "Strong fit",
      ring: "#B08968",
      bg: "#F1E7DA",
      fg: "#7A5230",
    };
  }
  if (score >= 60) {
    return {
      label: "Good fit",
      ring: "#C9A26A",
      bg: "#F5EDE0",
      fg: "#8A6A2E",
    };
  }
  return {
    label: "Partial fit",
    ring: "#C8B6A6",
    bg: "#F3EEE7",
    fg: "#8A7A68",
  };
}

export default function FitScore({ score }: { score: number }) {
  const { label, ring, bg, fg } = tier(score);

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full text-base font-semibold"
        style={{
          backgroundColor: bg,
          color: fg,
          boxShadow: `inset 0 0 0 2px ${ring}`,
        }}
      >
        {score}
      </div>
      <span className="text-[11px] font-medium tracking-wide text-[#9C8B78] uppercase">
        {label}
      </span>
    </div>
  );
}
