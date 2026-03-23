import { BarChart, DonutChart, TrendChart } from "./DashboardCharts";

export default function AnalyticsView({ metrics, healthScores, formatNumber }) {
  const topStatus = metrics.statusDistribution[0];
  const topApplication = metrics.topApplications[0];
  const openRate = metrics.yearCount ? (metrics.openCount / Math.max(metrics.yearCount, 1)) * 100 : 0;

  return (
    <section className="content-view active">
      <div className="section-head">
        <div>
          <p className="eyebrow">Vista secundaria</p>
          <h3>Incident analytics</h3>
        </div>
        <div className="meta-chip">{metrics.openCount} abiertos | MTTR {metrics.averageMttrLabel}</div>
      </div>

      <div className="kpi-grid">
        <KpiCard label="Total incidents YTD" value={metrics.yearCount} note="Year-to-date volume" />
        <KpiCard label="Last 7 days" value={metrics.lastWeekCount} note="Recent activity window" />
        <KpiCard label="Open incidents" value={metrics.openCount} note={`${formatNumber(openRate, 0)}% del total anual`} />
        <KpiCard label="Avg. MTTR" value={metrics.averageMttrLabel} note="Mean resolution time" />
      </div>

      <article className="panel insights-panel">
        <div className="panel__header">
          <div className="insights-title">
            <span className="insights-mark">AI</span>
            <div>
              <h4>AI Insights</h4>
              <p className="eyebrow">Auto-generated</p>
            </div>
          </div>
        </div>
        <p className="insights-copy">
          Across {metrics.totalCount} incidents, {formatNumber(metrics.openRate * 100, 0)}% remain open. {topStatus ? `"${topStatus.label}" lidera con ${topStatus.value} tickets.` : "No dominant status detected."}
        </p>
        <div className="insights-grid">
          <div className="insight-card">
            <h5>Risk Modules</h5>
            <div className="insight-list">
              {metrics.topModules.slice(0, 2).map((item) => (
                <div key={item.label} className="insight-row"><span>{item.label}</span><strong>{item.value}</strong></div>
              ))}
            </div>
          </div>
          <div className="insight-card">
            <h5>Key Metrics</h5>
            <div className="insight-list">
              <div className="insight-row"><span>Total</span><strong>{metrics.totalCount}</strong></div>
              <div className="insight-row"><span>Open Rate</span><strong>{formatNumber(metrics.openRate * 100, 0)}%</strong></div>
              <div className="insight-row"><span>Top App</span><strong>{topApplication?.label || "N/A"}</strong></div>
            </div>
          </div>
          <div className="insight-card">
            <h5>Suggested Actions</h5>
            <ul className="insight-bullets">
              <li>Revisar los modulos con mayor volumen y backlog.</li>
              <li>Priorizar estados no terminales con antiguedad alta.</li>
              <li>Validar calidad de datos en tickets sin fecha o prioridad.</li>
            </ul>
          </div>
        </div>
      </article>

      <div className="analytics-grid">
        <article className="panel panel--wide" id="monthlyTrend">
          <div className="panel__header"><h4>Historia de tickets</h4></div>
          <TrendChart values={metrics.ticketTrend || []} />
        </article>
        <article className="panel">
          <div className="panel__header"><h4>Distribucion por estado</h4></div>
          <DonutChart counts={metrics.statusDistribution} />
        </article>
        <article className="panel">
          <div className="panel__header"><h4>Distribucion por prioridad</h4></div>
          <DonutChart counts={metrics.priorityDistribution} />
        </article>
        <article className="panel">
          <div className="panel__header"><h4>Top aplicaciones</h4></div>
          <BarChart items={metrics.topApplications} />
        </article>
        <article className="panel">
          <div className="panel__header"><h4>Top modulos</h4></div>
          <BarChart items={metrics.topModules} />
        </article>
        <article className="panel" id="techniciansWorkload">
          <div className="panel__header"><h4>Carga por tecnico</h4></div>
          <BarChart items={metrics.workloadByTechnician} />
        </article>
      </div>

      <div className="health-section" id="healthRanking">
        <div className="section-head">
          <div>
            <p className="eyebrow">Score de salud</p>
            <h3>Ranking por aplicacion</h3>
          </div>
        </div>
        <div className="health-ranking">
          {healthScores.length === 0 && <p className="eyebrow">No hay aplicaciones para calcular score.</p>}
          {healthScores.map((item) => (
            <article className="health-card" key={item.application}>
              <div>
                <h4>{item.application}</h4>
                <p className="eyebrow">{item.total} incidentes | {formatNumber(item.openRatio * 100, 0)}% abiertos | MTTR {formatNumber(item.mttr, 1)} h | {formatNumber(item.highPriorityRatio * 100, 0)}% alta prioridad</p>
              </div>
              <div className="health-card__score">
                <span className={`score-pill ${item.band}`}>{formatNumber(item.score, 0)}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function KpiCard({ label, value, note }) {
  return <article className="kpi-card"><p className="eyebrow">{label}</p><strong>{value}</strong><small className="kpi-note">{note}</small></article>;
}
