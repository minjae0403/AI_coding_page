import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import type { FlavorProfile } from "./mockData";

interface Props {
  flavor: FlavorProfile;
  labels: Record<keyof FlavorProfile, string>;
  size?: number;
  color?: string;
}

export function FlavorRadar({ flavor, labels, size = 200, color = "#C4822A" }: Props) {
  const data = (Object.keys(flavor) as Array<keyof FlavorProfile>).map((key) => ({
    subject: labels[key],
    value: flavor[key],
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width={size} height={size}>
      <RadarChart data={data} margin={{ top: 10, right: 24, bottom: 10, left: 24 }}>
        <PolarGrid stroke="rgba(44,26,14,0.1)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 10, fill: "#7A6A58", fontFamily: "var(--font-body)" }}
        />
        <Radar
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.16}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
