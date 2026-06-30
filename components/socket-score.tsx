"use client";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

export function SocketScore({ scores }: { scores: {supplyChain:number; security:number; quality:number; maintenance:number; license:number; vulnerability:number }}) {
  const data = [
    { metric: 'Supply', v: scores.supplyChain, full: 100 },
    { metric: 'Security', v: scores.security, full: 100 },
    { metric: 'Quality', v: scores.quality, full: 100 },
    { metric: 'Maint.', v: scores.maintenance, full: 100 },
    { metric: 'License', v: scores.license, full: 100 },
  ];
  return (
    <div className="h-[270px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#1e2533" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#7a8194', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
          <Radar name="Risk" dataKey="v" stroke="#00ff94" fill="#00ff94" fillOpacity={0.24} />
          <Radar name="max" dataKey="full" stroke="#1e2533" fill="transparent" />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
