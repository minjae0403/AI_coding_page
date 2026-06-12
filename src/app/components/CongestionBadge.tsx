interface Props {
  value: number;
  updatedAt: string;
}

function getCongestionLabel(value: number): { label: string; color: string; bg: string } {
  if (value < 30) return { label: "여유", color: "#2E7D32", bg: "#E8F5E9" };
  if (value < 60) return { label: "보통", color: "#E65100", bg: "#FFF3E0" };
  if (value < 80) return { label: "혼잡", color: "#B71C1C", bg: "#FFEBEE" };
  return { label: "매우 혼잡", color: "#B71C1C", bg: "#FFCDD2" };
}

export function CongestionBadge({ value, updatedAt }: Props) {
  const { label, color, bg } = getCongestionLabel(value);

  return (
    <div className="flex items-center gap-3">
      <div
        className="px-3 py-1 rounded-full flex items-center gap-2"
        style={{ backgroundColor: bg }}
      >
        <span
          className="w-2 h-2 rounded-full inline-block animate-pulse"
          style={{ backgroundColor: color }}
        />
        <span style={{ color, fontFamily: "var(--font-body)" }} className="text-sm font-medium">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-32 h-2 bg-[#EDE8E0] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${value}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <span className="text-xs text-[#7A6A5A] ml-1">{value}%</span>
      </div>
      <span className="text-xs text-[#7A6A5A]">업데이트 {updatedAt}</span>
    </div>
  );
}
