// Chart components for RunTrack using Recharts
import React from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface ChartProps {
  data: Array<{ name: string; value: number; [key: string]: unknown }>;
  title?: string;
  color?: string;
  unit?: string;
  className?: string;
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label, unit }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  unit?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-4 py-3 border border-brand-500/20">
        <p className="text-gray-400 text-xs font-body mb-1">{label}</p>
        <p className="text-white font-body font-semibold text-sm">
          {typeof payload[0].value === 'number' ? payload[0].value.toFixed(2) : payload[0].value}
          {unit ? ` ${unit}` : ''}
        </p>
      </div>
    );
  }
  return null;
};

// Area chart (distance/calories trends)
export const AreaChartCard: React.FC<ChartProps> = ({
  data, title, color = '#f97316', unit = 'km', className = ''
}) => {
  return (
    <div className={`glass rounded-2xl p-5 ${className}`}>
      {title && (
        <h3 className="font-body font-semibold text-white mb-4 text-sm uppercase tracking-widest text-gray-400">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6c757d', fontSize: 11, fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6c757d', fontSize: 11, fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color.replace('#', '')})`}
            dot={false}
            activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Bar chart (steps, weekly)
export const BarChartCard: React.FC<ChartProps> = ({
  data, title, color = '#f97316', unit = '', className = ''
}) => {
  return (
    <div className={`glass rounded-2xl p-5 ${className}`}>
      {title && (
        <h3 className="font-body font-semibold text-sm uppercase tracking-widest text-gray-400 mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6c757d', fontSize: 11, fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6c757d', fontSize: 11, fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Bar
            dataKey="value"
            fill={color}
            radius={[4, 4, 0, 0]}
            fillOpacity={0.85}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
