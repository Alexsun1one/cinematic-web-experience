export function Seal({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 320" className={className} aria-hidden="true">
      <circle cx="160" cy="160" r="148" fill="none" stroke="#b57a28" strokeWidth="3" />
      <circle cx="160" cy="160" r="136" fill="none" stroke="#b57a28" strokeWidth="1.2" />
      <path
        d="M160 28 A132 132 0 0 1 160 292 A132 132 0 0 1 160 28"
        fill="none"
        stroke="#b57a28"
        strokeWidth="0.6"
        strokeDasharray="2 7"
      />
      <text
        x="160"
        y="188"
        textAnchor="middle"
        fill="#b57a28"
        fontFamily="Noto Serif SC, serif"
        fontSize="118"
      >
        识
      </text>
      <text
        x="160"
        y="54"
        textAnchor="middle"
        fill="#b57a28"
        fontFamily="Noto Serif SC, serif"
        fontSize="13"
        letterSpacing="6"
      >
        智识宇宙
      </text>
      <text
        x="160"
        y="286"
        textAnchor="middle"
        fill="#b57a28"
        fontFamily="Noto Serif SC, serif"
        fontSize="12"
        letterSpacing="4"
      >
        〇 序
      </text>
    </svg>
  );
}
