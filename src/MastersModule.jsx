import { useMemo } from "react";

export default function MastersModule({
  people,
  setPeople,
  projects,
  setProjects,
  milestones,
  setMilestones,
  roles,
}) {
  const personLookup = useMemo(() => Object.fromEntries(people.map((person) => [person.id, `${person.first_name} ${person.last_name}`])), [people]);

  function updatePerson(personId, field, value) {
    setPeople((current) => current.map((person) => person.id === personId ? {
      ...person,
      ...(field === "name" ? splitName(value) : { [field]: value }),
    } : person));
  }

  function addPerson() {
    setPeople((current) => [...current, {
      id: `u${Date.now()}`,
      first_name: "Nuevo",
      last_name: "Usuario",
      role_id: roles[0]?.id || "",
      area: "",
    }]);
  }

  function updateProject(projectId, field, value) {
    setProjects((current) => current.map((project) => project.id === projectId ? { ...project, [field]: value } : project));
  }

  function addProject() {
    const ownerId = people[0]?.id || "";
    setProjects((current) => [...current, {
      id: `p${Date.now()}`,
      name: "Nuevo proyecto",
      status: "Planificado",
      timeline_status: "planificado",
      start_date: "",
      end_date: "",
      budget_total: 0,
      product_owner_id: ownerId,
      it_owner_id: ownerId,
    }]);
  }

  function addMilestone(projectId) {
    setMilestones((current) => [...current, {
      id: `m${Date.now()}`,
      project_id: projectId,
      name: "Nuevo hito",
      datetime: "",
    }]);
  }

  function updateMilestone(milestoneId, field, value) {
    setMilestones((current) => current.map((milestone) => milestone.id === milestoneId ? { ...milestone, [field]: value } : milestone));
  }

  return (
    <section className="masters-module">
      <div className="masters-module__hero">
        <div>
          <p className="eyebrow">Maestros</p>
          <h2>Mantenimiento de datos base</h2>
        </div>
      </div>

      <section className="panel masters-module__section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Personas</p>
            <h3>Catalogo de personas</h3>
          </div>
          <button className="ghost-button" onClick={addPerson}>Agregar persona</button>
        </div>
        <div className="masters-table">
          <table className="incident-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Area</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => (
                <tr key={person.id}>
                  <td><input className="capaci-control" value={`${person.first_name} ${person.last_name}`.trim()} onChange={(event) => updatePerson(person.id, "name", event.target.value)} /></td>
                  <td>
                    <select className="capaci-control capaci-control--select" value={person.role_id} onChange={(event) => updatePerson(person.id, "role_id", event.target.value)}>
                      {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                    </select>
                  </td>
                  <td><input className="capaci-control" value={person.area || ""} onChange={(event) => updatePerson(person.id, "area", event.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel masters-module__section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Proyectos</p>
            <h3>Catalogo de proyectos y cronograma</h3>
          </div>
          <button className="ghost-button" onClick={addProject}>Agregar proyecto</button>
        </div>
        <div className="masters-projects">
          {projects.map((project) => {
            const projectMilestones = milestones.filter((milestone) => milestone.project_id === project.id);
            return (
              <article key={project.id} className="masters-project-card">
                <div className="masters-project-card__grid">
                  <label>
                    <span>Nombre</span>
                    <input className="capaci-control" value={project.name} onChange={(event) => updateProject(project.id, "name", event.target.value)} />
                  </label>
                  <label>
                    <span>Product Owner</span>
                    <select className="capaci-control capaci-control--select" value={project.product_owner_id || ""} onChange={(event) => updateProject(project.id, "product_owner_id", event.target.value)}>
                      {people.map((person) => <option key={person.id} value={person.id}>{personLookup[person.id]}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>IT Owner</span>
                    <select className="capaci-control capaci-control--select" value={project.it_owner_id || ""} onChange={(event) => updateProject(project.id, "it_owner_id", event.target.value)}>
                      {people.map((person) => <option key={person.id} value={person.id}>{personLookup[person.id]}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Fecha inicio</span>
                    <input className="capaci-control" type="date" value={project.start_date || ""} onChange={(event) => updateProject(project.id, "start_date", event.target.value)} />
                  </label>
                  <label>
                    <span>Fecha fin</span>
                    <input className="capaci-control" type="date" value={project.end_date || ""} onChange={(event) => updateProject(project.id, "end_date", event.target.value)} />
                  </label>
                </div>

                <div className="masters-milestones">
                  <div className="section-head">
                    <div>
                      <p className="eyebrow">Cronograma</p>
                      <h4>Hitos principales</h4>
                    </div>
                    <button className="ghost-button ghost-button--compact" onClick={() => addMilestone(project.id)}>Agregar hito</button>
                  </div>
                  <div className="masters-table">
                    <table className="incident-table">
                      <thead>
                        <tr>
                          <th>Descripcion</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectMilestones.length === 0 && (
                          <tr>
                            <td colSpan={2}>No hay hitos registrados.</td>
                          </tr>
                        )}
                        {projectMilestones.map((milestone) => (
                          <tr key={milestone.id}>
                            <td><input className="capaci-control" value={milestone.name} onChange={(event) => updateMilestone(milestone.id, "name", event.target.value)} /></td>
                            <td><input className="capaci-control" type="datetime-local" value={toDateTimeLocal(milestone.datetime)} onChange={(event) => updateMilestone(milestone.id, "datetime", fromDateTimeLocal(event.target.value))} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}

function splitName(value) {
  const parts = String(value || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { first_name: parts[0] || "", last_name: "" };
  }
  return {
    first_name: parts.slice(0, -1).join(" "),
    last_name: parts.at(-1) || "",
  };
}

function toDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function fromDateTimeLocal(value) {
  if (!value) return "";
  return new Date(value).toISOString();
}
