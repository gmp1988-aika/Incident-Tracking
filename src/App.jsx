import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { BarChart, DonutChart, MiniSparkline, TrendChart } from "./DashboardCharts";
import CapaciTrackModule, { SEED_MILESTONES, SEED_PEOPLE, SEED_PROJECTS, SEED_ROLES } from "./CapaciTrackModule";
import MastersModule from "./MastersModule";

const loadUploaderModal = () => import("./UploaderModal");

const UploaderModal = lazy(loadUploaderModal);

const REQUIRED_COLUMNS = [];
const COLUMN_ALIASES = {
  id: ["id", "incident_id", "case_id"],
  ticket: ["ticket", "ticket_id", "incident", "incident_number", "numero_ticket", "number"],
  subject: ["subject", "title", "summary", "asunto"],
  application: ["application", "app", "aplicacion", "aplicación", "service", "system"],
  module: ["module", "modulo", "módulo", "component", "submodule"],
  classification: ["classification", "clasificacion", "clasificación", "category", "type"],
  technician: ["technician", "assigned_to", "owner", "analyst", "resolver", "tecnico", "técnico", "assignee"],
  priority: ["priority", "prioridad", "severity", "impact"],
  status: ["status", "estado", "state", "incident_status", "current_status", "estatus", "work_order_status", "ticket_status", "case_status", "status_incidente", "estado_actual", "incident_state"],
  description: ["description", "detalle", "details", "descripcion", "descripción"],
  solution: ["solution", "resolution", "resolucion", "resolución", "fix"],
  created_date: ["created_date", "created", "opened_at", "creation_date", "fecha_creacion", "fecha de creacion", "fecha de creación"],
  last_updated_date: ["last_updated_date", "updated_at", "closed_at", "resolved_at", "last_update", "fecha_actualizacion", "fecha de actualizacion", "fecha de actualización"],
};
const TABLE_COLUMNS = [
  { key: "ticket", label: "Ticket" },
  { key: "subject", label: "Subject" },
  { key: "application", label: "Aplicacion" },
  { key: "module", label: "Modulo" },
  { key: "technician", label: "Tecnico" },
  { key: "status", label: "Estado" },
  { key: "priority", label: "Prioridad" },
  { key: "createdDateLabel", label: "Fecha creacion" },
];

const TERMINAL_STATUSES = new Set(["closed", "cancelled", "validado", "cerrado"]);

const defaultTable = {
  page: 1,
  pageSize: 10,
  sortBy: "createdTimestamp",
  sortDir: "desc",
  search: "",
  inlineFilters: {},
  quickFilter: "all",
};

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: "grid" },
  { key: "applications", label: "Applications Health", icon: "pulse" },
  { key: "trends", label: "Incident Trends", icon: "trend" },
  { key: "technicians", label: "Technicians", icon: "users" },
  { key: "quality", label: "Data Quality", icon: "shield" },
];
const PLATFORM_MODULES = [
  { key: "incidents", label: "Incidentes" },
  { key: "projects", label: "Proyectos" },
  { key: "masters", label: "Maestros" },
];

const AI_INSIGHTS_STORAGE_KEY = "incident-tracking-ai-insights";
const AUTH_STORAGE_KEY = "incident-tracking-auth";
const DEMO_CREDENTIALS = { username: "gerardomorales", password: "0112358B3l" };

export default function App() {
  const [records, setRecords] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [filters, setFilters] = useState(() => createDefaultFilters());
  const [table, setTable] = useState(defaultTable);
  const [datasetMode, setDatasetMode] = useState("demo");
  const [validation, setValidation] = useState(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [trendGrouping, setTrendGrouping] = useState("month");
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [activeModule, setActiveModule] = useState("incidents");
  const [masterPeople, setMasterPeople] = useState(() => SEED_PEOPLE.map((person) => ({ ...person, area: person.area || "" })));
  const [masterProjects, setMasterProjects] = useState(() => SEED_PROJECTS.map((project) => ({
    ...project,
    product_owner_id: project.product_owner_id || SEED_PEOPLE[0]?.id || "",
    it_owner_id: project.it_owner_id || SEED_PEOPLE[0]?.id || "",
  })));
  const [masterMilestones, setMasterMilestones] = useState(() => SEED_MILESTONES);
  const [masterRoles] = useState(() => SEED_ROLES);
  const [savedInsightsText, setSavedInsightsText] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: DEMO_CREDENTIALS.username, password: "" });
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const stored = window.localStorage.getItem(AI_INSIGHTS_STORAGE_KEY);
    if (stored == null) return;
    setSavedInsightsText(stored);
  }, []);

  useEffect(() => {
    setIsAuthenticated(window.sessionStorage.getItem(AUTH_STORAGE_KEY) === "1");
  }, []);

  const filteredRecords = filterRecords(records, filters);
  const healthScores = computeHealthScores(filteredRecords);
  const metrics = computeMetrics(filteredRecords, trendGrouping);
  const filterOptions = {
    application: uniqueValues(records, "application"),
    module: uniqueValues(records, "module"),
    classification: uniqueValues(records, "classification"),
    priority: uniqueValues(records, "priority"),
    status: uniqueValues(records, "status").filter((value) => value !== "Todos"),
    technician: uniqueValues(records, "technician"),
  };
  const tableResult = buildTableRows(filteredRecords, table);
  const incompleteVisible = filteredRecords.filter((record) => record.isIncomplete).length;
  const averageHealth = healthScores.length ? average(healthScores.map((item) => item.score)) : 0;
  const generatedInsights = buildInsights(metrics, healthScores);
  const generatedInsightsText = generatedInsights.join("\n\n");
  const insightsText = savedInsightsText ?? generatedInsightsText;

  function applyDataset(rows, sourceName) {
    const nextValidation = validateColumns(rows);
    setValidation({ ...nextValidation, sourceName });
    setRecords(deduplicateRecords(rows.map(normalizeRow)));
    setDatasetMode(sourceName === "Dataset demo" ? "demo" : "upload");
    setTable((current) => ({ ...current, page: 1, inlineFilters: {}, search: "" }));
    setFilters(createDefaultFilters());
  }

  async function handleFile(file) {
    try {
      const extension = (file.name.split(".").pop() || "").toLowerCase();
      const XLSX = await loadXlsx();
      let workbook;
      if (extension === "csv") {
        workbook = XLSX.read(await file.text(), { type: "string" });
      } else {
        workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false });
      }
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
        raw: false,
        dateNF: "dd/mm/yyyy",
      });
      applyDataset(rows, file.name);
      setIsUploaderOpen(false);
    } catch (error) {
      setValidation({ errors: [error.message || "No se pudo procesar el archivo."], warnings: [], sourceName: file.name });
    }
  }

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
    setTable((current) => ({ ...current, page: 1 }));
  }

  function navigateTo(section) {
    setActiveSection(section);
    requestAnimationFrame(() => {
      const targetId = {
        overview: "dashboardTop",
        applications: "distributionSection",
        trends: "historySection",
        technicians: "techniciansWorkload",
        quality: "highlightsSection",
      }[section];
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function applyTableQuickFilter(quickFilter) {
    setTable((current) => ({ ...current, page: 1, quickFilter }));
    requestAnimationFrame(() => {
      document.getElementById("ticketsTable")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function saveInsights() {
    const next = insightsText;
    setSavedInsightsText(next);
    window.localStorage.setItem(AI_INSIGHTS_STORAGE_KEY, next);
  }

  function resetInsights() {
    setSavedInsightsText(null);
    window.localStorage.removeItem(AI_INSIGHTS_STORAGE_KEY);
  }

  function handleLoginSubmit(event) {
    event.preventDefault();
    const username = loginForm.username.trim();
    const password = loginForm.password;
    if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
      window.sessionStorage.setItem(AUTH_STORAGE_KEY, "1");
      setIsAuthenticated(true);
      setLoginError("");
      return;
    }
    setLoginError("Credenciales invalidas.");
  }

  function logout() {
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
  }

  if (!isAuthenticated) {
    return (
      <section className="login-screen">
        <div className="login-card">
          <div className="login-card__brand">
            <span className="brand-mark">PM+</span>
            <div>
              <p className="eyebrow">Workspace</p>
              <h1>PM+</h1>
            </div>
          </div>
          <div className="login-card__copy">
            <h2>Accede a tu workspace</h2>
            <p>Ingresa para cargar incidentes, analizar tendencias y gestionar la salud operativa de tus aplicaciones.</p>
          </div>
          <form className="login-form" onSubmit={handleLoginSubmit}>
            <label className="chip-field">
              <span className="chip-field__label">Usuario</span>
              <input
                type="text"
                value={loginForm.username}
                onChange={(event) => setLoginForm((current) => ({ ...current, username: event.target.value }))}
                placeholder=""
              />
            </label>
            <label className="chip-field">
              <span className="chip-field__label">Password</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                placeholder=""
              />
            </label>
            {loginError && <p className="login-error">{loginError}</p>}
            <button className="primary-button login-form__submit" type="submit">Ingresar</button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className={`app-shell ${isSidebarCollapsed ? "is-sidebar-collapsed" : ""}`}>
        <aside className={`sidebar ${isSidebarCollapsed ? "is-collapsed" : ""}`} id="sidebar">
          <div className="sidebar__brand">
            <div className="brand-mark">PM+</div>
            <div>
              <p className="eyebrow">Workspace</p>
              <h1>PM+</h1>
            </div>
          </div>

          <button className="sidebar__toggle" onClick={() => setIsSidebarCollapsed((current) => !current)} aria-label="Colapsar sidebar">
            <span className={`sidebar__toggle-icon ${isSidebarCollapsed ? "is-collapsed" : ""}`} aria-hidden="true" />
          </button>

          <nav className="sidebar__nav">
            <div className="sidebar__module-switch">
              {PLATFORM_MODULES.map((module) => (
                <button
                  key={module.key}
                  className={`sidebar__module-button ${activeModule === module.key ? "active" : ""}`}
                  onClick={() => setActiveModule(module.key)}
                >
                  {module.label}
                </button>
              ))}
            </div>
            <p className="sidebar__label">Navigation</p>
            {activeModule === "incidents" && NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                className={`nav-link ${activeSection === item.key ? "active" : ""}`}
                onClick={() => navigateTo(item.key)}
              >
                <span className={`nav-link__icon nav-link__icon--${item.icon}`} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            ))}
            {activeModule === "projects" && (
              <div className="sidebar__module-copy">
                <p>CapaciTrack centraliza capacidad, portafolio, costos y notas operativas.</p>
              </div>
            )}
            {activeModule === "masters" && (
              <div className="sidebar__module-copy">
                <p>Administra personas, proyectos y hitos base para el portafolio.</p>
              </div>
            )}
          </nav>

          <section className="sidebar__summary">
            <p className="eyebrow">Estado</p>
            <div className="health-pill">{averageHealth >= 75 ? "Salud saludable" : averageHealth >= 50 ? "Salud en atencion" : "Salud critica"}</div>
            <p className="sidebar__copy">{filteredRecords.length} incidentes visibles, {incompleteVisible} incompletos y {healthScores[0]?.application || "sin ranking"} como referencia principal.</p>
          </section>
        </aside>

        <main className="main-panel">
          <header className="topbar" id="dashboardTop">
            <div className="topbar__controls">
              {activeModule === "incidents" && <button className="ghost-button" onClick={() => setIsUploaderOpen(true)}>Cargar Excel</button>}
              <button className="theme-toggle" onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))} aria-label="Cambiar tema">
                <span className="theme-toggle__icon" aria-hidden="true" />
              </button>
              <button className="theme-toggle theme-toggle--user" aria-label="Cerrar sesion" onClick={logout}>
                U
              </button>
            </div>
          </header>

          {activeModule === "projects" ? (
            <CapaciTrackModule
              masterProjects={masterProjects}
              setMasterProjects={setMasterProjects}
              masterPeople={masterPeople}
              masterMilestones={masterMilestones}
            />
          ) : activeModule === "masters" ? (
            <MastersModule
              people={masterPeople}
              setPeople={setMasterPeople}
              projects={masterProjects}
              setProjects={setMasterProjects}
              milestones={masterMilestones}
              setMilestones={setMasterMilestones}
              roles={masterRoles}
            />
          ) : records.length === 0 ? (
            <section className="empty-workspace">
              <div className="empty-workspace__icon" aria-hidden="true">
                <span className="empty-workspace__bars" />
              </div>
              <div className="empty-workspace__copy">
                <h3>Monitorea la salud de tus aplicaciones</h3>
                <p>Carga tu archivo de incidentes para generar analytics en tiempo real, insights automaticos y scoring de salud.</p>
              </div>
              <button className="empty-workspace__dropzone" onClick={() => setIsUploaderOpen(true)}>
                <span className="empty-workspace__upload-icon" aria-hidden="true" />
                <strong>Arrastra tu archivo Excel aqui</strong>
                <span>o haz clic para seleccionar</span>
                <small>.xlsx &nbsp; .xls &nbsp; .csv</small>
              </button>
              <button className="empty-workspace__demo" onClick={() => applyDataset(createDemoRows(), "Dataset demo")}>o usar datos demo →</button>
            </section>
          ) : (
          <>
          <section className="toolbar">
            <div className="toolbar__header">
              <span className="toolbar__caption">Filtros principales</span>
              <button className={`ghost-button ghost-button--compact ${isAdvancedFiltersOpen ? "is-active" : ""}`} onClick={() => setIsAdvancedFiltersOpen((current) => !current)}>
                Filtros avanzados
              </button>
            </div>
            <div className="toolbar__primary">
              <label className="chip-field">
                <span className="chip-field__label">Fecha creacion desde</span>
                <input type="date" value={filters.dateFrom} onChange={(event) => updateFilter("dateFrom", event.target.value)} />
              </label>
              <label className="chip-field">
                <span className="chip-field__label">Fecha creacion hasta</span>
                <input type="date" value={filters.dateTo} onChange={(event) => updateFilter("dateTo", event.target.value)} />
              </label>
            </div>
            {isAdvancedFiltersOpen && (
              <div className="filter-chips filter-chips--advanced">
                <FilterSelect compact label="Aplicacion" value={filters.application} options={filterOptions.application} onChange={(value) => updateFilter("application", value)} />
                <FilterSelect compact label="Modulo" value={filters.module} options={filterOptions.module} onChange={(value) => updateFilter("module", value)} />
                <FilterSelect compact label="Clasificacion" value={filters.classification} options={filterOptions.classification} onChange={(value) => updateFilter("classification", value)} />
                <FilterSelect compact label="Tecnico" value={filters.technician} options={filterOptions.technician} onChange={(value) => updateFilter("technician", value)} />
                <FilterSelect compact label="Prioridad" value={filters.priority} options={filterOptions.priority} onChange={(value) => updateFilter("priority", value)} />
                <StatusMultiSelect compact label="Estado" values={filters.status} options={filterOptions.status} onChange={(value) => updateFilter("status", value)} />
              </div>
            )}
          </section>

          <section className="content-view active">
              <section className="ops-grid">
                <article className="ops-card ops-card--kpi ops-card--blue">
                  <div className="ops-card__meta">
                    <span className="ops-card__icon" aria-hidden="true">|</span>
                    <p className="eyebrow">Total tickets</p>
                  </div>
                  <strong>{metrics.totalCount}</strong>
                  <span className="ops-card__note">{formatDelta(metrics.totalDelta)} vs periodo anterior</span>
                  <div className="ops-card__sparkline"><MiniSparkline values={metrics.totalSparkline} color="#2f81f7" /></div>
                </article>
                <article className="ops-card ops-card--kpi ops-card--amber" role="button" tabIndex={0} onClick={() => applyTableQuickFilter("open")} onKeyDown={(event) => event.key === "Enter" && applyTableQuickFilter("open")}>
                  <div className="ops-card__meta">
                    <span className="ops-card__icon" aria-hidden="true">~</span>
                    <p className="eyebrow">Tickets abiertos</p>
                  </div>
                  <strong>{metrics.openCount}</strong>
                  <span className="ops-card__note">{formatDelta(metrics.openDelta)} vs periodo anterior</span>
                  <div className="ops-card__sparkline"><MiniSparkline values={metrics.openSparkline} color="#f59e0b" /></div>
                </article>
                <article className="ops-card ops-card--kpi ops-card--red" role="button" tabIndex={0} onClick={() => applyTableQuickFilter("criticalOpen")} onKeyDown={(event) => event.key === "Enter" && applyTableQuickFilter("criticalOpen")}>
                  <div className="ops-card__meta">
                    <span className="ops-card__icon" aria-hidden="true">!</span>
                    <p className="eyebrow">Criticos abiertos</p>
                  </div>
                  <strong>{metrics.criticalOpenCount}</strong>
                  <span className="ops-card__note">{formatDelta(metrics.criticalDelta)} vs periodo anterior</span>
                  <div className="ops-card__sparkline"><MiniSparkline values={metrics.criticalSparkline} color="#ef4444" /></div>
                </article>
                <article className="ops-card ops-card--chart" id="distributionSection">
                  <div className="ops-card__head">
                    <p className="eyebrow">Distribucion por status</p>
                  </div>
                  <DonutChart counts={metrics.statusDistribution} compact />
                </article>
              </section>

              <section className="ops-history" id="historySection">
                <div className="section-head">
                  <div>
                    <p className="eyebrow">Historico de tickets</p>
                    <h3>Tickets creados</h3>
                  </div>
                  <div className="view-switcher">
                    <button className={`view-button ${trendGrouping === "month" ? "active" : ""}`} onClick={() => setTrendGrouping("month")}>Mes</button>
                    <button className={`view-button ${trendGrouping === "week" ? "active" : ""}`} onClick={() => setTrendGrouping("week")}>Semana</button>
                  </div>
                </div>
                <article className="panel">
                    <div className="panel__header"><h4>Historia de tickets</h4></div>
                    <TrendChart values={metrics.ticketTrend} />
                  </article>
              </section>

              <section className="ops-distribution">
                <div className="section-head">
                  <div>
                    <p className="eyebrow">Distribucion operativa</p>
                    <h3>Tickets por dominio operativo</h3>
                  </div>
                </div>
                <div className="ops-distribution__grid">
                  <article className="panel">
                    <div className="panel__header"><h4>Tickets por modulo</h4></div>
                    <BarChart items={metrics.topModules} />
                  </article>
                  <article className="panel" id="techniciansWorkload">
                    <div className="panel__header"><h4>Tickets por tecnico</h4></div>
                    <BarChart items={metrics.workloadByTechnician} />
                  </article>
                </div>
              </section>

              <section className="panel highlights-panel-main ai-insights-card" id="highlightsSection">
                <div className="section-head">
                  <div className="ai-insights__title">
                    <span className="ai-insights__icon">AI</span>
                    <div>
                      <p className="eyebrow">AI Insights</p>
                      <h3>Analisis automatico inteligente</h3>
                    </div>
                  </div>
                  <div className="ai-insights__actions">
                    <button className="ghost-button ghost-button--compact" onClick={resetInsights}>Restaurar</button>
                    <button className="ghost-button ghost-button--compact is-active" onClick={saveInsights}>Guardar</button>
                  </div>
                </div>
                <textarea
                  className="ai-insights__editor"
                  value={insightsText}
                  onChange={(event) => setSavedInsightsText(event.target.value)}
                />
              </section>

              <div className="section-head">
                <div>
                  <p className="eyebrow">Vista operativa</p>
                  <h3>Tabla de incidentes</h3>
                </div>
              </div>
              <div className="table-wrapper" id="ticketsTable">
                <div className="table-header">
                  <div>
                    <h4>Incidentes</h4>
                  </div>
                  <div className="table-tools">
                    {table.quickFilter !== "all" && (
                      <button className="ghost-button ghost-button--compact" onClick={() => setTable((current) => ({ ...current, page: 1, quickFilter: "all" }))}>
                        Limpiar filtro rapido
                      </button>
                    )}
                    <span className="table-count">{tableResult.totalRows} registros</span>
                    <div className="table-search">
                      <input
                        id="tableSearch"
                        type="search"
                        placeholder="Buscar..."
                        value={table.search}
                        onChange={(event) => setTable((current) => ({ ...current, search: event.target.value.toLowerCase(), page: 1 }))}
                      />
                    </div>
                  </div>
                </div>
                <table className="incident-table">
                  <thead>
                    <tr>
                      {TABLE_COLUMNS.map((column) => (
                        <th key={column.key}>
                          <button
                            className="sort-button"
                            onClick={() => setTable((current) => ({
                              ...current,
                              sortBy: column.key,
                              sortDir: current.sortBy === column.key && current.sortDir === "asc" ? "desc" : "asc",
                            }))}
                          >
                            {column.label}
                            <span>{table.sortBy === column.key ? (table.sortDir === "asc" ? "^" : "v") : "<>"}</span>
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableResult.pageRows.length === 0 && (
                      <tr>
                        <td colSpan={TABLE_COLUMNS.length}>No hay registros para los filtros actuales.</td>
                      </tr>
                    )}
                    {tableResult.pageRows.map((record) => (
                      <tr key={record.uid}>
                        <td>
                          {isUrl(record.ticket) ? (
                            <button className="ticket-link-button" onClick={() => window.open(record.ticket, "_blank", "noopener,noreferrer")}>
                              Abrir ticket
                            </button>
                          ) : (
                            record.ticket
                          )}
                        </td>
                        <td>{record.subject}</td>
                        <td>{record.application}</td>
                        <td>{record.module}</td>
                        <td>{record.technician}</td>
                        <td><span className={`tag status-tag ${statusClass(record.status)}`}>{record.status}</span></td>
                        <td><span className={`tag ${priorityClass(record.priority)}`}>{record.priority}</span></td>
                        <td>{record.createdDateLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pagination">
                <span>Pagina {tableResult.page} de {tableResult.totalPages} | {tableResult.totalRows} registros</span>
                <div className="pagination__buttons">
                  <button className="ghost-button" disabled={tableResult.page === 1} onClick={() => setTable((current) => ({ ...current, page: current.page - 1 }))}>Anterior</button>
                  <button className="ghost-button" disabled={tableResult.page === tableResult.totalPages} onClick={() => setTable((current) => ({ ...current, page: current.page + 1 }))}>Siguiente</button>
                </div>
              </div>
          </section>
          </>
          )}
        </main>
      </div>

      {activeModule === "incidents" && isUploaderOpen && (
        <Suspense fallback={<UploaderFallback onClose={() => setIsUploaderOpen(false)} />}>
          <UploaderModal onClose={() => setIsUploaderOpen(false)} onDemo={() => { applyDataset(createDemoRows(), "Dataset demo"); setIsUploaderOpen(false); }} onFile={handleFile} />
        </Suspense>
      )}
    </>
  );
}

function FilterSelect({ label, value, options, onChange, compact = false }) {
  return (
    <label className={compact ? "filter-chip" : ""}>
      <span>{label}</span>
      <select className="filter-chip__select" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function StatusMultiSelect({ label, values, options, onChange, compact = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [openUpward, setOpenUpward] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function handleOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const estimatedMenuHeight = 260;
    setOpenUpward(rect.bottom + estimatedMenuHeight > window.innerHeight && rect.top > estimatedMenuHeight);
  }, [isOpen]);

  const filteredOptions = options.filter((option) => option.toLowerCase().includes(query.toLowerCase()));
  const summary = values.length === 0 ? "Todos" : values.length <= 2 ? values.join(", ") : `${values.length} seleccionados`;

  function toggleValue(option) {
    if (values.includes(option)) {
      onChange(values.filter((value) => value !== option));
    } else {
      onChange([...values, option]);
    }
  }

  return (
    <div ref={rootRef} className={compact ? "filter-chip filter-chip--multi combobox" : "combobox"}>
      <span>{label}</span>
      <button type="button" className="combobox__trigger" onClick={() => setIsOpen((current) => !current)} aria-expanded={isOpen}>
        <span className="combobox__value">{summary}</span>
        <span className="combobox__caret">v</span>
      </button>
      {values.length > 0 && (
        <div className="combobox__tags">
          {values.slice(0, 2).map((value) => (
            <span key={value} className="combobox__tag">
              {value}
              <button type="button" onClick={() => toggleValue(value)} aria-label={`Quitar ${value}`}>x</button>
            </span>
          ))}
          {values.length > 2 && <span className="combobox__more">+{values.length - 2}</span>}
        </div>
      )}
      {isOpen && (
        <div className={`combobox__menu ${openUpward ? "combobox__menu--upward" : ""}`}>
          <input
            className="combobox__search"
            type="search"
            placeholder="Buscar estado"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="combobox__actions">
            <button type="button" onClick={() => onChange([])}>Limpiar</button>
            <button type="button" onClick={() => onChange(filteredOptions)}>Seleccionar visibles</button>
          </div>
          <div className="combobox__options">
            {filteredOptions.length === 0 && <span className="combobox__empty">Sin coincidencias</span>}
            {filteredOptions.map((option) => (
              <label key={option} className="combobox__option">
                <input type="checkbox" checked={values.includes(option)} onChange={() => toggleValue(option)} />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UploaderFallback({ onClose }) {
  return (
    <div className="uploader-modal" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="uploader-card">
        <div className="uploader-card__header">
          <div>
            <p className="eyebrow">PM+</p>
            <h3>Cargar archivo Excel</h3>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">X</button>
        </div>
        <div className="dropzone">
          <p>Cargando modulo de importacion...</p>
          <small>Preparando el parser y los controles de carga.</small>
        </div>
        <div className="uploader-card__actions">
          <button className="ghost-button" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function filterRecords(records, filters) {
  return records.filter((record) => {
    const blob = [record.uid, record.ticket, record.subject, record.application, record.module, record.technician, record.status, record.description].join(" ").toLowerCase();
    const matchesSearch = !filters.search || blob.includes(filters.search);
    const matchesDateRange = matchesCreatedDate(record.createdDate, filters.dateFrom, filters.dateTo);
    return matchesSearch &&
      matchesDateRange &&
      (filters.application === "Todos" || record.application === filters.application) &&
      (filters.module === "Todos" || record.module === filters.module) &&
      (filters.classification === "Todos" || record.classification === filters.classification) &&
      (filters.priority === "Todos" || record.priority === filters.priority) &&
      (filters.status.length === 0 || filters.status.includes(record.status)) &&
      (filters.technician === "Todos" || record.technician === filters.technician);
  });
}

function buildTableRows(records, table) {
  const filtered = records.filter((record) => {
    const tableMatch = !table.search || TABLE_COLUMNS.some((column) => String(record[column.key] || "").toLowerCase().includes(table.search));
    const inlineMatch = Object.entries(table.inlineFilters).every(([key, value]) => !value || String(record[key] || "").toLowerCase().includes(value));
    const quickMatch = table.quickFilter === "all"
      || (table.quickFilter === "open" && !isTerminalStatus(record.status))
      || (table.quickFilter === "criticalOpen" && !isTerminalStatus(record.status) && isCriticalPriority(record.priority));
    return tableMatch && inlineMatch && quickMatch;
  });
  const sorted = [...filtered].sort((left, right) => compareRecords(left, right, table.sortBy, table.sortDir));
  const totalPages = Math.max(1, Math.ceil(sorted.length / table.pageSize));
  const safePage = Math.min(table.page, totalPages);
  const start = (safePage - 1) * table.pageSize;

  return {
    pageRows: sorted.slice(start, start + table.pageSize),
    totalRows: sorted.length,
    totalPages,
    page: safePage,
  };
}

function computeMetrics(records, trendGrouping) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const dated = records.filter((record) => record.createdDate);
  const mttrValues = records.filter((record) => record.mttrHours != null).map((record) => record.mttrHours);
  const openCount = records.filter((record) => !isTerminalStatus(record.status)).length;
  return {
    totalCount: records.length,
    openRate: records.length ? openCount / records.length : 0,
    yearCount: dated.filter((record) => record.createdDate.getFullYear() === currentYear).length,
    lastWeekCount: dated.filter((record) => record.createdDate >= weekAgo).length,
    openCount,
    criticalOpenCount: records.filter((record) => !isTerminalStatus(record.status) && isCriticalPriority(record.priority)).length,
    averageMttrLabel: mttrValues.length ? `${formatNumber(average(mttrValues), 1)} h` : "N/A",
    ticketTrend: buildTicketTrend(dated, trendGrouping),
    statusDistribution: topEntries(countBy(records, "status"), 8),
    priorityDistribution: topEntries(countBy(records, "priority"), 8),
    topApplications: topEntries(countBy(records, "application")),
    topModules: topEntries(countBy(records, "module")),
    workloadByTechnician: topEntries(countBy(records, "technician")),
    ...buildKpiComparisons(dated),
  };
}

function computeHealthScores(records) {
  const grouped = records.reduce((acc, record) => {
    (acc[record.application] ||= []).push(record);
    return acc;
  }, {});

  return Object.entries(grouped).map(([application, items]) => {
    const total = items.length;
    const openRatio = items.filter((item) => !isTerminalStatus(item.status)).length / total;
    const highPriorityRatio = items.filter((item) => ["Critica", "Alta"].includes(item.priority)).length / total;
    const mttrValues = items.filter((item) => item.mttrHours != null).map((item) => item.mttrHours);
    const mttr = mttrValues.length ? average(mttrValues) : 0;
    const volumePenalty = Math.min(35, total * 3.5);
    const score = Math.max(0, Math.min(100, 100 - volumePenalty - openRatio * 30 - Math.min(20, mttr / 6) - highPriorityRatio * 15));
    return { application, total, openRatio, highPriorityRatio, mttr, score, band: score >= 75 ? "green" : score >= 50 ? "amber" : "red" };
  }).sort((left, right) => right.score - left.score);
}

function isTerminalStatus(status) {
  return TERMINAL_STATUSES.has(String(status || "").trim().toLowerCase());
}

function isCriticalPriority(priority) {
  return ["critica", "critical"].includes(String(priority || "").trim().toLowerCase());
}

function validateColumns(rows) {
  if (!rows.length) return { errors: ["El archivo no contiene filas de datos."], warnings: [] };
  const mappedColumns = Object.keys(rows[0]).reduce((acc, key) => {
    acc[key] = canonicalColumnKey(normalizeKey(key));
    return acc;
  }, {});
  const present = Object.values(mappedColumns);
  const missing = REQUIRED_COLUMNS.filter((column) => !present.includes(column));
  const detectedStatusColumn = Object.entries(mappedColumns).find(([, value]) => value === "status")?.[0] || null;
  return {
    errors: [],
    warnings: missing.length ? [`Columnas no detectadas: ${missing.join(", ")}`] : [],
    detectedStatusColumn,
  };
}

function normalizeRow(rawRow, index) {
  const row = {};
  Object.entries(rawRow).forEach(([key, value]) => {
    row[canonicalColumnKey(normalizeKey(key))] = value ?? "";
  });

  const createdDate = parseDateDDMMYYYY(row.created_date);
  const updatedDate = parseDateDDMMYYYY(row.last_updated_date);
  const createdDateText = normalizeText(row.created_date);
  const updatedDateText = normalizeText(row.last_updated_date);
  return {
    uid: normalizeText(row.id) || normalizeText(row.ticket) || `row-${index + 1}`,
    id: normalizeText(row.id),
    ticket: normalizeText(row.ticket) || normalizeText(row.id) || `row-${index + 1}`,
    subject: normalizeText(row.subject) || "Sin asunto",
    application: normalizeText(row.application) || "Otras aplicaciones",
    module: normalizeText(row.module) || "Otros modulos",
    classification: normalizeText(row.classification) || "Sin clasificacion",
    technician: normalizeText(row.technician) || "Sin tecnico",
    priority: normalizePriority(row.priority),
    status: normalizeStatus(row.status),
    description: normalizeText(row.description) || "Sin descripcion",
    solution: normalizeText(row.solution) || "Sin solucion",
    createdDate,
    updatedDate,
    createdDateIso: createdDate ? toIsoDate(createdDate) : "",
    lastUpdatedDateIso: updatedDate ? toIsoDate(updatedDate) : "",
    hasInvalidCreatedDate: Boolean(createdDateText) && !createdDate,
    hasInvalidUpdatedDate: Boolean(updatedDateText) && !updatedDate,
    createdTimestamp: createdDate ? createdDate.getTime() : null,
    createdDateLabel: createdDate ? formatDate(createdDate) : createdDateText ? "Fecha invalida" : "Sin fecha",
    mttrHours: createdDate && updatedDate ? (updatedDate - createdDate) / 36e5 : null,
    isIncomplete: ["subject", "application", "status", "priority"].some((field) => !normalizeText(row[field])) || !createdDate,
  };
}

function deduplicateRecords(records) {
  const map = new Map();
  records.forEach((record) => map.set(record.uid, record));
  return [...map.values()];
}

function uniqueValues(records, key) {
  return ["Todos", ...new Set(records.map((record) => record[key]).filter(Boolean))];
}

function normalizeKey(value) {
  return String(value).replace(/^\uFEFF/, "").trim().toLowerCase().replace(/[^\w]+/g, "_").replace(/^_+|_+$/g, "");
}

function canonicalColumnKey(key) {
  for (const [canonical, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.includes(key)) return canonical;
  }
  if (key.includes("status") || key.includes("estado")) return "status";
  if (key.includes("prior") || key.includes("severity")) return "priority";
  if (key.includes("app") || key.includes("aplic")) return "application";
  if (key.includes("modul") || key.includes("modulo")) return "module";
  if (key.includes("techn") || key.includes("tecnico") || key.includes("assignee") || key.includes("owner")) return "technician";
  if (key.includes("classif") || key.includes("categor")) return "classification";
  if (key.includes("subject") || key.includes("title") || key.includes("summary") || key.includes("asunto")) return "subject";
  if (key.includes("ticket") || key.includes("incident") || key.includes("number")) return "ticket";
  if ((key.includes("created") || key.includes("opened")) && (key.includes("date") || key.includes("fecha") || key.includes("at"))) return "created_date";
  if ((key.includes("updated") || key.includes("closed") || key.includes("resolved")) && (key.includes("date") || key.includes("fecha") || key.includes("at"))) return "last_updated_date";
  return key;
}

function normalizeStatus(value) {
  const raw = normalizeText(value);
  return raw || "Desconocido";
}

function normalizePriority(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (!normalized) return "Sin prioridad";
  if (normalized.startsWith("crit")) return "Critica";
  if (normalized.startsWith("alt")) return "Alta";
  if (normalized.startsWith("med")) return "Media";
  if (normalized.startsWith("baj") || normalized.startsWith("low")) return "Baja";
  return "Sin prioridad";
}

function parseDateDDMMYYYY(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : normalizeDateOnly(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return excelSerialToDate(value);
  }

  const raw = normalizeText(value);
  if (!raw) return null;

  if (/^\d+(\.\d+)?$/.test(raw)) {
    return excelSerialToDate(Number(raw));
  }

  const normalized = raw.replace(/[.\-]/g, "/").replace(",", " ");
  const match = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+.*)?$/);
  if (match) {
    const [, dayText, monthText, yearText] = match;
    const day = Number(dayText);
    const month = Number(monthText);
    const year = yearText.length === 2 ? 2000 + Number(yearText) : Number(yearText);
    return buildValidatedDate(year, month, day);
  }

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/);
  if (isoMatch) {
    const [, yearText, monthText, dayText] = isoMatch;
    return buildValidatedDate(Number(yearText), Number(monthText), Number(dayText));
  }

  return null;
}

function excelSerialToDate(serial) {
  if (!Number.isFinite(serial)) return null;
  const utcDays = Math.floor(serial - 25569);
  const dayMilliseconds = utcDays * 86400000;
  const date = new Date(dayMilliseconds);
  if (Number.isNaN(date.getTime())) return null;
  return normalizeDateOnly(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function buildValidatedDate(year, month, day) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = normalizeDateOnly(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

function normalizeDateOnly(year, monthIndex, day) {
  return new Date(year, monthIndex, day, 0, 0, 0, 0);
}

function normalizeText(value) {
  if (value == null) return "";
  return String(value).trim();
}

function toIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(date) {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function formatNumber(value, digits) {
  if (value == null || Number.isNaN(value)) return "N/A";
  return new Intl.NumberFormat("es-PE", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function compareRecords(left, right, key, direction) {
  const a = left[key];
  const b = right[key];
  const multiplier = direction === "asc" ? 1 : -1;
  if (a == null && b != null) return 1;
  if (b == null && a != null) return -1;
  if (typeof a === "number" && typeof b === "number") return (a - b) * multiplier;
  return String(a || "").localeCompare(String(b || ""), "es", { numeric: true }) * multiplier;
}

function countBy(records, key) {
  return records.reduce((acc, record) => {
    acc[record[key] || "Sin dato"] = (acc[record[key] || "Sin dato"] || 0) + 1;
    return acc;
  }, {});
}

function topEntries(counts, limit = 6) {
  return Object.entries(counts).sort(([, left], [, right]) => right - left).slice(0, limit).map(([label, value]) => ({ label, value }));
}

function buildTicketTrend(records, grouping) {
  const map = new Map();
  records.forEach((record) => {
    const label = grouping === "week" ? weekBucket(record.createdDate) : `${record.createdDate.getFullYear()}-${String(record.createdDate.getMonth() + 1).padStart(2, "0")}`;
    map.set(label, (map.get(label) || 0) + 1);
  });
  return [...map.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([label, value]) => ({ label, value }));
}

function weekBucket(date) {
  const target = new Date(date);
  const day = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - day);
  return toIsoDate(target);
}

function priorityClass(priority) {
  if (priority === "Critica") return "priority-critical";
  if (priority === "Alta") return "priority-high";
  if (priority === "Media") return "priority-medium";
  if (priority === "Baja") return "priority-low";
  return "priority-none";
}

function statusClass(status) {
  const normalized = String(status || "").trim().toLowerCase();
  if (["closed", "cerrado", "cerrada"].includes(normalized)) return "status-closed";
  if (["cancelled", "cancelado", "cancelada"].includes(normalized)) return "status-cancelled";
  if (["validado", "validated"].includes(normalized)) return "status-validated";
  if (["abierto", "open", "new"].includes(normalized)) return "status-open";
  if (["en progreso", "in progress", "working", "wip"].includes(normalized)) return "status-progress";
  return "status-neutral";
}

function isUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function buildDefaultHighlights(metrics) {
  const topStatus = metrics.statusDistribution[0]?.label || "Sin dato";
  return `Resumen automatico de tickets creados:\n- Total tickets: ${metrics.totalCount}\n- Tickets abiertos: ${metrics.openCount}\n- Tickets criticos abiertos: ${metrics.criticalOpenCount}\n- Estado dominante: ${topStatus}\n\nRecomendaciones operativas:\n- Revisar tickets abiertos no terminales con mayor antiguedad.\n- Priorizar incidentes criticos abiertos.\n- Validar registros con campos faltantes que afecten metricas historicas.`;
}

function createDemoRows() {
  const apps = ["Payments Hub", "Mobile Banking", "CRM Core", "Inventory Cloud", "Support Desk"];
  const modules = ["Auth", "API Gateway", "Reporting", "Integrations", "Notifications", ""];
  const classifications = ["Incidente", "Problema", "Consulta"];
  const technicians = ["Ana Torres", "Luis Vega", "Marta Diaz", "Carlos Ruiz", ""];
  const priorities = ["Critica", "Alta", "Media", "Baja", ""];
  const statuses = ["Abierto", "En progreso", "Resuelto", "Cerrado", ""];
  const rows = [];

  for (let index = 1; index <= 48; index += 1) {
    const created = new Date();
    created.setDate(created.getDate() - (index * 3) % 160);
    const updated = new Date(created);
    updated.setHours(updated.getHours() + ((index % 9) + 2) * 5);
    rows.push({
      id: index % 7 === 0 ? "" : `${1000 + index}`,
      ticket: `INC-${String(2000 + index).padStart(5, "0")}`,
      subject: `Incidente ${index} en ${apps[index % apps.length]}`,
      application: index % 11 === 0 ? "" : apps[index % apps.length],
      module: modules[index % modules.length],
      classification: classifications[index % classifications.length],
      technician: technicians[index % technicians.length],
      priority: priorities[index % priorities.length],
      status: statuses[index % statuses.length],
      description: "Impacto operativo detectado por monitoreo.",
      solution: index % 4 === 0 ? "Se aplico ajuste de configuracion." : "",
      created_date: index % 10 === 0 ? "" : created.toISOString(),
      last_updated_date: index % 6 === 0 ? "" : updated.toISOString(),
    });
  }
  return rows;
}

let xlsxLoader;

async function loadXlsx() {
  if (!xlsxLoader) {
    xlsxLoader = import("xlsx").then((module) => module.default ?? module);
  }
  return xlsxLoader;
}

function matchesCreatedDate(createdDate, dateFrom, dateTo) {
  if (!dateFrom && !dateTo) return true;
  if (!createdDate) return false;
  const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
  const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null;
  return (!from || createdDate >= from) && (!to || createdDate <= to);
}

function createDefaultFilters() {
  const today = new Date();
  return {
    search: "",
    dateFrom: `${today.getFullYear()}-01-01`,
    dateTo: toIsoDate(today),
    application: "Todos",
    module: "Todos",
    classification: "Todos",
    priority: "Todos",
    status: [],
    technician: "Todos",
  };
}

function buildKpiComparisons(datedRecords) {
  const periods = recentPeriods(12);
  const totalSparkline = periods.map((period) => countInPeriod(datedRecords, period));
  const openSparkline = periods.map((period) => countInPeriod(datedRecords, period, (record) => !isTerminalStatus(record.status)));
  const criticalSparkline = periods.map((period) => countInPeriod(datedRecords, period, (record) => !isTerminalStatus(record.status) && isCriticalPriority(record.priority)));
  return {
    totalSparkline,
    openSparkline,
    criticalSparkline,
    totalDelta: percentageDelta(totalSparkline.at(-1) || 0, totalSparkline.at(-2) || 0),
    openDelta: percentageDelta(openSparkline.at(-1) || 0, openSparkline.at(-2) || 0),
    criticalDelta: percentageDelta(criticalSparkline.at(-1) || 0, criticalSparkline.at(-2) || 0),
  };
}

function recentPeriods(count) {
  const periods = [];
  const now = new Date();
  for (let index = count - 1; index >= 0; index -= 1) {
    const end = new Date(now);
    end.setDate(end.getDate() - index * 7);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    periods.push({ start, end });
  }
  return periods;
}

function countInPeriod(records, period, predicate = () => true) {
  return records.filter((record) => record.createdDate >= period.start && record.createdDate <= period.end && predicate(record)).length;
}

function percentageDelta(current, previous) {
  if (!previous && !current) return 0;
  if (!previous) return 100;
  return ((current - previous) / previous) * 100;
}

function formatDelta(value) {
  const normalized = Number.isFinite(value) ? value : 0;
  const prefix = normalized > 0 ? "+" : "";
  return `${prefix}${formatNumber(normalized, 0)}%`;
}

function buildInsights(metrics, healthScores) {
  const topStatus = metrics.statusDistribution[0];
  const topModule = metrics.topModules[0];
  const topTechnician = metrics.workloadByTechnician[0];
  const topHealthRisk = [...healthScores].sort((left, right) => left.score - right.score)[0];
  return [
    `Se observan ${metrics.totalCount} tickets visibles y ${metrics.openCount} abiertos en el corte actual.`,
    topStatus ? `El estado dominante es ${topStatus.label} con ${topStatus.value} tickets.` : "No hay una concentracion dominante por estado.",
    topModule ? `${topModule.label} lidera el volumen operativo con ${topModule.value} tickets.` : "No hay modulo dominante en el corte actual.",
    topTechnician ? `${topTechnician.label} concentra la mayor carga individual con ${topTechnician.value} tickets.` : "No hay carga asignada por tecnico para analizar.",
    topHealthRisk ? `${topHealthRisk.application} presenta el mayor riesgo relativo con score ${formatNumber(topHealthRisk.score, 0)}.` : "No hay score de salud suficiente para priorizar aplicaciones.",
  ];
}
