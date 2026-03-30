import { useEffect, useMemo, useState } from "react";

const PROJECT_TABS = [
  { key: "executive", label: "Ejecutiva" },
  { key: "planning", label: "Planificacion" },
  { key: "costs", label: "Costos" },
  { key: "notes", label: "Notas" },
];

export const SEED_PROJECTS = [
  { id: "p1", name: "NPF", status: "Activo", timeline_status: "en_curso", start_date: "2026-02-01", end_date: "2026-05-15", budget_total: 420000 },
  { id: "p2", name: "BPlanner Improvement", status: "Activo", timeline_status: "en_curso", start_date: "2026-01-10", end_date: "2026-11-20", budget_total: 350000 },
  { id: "p3", name: "AIAutomation", status: "Activo", timeline_status: "en_curso", start_date: "2026-01-10", end_date: "2026-06-15", budget_total: 280000 },
  { id: "p4", name: "SWAT Commerce", status: "Activo", timeline_status: "en_curso", start_date: "2026-01-10", end_date: "2026-03-18", budget_total: 180000 },
  { id: "p5", name: "BPricing", status: "Planificado", timeline_status: "planificado", start_date: "2026-03-01", end_date: "2026-07-15", budget_total: 210000 },
  { id: "p6", name: "E2EODF-AIOffers", status: "Planificado", timeline_status: "planificado", start_date: "2026-02-01", end_date: "2026-05-15", budget_total: 195000 },
  { id: "p7", name: "Digital Improvement", status: "Planificado", timeline_status: "planificado", start_date: "2026-03-01", end_date: "2026-12-10", budget_total: 310000 },
  { id: "p8", name: "Support and Operations", status: "Activo", timeline_status: "en_curso", start_date: "2026-01-10", end_date: "2026-12-10", budget_total: 260000 },
];

export const SEED_ROLES = [
  { id: "r1", name: "Project Manager", description: "Gestion integral del proyecto" },
  { id: "r2", name: "Backend Engineer", description: "APIs y servicios" },
  { id: "r3", name: "Frontend Engineer", description: "Experiencia de usuario" },
  { id: "r4", name: "QA Analyst", description: "Calidad y pruebas" },
];

export const SEED_PEOPLE = [
  { id: "u1", first_name: "Ana", last_name: "Torres", role_id: "r1" },
  { id: "u2", first_name: "Luis", last_name: "Vega", role_id: "r2" },
  { id: "u3", first_name: "Marta", last_name: "Diaz", role_id: "r3" },
  { id: "u4", first_name: "Carlos", last_name: "Ruiz", role_id: "r4" },
  { id: "u5", first_name: "Paula", last_name: "Mena", role_id: "r2" },
];

const SEED_ASSIGNMENTS = [
  { id: "a1", person_id: "u1", project_id: "p1", month: "2026-03", allocation_percentage: 60 },
  { id: "a2", person_id: "u1", project_id: "p2", month: "2026-03", allocation_percentage: 50 },
  { id: "a3", person_id: "u2", project_id: "p1", month: "2026-03", allocation_percentage: 80 },
  { id: "a4", person_id: "u2", project_id: "p2", month: "2026-04", allocation_percentage: 40 },
  { id: "a5", person_id: "u3", project_id: "p2", month: "2026-03", allocation_percentage: 70 },
  { id: "a6", person_id: "u3", project_id: "p3", month: "2026-04", allocation_percentage: 30 },
  { id: "a7", person_id: "u4", project_id: "p1", month: "2026-03", allocation_percentage: 45 },
  { id: "a8", person_id: "u5", project_id: "p3", month: "2026-05", allocation_percentage: 95 },
];

const SEED_COSTS = [
  { id: "c1", project_id: "p1", month: "2026-03", planned_amount: 38000, actual_amount: 38000 },
  { id: "c2", project_id: "p1", month: "2026-04", planned_amount: 42000, actual_amount: 46000 },
  { id: "c3", project_id: "p2", month: "2026-03", planned_amount: 28000, actual_amount: 25000 },
  { id: "c4", project_id: "p2", month: "2026-04", planned_amount: 32000, actual_amount: 32000 },
  { id: "c5", project_id: "p3", month: "2026-05", planned_amount: 18000, actual_amount: 22000 },
];

export const SEED_MILESTONES = [
  { id: "m1", project_id: "p1", name: "Go live piloto", datetime: "2026-03-20T10:00:00" },
  { id: "m2", project_id: "p2", name: "Diseno aprobado", datetime: "2026-03-25T14:00:00" },
  { id: "m3", project_id: "p3", name: "Kickoff", datetime: "2026-04-03T09:30:00" },
];

const SEED_NOTES = [
  { id: "n1", ticket: "CAP-001", project_id: "p1", title: "Alinear alcance MVP", description_long: "Validar backlog de salida y dependencias con arquitectura.", status: "Pendiente", start_date: "2026-03-18", due_date: "2026-03-31", responsible_id: "u1" },
  { id: "n2", ticket: "CAP-002", project_id: "p2", title: "Cerrar definicion de APIs", description_long: "Ajustar payloads y contratos con equipos satelite.", status: "En progreso", start_date: "2026-03-20", due_date: "2026-04-05", responsible_id: "u2" },
  { id: "n3", ticket: "CAP-003", project_id: "p3", title: "Preparar calendario rollout", description_long: "Coordinar ventanas por pais y readiness comercial.", status: "En pruebas", start_date: "2026-03-10", due_date: "2026-03-22", responsible_id: "u3" },
];

const WEEK_RANGE = { label: "18-24 Mar", month: "Mar 2026" };
const MONTHS = ["2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08"];
const TIMELINE_MONTHS = Array.from({ length: 12 }, (_, index) => `2026-${String(index + 1).padStart(2, "0")}`);

export default function CapaciTrackModule({
  masterProjects = SEED_PROJECTS,
  setMasterProjects,
  masterPeople = SEED_PEOPLE,
  masterMilestones = SEED_MILESTONES,
}) {
  const [activeTab, setActiveTab] = useState("executive");
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const projects = masterProjects;
  const people = masterPeople;
  const [roles] = useState(SEED_ROLES);
  const [assignments, setAssignments] = useState(SEED_ASSIGNMENTS);
  const [projectCosts, setProjectCosts] = useState(SEED_COSTS);
  const milestones = masterMilestones;
  const [notes, setNotes] = useState(SEED_NOTES);
  const [timelineMode, setTimelineMode] = useState("month");
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [expandedPeople, setExpandedPeople] = useState({});
  const [saveMessage, setSaveMessage] = useState("");
  const [newAssignment, setNewAssignment] = useState({ person_id: SEED_PEOPLE[0].id, project_id: SEED_PROJECTS[0].id, allocation_percentage: 40, month_from: MONTHS[0], month_to: MONTHS[2] });

  const roleLookup = useMemo(() => Object.fromEntries(roles.map((role) => [role.id, role])), [roles]);
  const projectLookup = useMemo(() => Object.fromEntries(projects.map((project) => [project.id, project])), [projects]);

  const filteredCosts = selectedProjectId === "all" ? projectCosts : projectCosts.filter((cost) => cost.project_id === selectedProjectId);
  const filteredNotes = selectedProjectId === "all" ? notes : notes.filter((note) => note.project_id === selectedProjectId);
  const activeProjects = projects.filter((project) => project.status === "Activo").length;
  const committedCost = filteredCosts.reduce((sum, cost) => sum + Number(cost.planned_amount || 0), 0);
  const overallocated = countOverallocatedPeople(assignments);
  const timelineItems = useMemo(() => buildTimelineItems(projects, milestones, timelineMode), [projects, milestones, timelineMode]);
  const planningRows = useMemo(() => buildPlanningRows(people, roles, assignments, selectedProjectId), [people, roles, assignments, selectedProjectId]);
  const costGrid = useMemo(() => buildCostGrid(projects, projectCosts, selectedProjectId), [projects, projectCosts, selectedProjectId]);

  function flashSaved() {
    setSaveMessage("Guardado ✓");
    window.clearTimeout(flashSaved.timeoutId);
    flashSaved.timeoutId = window.setTimeout(() => setSaveMessage(""), 1800);
  }

  function handleQuickLoad() {
    const nextProject = {
      id: `p${projects.length + 1}`,
      name: `Proyecto ${projects.length + 1}`,
      status: "Planificado",
      timeline_status: "planificado",
      start_date: "2026-06-01",
      end_date: "2026-11-30",
      budget_total: 210000,
      product_owner_id: people[0]?.id || "",
      it_owner_id: people[0]?.id || "",
    };
    (setMasterProjects || (() => {}))((current) => [...current, nextProject]);
    flashSaved();
  }

  function updateAssignment(personId, month, nextValue) {
    if (selectedProjectId === "all") return;
    const parsed = Math.max(0, Number(nextValue || 0));
    const existing = assignments.find((assignment) => assignment.person_id === personId && assignment.project_id === selectedProjectId && assignment.month === month);
    if (existing) {
      setAssignments((current) => current.map((assignment) => assignment.id === existing.id ? { ...assignment, allocation_percentage: parsed } : assignment));
    } else {
      setAssignments((current) => [...current, { id: `a${Date.now()}`, person_id: personId, project_id: selectedProjectId, month, allocation_percentage: parsed }]);
    }
    flashSaved();
  }

  function createAssignmentRange() {
    const range = expandMonthRange(newAssignment.month_from, newAssignment.month_to);
    const seed = Date.now();
    setAssignments((current) => [
      ...current,
      ...range.map((month, index) => ({
        id: `a${seed + index}`,
        person_id: newAssignment.person_id,
        project_id: newAssignment.project_id,
        month,
        allocation_percentage: Number(newAssignment.allocation_percentage || 0),
      })),
    ]);
    flashSaved();
  }

  function resetAssignments(personId) {
    setAssignments((current) => current.map((assignment) => {
      if (assignment.person_id !== personId) return assignment;
      if (selectedProjectId !== "all" && assignment.project_id !== selectedProjectId) return assignment;
      return { ...assignment, allocation_percentage: 0 };
    }));
    flashSaved();
  }

  function updateCost(projectId, month, field, value) {
    const existing = projectCosts.find((cost) => cost.project_id === projectId && cost.month === month);
    const nextPlanned = field === "planned_amount" ? Number(value || 0) : existing?.planned_amount || 0;
    const nextActual = field === "actual_amount" ? Number(value || 0) : existing?.actual_amount || 0;
    if (existing) {
      setProjectCosts((current) => current.map((cost) => cost.id === existing.id ? { ...cost, planned_amount: nextPlanned, actual_amount: nextActual } : cost));
    } else {
      setProjectCosts((current) => [...current, { id: `c${Date.now()}`, project_id: projectId, month, planned_amount: nextPlanned, actual_amount: nextActual }]);
    }
    flashSaved();
  }

  function distributeBudget(projectId) {
    const project = projectLookup[projectId];
    if (!project) return;
    const slice = Math.round(project.budget_total / MONTHS.length);
    setProjectCosts((current) => {
      const without = current.filter((cost) => !(cost.project_id === projectId && MONTHS.includes(cost.month)));
      return [...without, ...MONTHS.map((month, index) => ({
        id: `c${Date.now()}${index}`,
        project_id: projectId,
        month,
        planned_amount: slice,
        actual_amount: 0,
      }))];
    });
    flashSaved();
  }

  function updateNote(noteId, field, value) {
    setNotes((current) => current.map((note) => note.id === noteId ? { ...note, [field]: value } : note));
    flashSaved();
  }

  function addNoteRow() {
    setNotes((current) => [
      ...current,
      {
        id: `n${Date.now()}`,
        ticket: `CAP-${String(current.length + 1).padStart(3, "0")}`,
        project_id: selectedProjectId === "all" ? projects[0]?.id || "" : selectedProjectId,
        title: "",
        description_long: "",
        status: "Pendiente",
        start_date: "",
        due_date: "",
        responsible_id: people[0]?.id || "",
      },
    ]);
    flashSaved();
  }

  return (
    <section className="capaci-track">
      <div className="capaci-track__hero">
        <div>
          <p className="eyebrow">CapaciTrack</p>
          <h2>Plataforma de Planificacion de Capacidad y Portafolio</h2>
        </div>
        <div className="capaci-track__actions">
          <label className="chip-field capaci-track__project-filter">
            <span className="chip-field__label">Filtro por proyecto</span>
            <select className="capaci-control capaci-control--select" value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)}>
              <option value="all">Todos los proyectos</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </label>
          <button className="ghost-button" onClick={handleQuickLoad}>Carga Rapida</button>
          <button className={`ghost-button ${isAdminOpen ? "ghost-button--compact is-active" : ""}`} onClick={() => setIsAdminOpen((current) => !current)}>Administrar</button>
        </div>
      </div>

      <div className="capaci-track__tabs">
        {PROJECT_TABS.map((tab) => (
          <button key={tab.key} className={`view-button ${activeTab === tab.key ? "active" : ""}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
        <span className={`capaci-track__save ${saveMessage ? "is-visible" : ""}`}>{saveMessage || "Guardado"}</span>
      </div>

      {isAdminOpen && (
        <div className="capaci-track__admin panel">
          <AdminList title="Proyectos" items={projects.map((project) => `${project.name} · ${project.status}`)} />
          <AdminList title="Personas" items={people.map((person) => `${person.first_name} ${person.last_name} · ${roleLookup[person.role_id]?.name || "Sin rol"}`)} />
          <AdminList title="Roles" items={roles.map((role) => `${role.name} · ${role.description}`)} />
          <AdminList title="Hitos" items={milestones.map((milestone) => `${milestone.name} · ${formatDateTime(milestone.datetime)}`)} />
        </div>
      )}

      {activeTab === "executive" && (
        <div className="capaci-track__view">
          <section className="capaci-track__kpis">
            <ExecutiveKpi title="Proyectos activos" value={activeProjects} tone="blue" note="Portafolio en ejecucion" />
            <ExecutiveKpi title="Costo comprometido total" value={formatCurrency(committedCost)} tone="green" note="Suma de costos visibles" />
            <ExecutiveKpi title="Personas sobreasignadas" value={overallocated} tone="red" note="Suma mensual > 100%" />
          </section>

          <section className="panel capaci-track__timeline">
            <div className="section-head">
              <div>
                <p className="eyebrow">Timeline ejecutivo</p>
                <h3>Timeline de proyectos</h3>
              </div>
              <div className="view-switcher">
                <button className={`view-button ${timelineMode === "month" ? "active" : ""}`} onClick={() => setTimelineMode("month")}>Mensual</button>
                <button className={`view-button ${timelineMode === "week" ? "active" : ""}`} onClick={() => setTimelineMode("week")}>Semanal</button>
              </div>
            </div>
            <ExecutiveTimeline projects={projects} milestones={milestones} mode={timelineMode} />
          </section>
        </div>
      )}

      {activeTab === "planning" && (
        <div className="capaci-track__view">
          <section className="panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">Planificacion</p>
                <h3>Matriz de capacidad</h3>
              </div>
              <p className="capaci-track__helper">Usa la edicion directa de la matriz o el detalle por persona para ajustar asignaciones.</p>
            </div>
            <div className="capacity-table">
              <table className="incident-table capacity-table__grid">
                <thead>
                  <tr>
                    <th>Persona</th>
                    {MONTHS.map((month) => <th key={month}>{formatMonth(month)}</th>)}
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {planningRows.map((row) => (
                    <>
                      <tr key={row.person.id}>
                      <td>
                        <div className="capacity-table__person">
                          <strong>{row.person.first_name} {row.person.last_name}</strong>
                          <span>{roleLookup[row.person.role_id]?.name || "Sin rol"}</span>
                          <small>{row.drilldown}</small>
                          {row.projectBreakdown.length > 0 && (
                            <div className="capacity-table__mini-bars">
                              {row.projectBreakdown.map((projectRow) => {
                                const total = Object.values(projectRow.months).reduce((sum, value) => sum + value, 0);
                                const average = Math.round(total / Math.max(MONTHS.length, 1));
                                return (
                                  <div key={projectRow.project_id} className="capacity-table__mini-row" title={`${projectLookup[projectRow.project_id]?.name || projectRow.project_id}: ${total}% total visible`}>
                                    <span>{projectLookup[projectRow.project_id]?.name || projectRow.project_id}</span>
                                    <div className="capacity-table__mini-track">
                                      <i className={capacityTone(average)} style={{ width: `${Math.min(100, average)}%` }} />
                                    </div>
                                    <strong>{average}%</strong>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                        {MONTHS.map((month) => (
                          <td key={month}>
                            <input
                              className={`capacity-input ${capacityTone(row.globalTotals[month])}`}
                              type="number"
                              min="0"
                              max="200"
                              value={row.visibleTotals[month]}
                              onChange={(event) => updateAssignment(row.person.id, month, event.target.value)}
                              disabled={selectedProjectId === "all"}
                            />
                          </td>
                        ))}
                        <td>
                          <div className="capacity-table__actions">
                            <button className="icon-button icon-button--compact" onClick={() => setExpandedPeople((current) => ({ ...current, [row.person.id]: !current[row.person.id] }))} aria-label={expandedPeople[row.person.id] ? "Ocultar detalle" : "Editar por proyecto"}>
                              <span className={`capaci-icon ${expandedPeople[row.person.id] ? "capaci-icon--collapse" : "capaci-icon--edit"}`} aria-hidden="true" />
                            </button>
                            <button className="icon-button icon-button--compact" onClick={() => resetAssignments(row.person.id)} aria-label="Resetear asignaciones a 0%">
                              <span className="capaci-icon capaci-icon--reset" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedPeople[row.person.id] && (
                        <tr key={`${row.person.id}-detail`} className="capacity-table__detail-row">
                          <td colSpan={MONTHS.length + 2}>
                            <div className="capacity-table__detail">
                              {row.projectBreakdown.length ? row.projectBreakdown.map((projectRow) => (
                                <div key={projectRow.project_id} className="capacity-table__detail-card">
                                  <strong>{projectLookup[projectRow.project_id]?.name || projectRow.project_id}</strong>
                                  <div className="capacity-table__detail-grid">
                                    {MONTHS.map((month) => (
                                      <label key={month}>
                                        <span>{formatMonth(month)}</span>
                                        <input
                                          className="capaci-control"
                                          type="number"
                                          min="0"
                                          max="200"
                                          value={projectRow.months[month] || 0}
                                          onChange={(event) => updateAssignmentProject(row.person.id, projectRow.project_id, month, event.target.value, setAssignments, flashSaved)}
                                        />
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )) : <p className="eyebrow">No hay asignaciones por proyecto para esta persona.</p>}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeTab === "costs" && (
        <div className="capaci-track__view">
          <section className="panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">Costos</p>
                <h3>Planificacion financiera</h3>
              </div>
            </div>
            <div className="costs-table">
              <table className="incident-table">
                <thead>
                  <tr>
                    <th>Proyecto</th>
                    {MONTHS.map((month) => <th key={month}>{formatMonth(month)}</th>)}
                    <th>Total planificado</th>
                    <th>Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {costGrid.map((row) => (
                    <>
                      <tr key={`${row.project.id}-planned`}>
                        <td rowSpan={2} className="costs-table__project-cell">{row.project.name}</td>
                        {MONTHS.map((month) => {
                          const cell = row.cells[month];
                          return (
                            <td key={month}>
                              <div className="cost-cell cost-cell--planned">
                                <span className="cost-cell__label">Plan</span>
                              <input className="capaci-control" type="number" value={cell.planned_amount} onChange={(event) => updateCost(row.project.id, month, "planned_amount", event.target.value)} />
                              </div>
                            </td>
                          );
                        })}
                        <td>{formatCurrency(row.totalPlanned)}</td>
                        <td rowSpan={2} className={costDifferenceClass(row.totalActual - row.totalPlanned)}>{formatCurrency(row.totalActual - row.totalPlanned)}</td>
                      </tr>
                      <tr key={`${row.project.id}-actual`}>
                        {MONTHS.map((month) => {
                          const cell = row.cells[month];
                          return (
                            <td key={month}>
                              <div className={`cost-cell ${costVarianceClass(cell)}`}>
                                <span className="cost-cell__label">Real</span>
                                <input className="capaci-control" type="number" value={cell.actual_amount} onChange={(event) => updateCost(row.project.id, month, "actual_amount", event.target.value)} />
                              </div>
                            </td>
                          );
                        })}
                        <td>{formatCurrency(row.totalActual)}</td>
                      </tr>
                    </>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total por mes</td>
                    {MONTHS.map((month) => <td key={month}>{formatCurrency(costGrid.reduce((sum, row) => sum + row.cells[month].planned_amount, 0))}</td>)}
                    <td>{formatCurrency(costGrid.reduce((sum, row) => sum + row.totalPlanned, 0))}</td>
                    <td>{formatCurrency(costGrid.reduce((sum, row) => sum + (row.totalActual - row.totalPlanned), 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeTab === "notes" && (
        <div className="capaci-track__view">
          <section className="panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">Notas</p>
                <h3>Seguimiento operativo</h3>
              </div>
              <button className="ghost-button" onClick={addNoteRow}>Agregar fila</button>
            </div>
            <div className="notes-grid-table">
              <table className="incident-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ticket</th>
                    <th>Titulo</th>
                    <th>Responsable</th>
                    <th>Fecha inicio</th>
                    <th>Fecha fin</th>
                    <th>Estado</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotes.map((note) => (
                    <tr key={note.id}>
                      <td>{note.id}</td>
                      <td><input className="capaci-control" value={note.ticket || ""} onChange={(event) => updateNote(note.id, "ticket", event.target.value)} /></td>
                      <td><input className="capaci-control" value={note.title} onChange={(event) => updateNote(note.id, "title", event.target.value)} /></td>
                      <td>
                        <select className="capaci-control capaci-control--select" value={note.responsible_id} onChange={(event) => updateNote(note.id, "responsible_id", event.target.value)}>
                          {people.map((person) => <option key={person.id} value={person.id}>{person.first_name} {person.last_name}</option>)}
                        </select>
                      </td>
                      <td>
                        <DateTextInput
                          value={note.start_date}
                          onChange={(nextValue) => updateNote(note.id, "start_date", nextValue)}
                        />
                      </td>
                      <td>
                        <DateTextInput
                          value={note.due_date}
                          onChange={(nextValue) => updateNote(note.id, "due_date", nextValue)}
                        />
                      </td>
                      <td>
                        <select className="capaci-control capaci-control--select" value={note.status} onChange={(event) => updateNote(note.id, "status", event.target.value)}>
                          <option value="Pendiente">Pendiente</option>
                          <option value="En progreso">En progreso</option>
                          <option value="En pruebas">En pruebas</option>
                          <option value="Entregado">Entregado</option>
                        </select>
                      </td>
                      <td><textarea className="capaci-control capaci-control--textarea" value={note.description_long} onChange={(event) => updateNote(note.id, "description_long", event.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function ExecutiveKpi({ title, value, tone, note }) {
  return (
    <article className={`ops-card ops-card--kpi capaci-track__kpi capaci-track__kpi--${tone}`}>
      <p className="eyebrow">{title}</p>
      <strong>{value}</strong>
      <span className="ops-card__note">{note}</span>
    </article>
  );
}

function ExecutiveTimeline({ projects, milestones, mode }) {
  if (mode === "week") {
    const weeks = buildWeeklyHeaders();
    return (
      <div className="timeline-chart">
        <div className="timeline-chart__header">
          <div />
          <div className="timeline-chart__scale timeline-chart__scale--weeks">
            {weeks.map((week) => <span key={week.key} title={week.exact}>{week.label}</span>)}
          </div>
        </div>
        <div className="timeline-chart__body">
          {projects.map((project) => {
            const segments = buildWeeklyBar(project, weeks);
            const projectMilestones = milestones.filter((milestone) => milestone.project_id === project.id);
            return (
              <div key={project.id} className="timeline-row">
                <div className="timeline-row__label">
                  <strong>{project.name}</strong>
                  <span>{WEEK_RANGE.month}</span>
                </div>
                <div className="timeline-row__track">
                  <div className={`timeline-bar timeline-bar--${project.timeline_status}`} style={segments} />
                  {projectMilestones.map((milestone) => (
                    <span
                      key={milestone.id}
                      className="timeline-milestone"
                      style={{ left: `${weekMarkerPosition(milestone.datetime, weeks)}%` }}
                      title={`${milestone.name} · ${formatDateTime(milestone.datetime)}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <TimelineLegend />
      </div>
    );
  }

  return (
    <div className="timeline-chart">
      <div className="timeline-chart__header">
        <div />
        <div className="timeline-chart__scale">
          {TIMELINE_MONTHS.map((month) => <span key={month}>{formatMonthAxis(month)}</span>)}
        </div>
      </div>
      <div className="timeline-chart__body">
        {projects.map((project) => (
          <div key={project.id} className="timeline-row">
            <div className="timeline-row__label">
              <strong>{project.name}</strong>
            </div>
            <div className="timeline-row__track">
              <div className={`timeline-bar timeline-bar--${project.timeline_status}`} style={buildMonthlyBar(project)} title={`${formatShortDate(project.start_date)} - ${formatShortDate(project.end_date)}`} />
            </div>
          </div>
        ))}
      </div>
      <TimelineLegend />
    </div>
  );
}

function TimelineLegend() {
  const items = [
    { key: "en_curso", label: "En curso" },
    { key: "en_riesgo", label: "En riesgo" },
    { key: "planificado", label: "Planificado" },
    { key: "bloqueado", label: "Bloqueado" },
  ];
  return (
    <div className="timeline-legend">
      {items.map((item) => (
        <span key={item.key} className="timeline-legend__item">
          <i className={`timeline-legend__dot timeline-legend__dot--${item.key}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function AdminList({ title, items }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <div className="capaci-track__admin-list">
        {items.map((item) => <span key={item} className="meta-chip">{item}</span>)}
      </div>
    </div>
  );
}

function DateTextInput({ value, onChange }) {
  const [draft, setDraft] = useState(formatIsoAsDisplay(value));

  useEffect(() => {
    setDraft(formatIsoAsDisplay(value));
  }, [value]);

  function commit(nextDraft) {
    const normalized = parseDisplayDateToIso(nextDraft);
    onChange(normalized);
    setDraft(normalized ? formatIsoAsDisplay(normalized) : nextDraft);
  }

  return (
    <input
      className="capaci-control"
      inputMode="numeric"
      placeholder="DD/MM/YYYY"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={(event) => commit(event.target.value)}
    />
  );
}

function countOverallocatedPeople(assignments) {
  const totals = new Map();
  assignments.forEach((assignment) => {
    const key = `${assignment.person_id}-${assignment.month}`;
    totals.set(key, (totals.get(key) || 0) + Number(assignment.allocation_percentage || 0));
  });
  return new Set([...totals.entries()].filter(([, total]) => total > 100).map(([key]) => key.split("-")[0])).size;
}

function buildTimelineItems(projects, milestones, mode) {
  const projectCards = projects.map((project) => ({
    id: project.id,
    title: project.name,
    subtitle: `${project.status} · ${formatShortDate(project.start_date)} a ${formatShortDate(project.end_date)}`,
    range: `${formatShortDate(project.start_date)} - ${formatShortDate(project.end_date)}`,
    monthLabel: mode === "week" ? WEEK_RANGE.month : "",
    exact: `${project.start_date} / ${project.end_date}`,
    kind: "project",
  }));
  if (mode === "month") return projectCards;
  return [...projectCards, ...milestones.map((milestone) => ({
    id: milestone.id,
    title: milestone.name,
    subtitle: "Hito semanal",
    range: formatDateTime(milestone.datetime),
    monthLabel: WEEK_RANGE.month,
    exact: formatDateTime(milestone.datetime),
    kind: "milestone",
  }))];
}

function buildMonthlyBar(project) {
  const startMonth = monthIndexFromDate(project.start_date);
  const endMonth = monthIndexFromDate(project.end_date);
  const left = (startMonth / 12) * 100;
  const width = ((endMonth - startMonth + 1) / 12) * 100;
  return { left: `${left}%`, width: `${Math.max(width, 6)}%` };
}

function buildWeeklyHeaders() {
  return Array.from({ length: 8 }, (_, index) => {
    const start = new Date(2026, 2, 2 + index * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      key: `${index}`,
      label: `${String(start.getDate()).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")} ${new Intl.DateTimeFormat("es-PE", { month: "short" }).format(start)}`,
      exact: `${start.toISOString()} / ${end.toISOString()}`,
      start,
      end,
    };
  });
}

function buildWeeklyBar(project, weeks) {
  const start = new Date(`${project.start_date}T00:00:00`);
  const end = new Date(`${project.end_date}T23:59:59`);
  const startIndex = Math.max(0, weeks.findIndex((week) => start <= week.end));
  const endIndex = Math.max(startIndex, weeks.findLastIndex((week) => end >= week.start));
  return {
    left: `${(startIndex / weeks.length) * 100}%`,
    width: `${((endIndex - startIndex + 1) / weeks.length) * 100}%`,
  };
}

function weekMarkerPosition(datetime, weeks) {
  const value = new Date(datetime);
  const index = weeks.findIndex((week) => value >= week.start && value <= week.end);
  if (index === -1) return 0;
  return ((index + 0.5) / weeks.length) * 100;
}

function buildPlanningRows(people, roles, assignments, selectedProjectId) {
  return people.map((person) => {
    const globalAssignments = assignments.filter((assignment) => assignment.person_id === person.id);
    const visibleAssignments = selectedProjectId === "all" ? globalAssignments : globalAssignments.filter((assignment) => assignment.project_id === selectedProjectId);
    const globalTotals = Object.fromEntries(MONTHS.map((month) => [month, sumAssignments(globalAssignments, month)]));
    const visibleTotals = Object.fromEntries(MONTHS.map((month) => [month, sumAssignments(visibleAssignments, month)]));
    const projects = [...new Set(visibleAssignments.map((assignment) => assignment.project_id))];
    const projectBreakdown = projects.map((projectId) => ({
      project_id: projectId,
      months: Object.fromEntries(MONTHS.map((month) => [month, sumAssignments(visibleAssignments.filter((assignment) => assignment.project_id === projectId), month)])),
    }));
    return {
      person,
      role: roles.find((role) => role.id === person.role_id),
      globalTotals,
      visibleTotals,
      visibleTotal: Object.values(visibleTotals).reduce((sum, value) => sum + value, 0),
      globalTotal: Object.values(globalTotals).reduce((sum, value) => sum + value, 0),
      drilldown: projects.length ? `Asignado a ${projects.length} proyecto(s)` : "Sin asignaciones visibles",
      projectBreakdown,
    };
  });
}

function buildCostGrid(projects, projectCosts, selectedProjectId) {
  const visibleProjects = selectedProjectId === "all" ? projects : projects.filter((project) => project.id === selectedProjectId);
  return visibleProjects.map((project) => {
    const cells = Object.fromEntries(MONTHS.map((month) => {
      const found = projectCosts.find((cost) => cost.project_id === project.id && cost.month === month);
      return [month, found || { planned_amount: 0, actual_amount: 0 }];
    }));
    return {
      project,
      cells,
      totalPlanned: MONTHS.reduce((sum, month) => sum + Number(cells[month].planned_amount || 0), 0),
      totalActual: MONTHS.reduce((sum, month) => sum + Number(cells[month].actual_amount || 0), 0),
    };
  });
}

function sumAssignments(assignments, month) {
  return assignments.filter((assignment) => assignment.month === month).reduce((sum, assignment) => sum + Number(assignment.allocation_percentage || 0), 0);
}

function expandMonthRange(start, end) {
  const [startYear, startMonth] = start.split("-").map(Number);
  const [endYear, endMonth] = end.split("-").map(Number);
  const cursor = new Date(startYear, startMonth - 1, 1);
  const limit = new Date(endYear, endMonth - 1, 1);
  const values = [];
  while (cursor <= limit) {
    values.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return values;
}

function capacityTone(value) {
  if (value < 80) return "capacity-input--green";
  if (value <= 100) return "capacity-input--amber";
  return "capacity-input--red";
}

function costVarianceClass(cell) {
  if (Number(cell.actual_amount || 0) === Number(cell.planned_amount || 0)) return "cost-cell--match";
  if (Number(cell.actual_amount || 0) > Number(cell.planned_amount || 0)) return "cost-cell--over";
  return "cost-cell--actual";
}

function costDifferenceClass(value) {
  return value > 0 ? "cost-difference cost-difference--over" : "cost-difference cost-difference--ok";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
}

function formatMonth(month) {
  const [year, monthNumber] = month.split("-");
  return new Intl.DateTimeFormat("es-PE", { month: "short", year: "2-digit" }).format(new Date(Number(year), Number(monthNumber) - 1, 1));
}

function formatMonthAxis(month) {
  return new Intl.DateTimeFormat("es-PE", { month: "short" }).format(new Date(`${month}-01T00:00:00`));
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short" }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function monthIndexFromDate(value) {
  return new Date(`${value}T00:00:00`).getMonth();
}

function formatIsoAsDisplay(value) {
  if (!value) return "";
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function parseDisplayDateToIso(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";
  const [, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return `${year}-${month}-${day}`;
}

function updateAssignmentProject(personId, projectId, month, nextValue, setAssignments, flashSaved) {
  const parsed = Math.max(0, Number(nextValue || 0));
  setAssignments((current) => {
    const existing = current.find((assignment) => assignment.person_id === personId && assignment.project_id === projectId && assignment.month === month);
    if (existing) {
      return current.map((assignment) => assignment.id === existing.id ? { ...assignment, allocation_percentage: parsed } : assignment);
    }
    return [...current, { id: `a${Date.now()}`, person_id: personId, project_id: projectId, month, allocation_percentage: parsed }];
  });
  flashSaved();
}
