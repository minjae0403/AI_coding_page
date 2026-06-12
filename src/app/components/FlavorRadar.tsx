import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import type { FlavorProfile } from "./mockData";

interface Props {
  flavor: FlavorProfile;
  labels: Record<keyof FlavorProfile, string>;
  size?: number;
  color?: string;
}

export function FlavorRadar({ flavor, labels, size = 200, color = "#C4822A" }: Props) {
  const data = Object.entries(flavor).map(([key, value]) => ({
    subject: labels[key as keyof FlavorProfile],
    value,
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width={size} height={size}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="rgba(44,26,14,0.12)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 11, fill: "#7A6A5A", fontFamily: "var(--font-body)" }}
        />
        <Radar
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.18}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
