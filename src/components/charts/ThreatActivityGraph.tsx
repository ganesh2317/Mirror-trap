import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

interface DataPoint {
  timestamp: string;
  count: number;
  severity?: string;
}

interface ThreatActivityGraphProps {
  data?: DataPoint[];
  className?: string;
}

function generateDemoData(hours: number): DataPoint[] {
  const now = Date.now();
  const points: DataPoint[] = [];
  const interval = (hours * 60 * 60 * 1000) / 24;
  for (let i = 24; i >= 0; i--) {
    const ts = new Date(now - i * interval).toISOString();
    const base = Math.floor(Math.random() * 8);
    const spike = Math.random() > 0.85 ? Math.floor(Math.random() * 15 + 5) : 0;
    points.push({ timestamp: ts, count: base + spike });
  }
  return points;
}

function relativeLabel(iso: string, rangeHours: number): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = diff / 3600000;
  if (hrs < 0.5) return 'now';
  if (rangeHours <= 24) {
    return `${Math.round(hrs)}h ago`;
  }
  const days = hrs / 24;
  return `${Math.round(days)}d ago`;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 shadow-xl">
      <div className="text-xs text-text-muted">{label}</div>
      <div className="mt-1 font-mono text-lg font-bold text-indigo-400">
        {payload[0].value}
      </div>
      <div className="text-xs text-text-muted">threats detected</div>
    </div>
  );
};

export function ThreatActivityGraph({ data, className }: ThreatActivityGraphProps) {
  const [range, setRange] = useState<'24h' | '7d' | '30d'>('24h');

  const rangeHours = range === '24h' ? 24 : range === '7d' ? 168 : 720;
  const chartData = useMemo(() => {
    const base = data ?? generateDemoData(rangeHours);
    return base.map((d) => ({
      time: relativeLabel(d.timestamp, rangeHours),
      count: d.count,
    }));
  }, [data, rangeHours]);


  return (
    <div className={cn(className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Threat activity
        </div>
        <div className="flex gap-1 rounded-lg border p-0.5" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(15,23,36,0.5)' }}>
          {(['24h', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-semibold transition-all',
                range === r
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-text-muted hover:text-text-secondary',
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#475569', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#475569', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.3)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#6366F1"
              strokeWidth={2}
              fill="url(#threatGradient)"
              dot={false}
              activeDot={{ r: 5, fill: '#6366F1', stroke: '#818CF8', strokeWidth: 2, style: { filter: 'drop-shadow(0 0 6px #6366F1)' } }}
              isAnimationActive
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
