import { useMemo, useState } from "react";

export function TrendChart({ values }) {
  const [activeIndex, setActiveIndex] = useState(null);
  if (!values.length) return <div className="chart-area"><p className="eyebrow">No hay fechas suficientes para la tendencia.</p></div>;
  const max = Math.max(...values.map((item) => item.value), 1);
  const width = Math.max(760, values.length * 58);
  const height = 280;
  const paddingLeft = 44;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 44;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const step = values.length > 1 ? plotWidth / (values.length - 1) : plotWidth / 2;
  const points = values.map((item, index) => {
    const x = paddingLeft + index * step;
    const y = paddingTop + (1 - item.value / max) * plotHeight;
    return { x, y, label: item.label, value: item.value };
  });
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = `${paddingLeft},${height - paddingBottom} ${polyline} ${paddingLeft + (values.length - 1) * step},${height - paddingBottom}`;
  const yTicks = Array.from({ length: 5 }, (_, index) => Math.round((max / 4) * index)).reverse();
  const activePoint = activeIndex == null ? null : points[activeIndex];

  return (
    <div className="chart-area chart-area--trend">
      <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="trendStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b6cff" />
            <stop offset="100%" stopColor="#4da3ff" />
          </linearGradient>
          <linearGradient id="trendArea" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(59,130,246,0.36)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0.03)" />
          </linearGradient>
        </defs>
        {yTicks.map((tickValue, index) => {
          const y = paddingTop + (plotHeight / Math.max(yTicks.length - 1, 1)) * index;
          return (
            <g key={`grid-${tickValue}`}>
              <line
                x1={paddingLeft}
                x2={width - paddingRight}
                y1={y}
                y2={y}
                stroke="rgba(126,138,163,0.08)"
                strokeDasharray="2 6"
              />
              <text x={paddingLeft - 8} y={y + 4} fill="#8b94aa" fontSize="7" fontWeight="500" textAnchor="end">{tickValue}</text>
            </g>
          );
        })}
        {points.map((point) => (
          <line
            key={`v-${point.label}`}
            x1={point.x}
            x2={point.x}
            y1={paddingTop}
            y2={height - paddingBottom}
            stroke="rgba(126,138,163,0.05)"
            strokeDasharray="2 6"
          />
        ))}
        <line x1={paddingLeft} x2={paddingLeft} y1={paddingTop} y2={height - paddingBottom} stroke="rgba(126,138,163,0.42)" strokeWidth="1.2" />
        <line x1={paddingLeft} x2={width - paddingRight} y1={height - paddingBottom} y2={height - paddingBottom} stroke="rgba(126,138,163,0.42)" strokeWidth="1.2" />
        <polygon fill="url(#trendArea)" points={areaPoints} />
        <polyline fill="none" stroke="url(#trendStroke)" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" points={polyline} />
        {points.map((point, index) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r={activeIndex === index ? "6" : "4"} fill="#171b24" stroke="#3b82f6" strokeWidth={activeIndex === index ? "3" : "2.4"} />
            <text x={point.x} y={point.y - 14} fill="#dbe4f5" fontSize="8" fontWeight="700" textAnchor="middle">{point.value}</text>
            <text x={point.x} y={height - 12} fill="#97a3bb" fontSize="7" fontWeight="500" textAnchor="middle">{formatMonthLabel(point.label)}</text>
            <circle
              cx={point.x}
              cy={point.y}
              r="14"
              fill="transparent"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            />
          </g>
        ))}
      </svg>
      {activePoint && (
        <div className="trend-tooltip" style={{ left: `${((activePoint.x / width) * 100).toFixed(2)}%`, top: `${((activePoint.y / height) * 100).toFixed(2)}%` }}>
          <strong>{activePoint.value} tickets</strong>
          <span>{formatMonthLabel(activePoint.label)}</span>
        </div>
      )}
    </div>
  );
}

export function DonutChart({ counts, compact = false }) {
  const entries = counts;
  if (!entries.length) return <div className="chart-area"><p className="eyebrow">No hay datos para mostrar.</p></div>;

  const total = entries.reduce((sum, item) => sum + item.value, 0);
  const colors = ["#1b84ff", "#22a06b", "#f59e0b", "#e5484d", "#8b5cf6", "#14b8a6"];
  let acc = 0;
  const segments = entries.map(({ label, value }, index) => {
    const start = acc / total;
    acc += value;
    return { name: label, value, start, end: acc / total, color: colors[index % colors.length] };
  });

  return (
    <div className={`chart-area donut-layout ${compact ? "donut-layout--compact" : ""}`}>
      <svg className="donut-chart" viewBox="0 0 280 280">
        {segments.map((segment) => <path key={segment.name} d={donutPath(segment.start, segment.end, 140, 140, 102)} fill="none" stroke={segment.color} strokeWidth="34" strokeLinecap="round" />)}
        <circle cx="140" cy="140" r="64" fill="var(--panel-solid)" />
        <text x="140" y="134" textAnchor="middle" fill="var(--muted)" fontSize="14">Total</text>
        <text x="140" y="160" textAnchor="middle" fill="var(--text)" fontSize="26" fontWeight="800">{total}</text>
      </svg>
      <div className="donut-legend">
        {segments.map((segment) => (
          <div key={segment.name} className="donut-legend__row">
            <span className="donut-legend__label"><i style={{ background: segment.color }} />{segment.name}</span>
            <strong>{segment.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BarChart({ items }) {
  if (!items.length) return <div className="chart-area"><p className="eyebrow">No hay datos para mostrar.</p></div>;
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="chart-area">
      <div className="bar-list">
        {items.map((item) => (
          <div className="bar-row" key={item.label}>
            <div className="bar-row__label">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <div className="bar-track"><span style={{ width: `${(item.value / max) * 100}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MiniSparkline({ values, color = "#3b82f6" }) {
  const points = useMemo(() => {
    if (!values?.length) return "";
    const width = 88;
    const height = 24;
    const max = Math.max(...values, 1);
    return values.map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    }).join(" ");
  }, [values]);

  if (!values?.length) return null;

  return (
    <svg className="mini-sparkline" viewBox="0 0 88 24" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2.1" strokeLinejoin="round" strokeLinecap="round" points={points} />
    </svg>
  );
}

function donutPath(start, end, centerX = 120, centerY = 120, radius = 88) {
  const startAngle = end * 360;
  const endAngle = start * 360;
  const startPoint = polarToCartesian(centerX, centerY, radius, startAngle);
  const endPoint = polarToCartesian(centerX, centerY, radius, endAngle);
  const arcFlag = end - start > 0.5 ? 1 : 0;
  return `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${arcFlag} 0 ${endPoint.x} ${endPoint.y}`;
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const radians = ((angleInDegrees - 90) * Math.PI) / 180;
  return { x: centerX + radius * Math.cos(radians), y: centerY + radius * Math.sin(radians) };
}

function formatMonthLabel(label) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) return label;
  const [year, month] = label.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("es-PE", { month: "short", year: "2-digit" }).format(date);
}
