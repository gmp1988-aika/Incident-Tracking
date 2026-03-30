import { Router } from "express";
import { query } from "../db.js";

export function registerRoutes(app) {
  const router = Router();

  router.get("/projects", async (_req, res, next) => {
    try {
      res.json(await query("select * from projects order by name"));
    } catch (error) {
      next(error);
    }
  });

  router.get("/people", async (_req, res, next) => {
    try {
      res.json(await query("select * from people order by last_name, first_name"));
    } catch (error) {
      next(error);
    }
  });

  router.get("/roles", async (_req, res, next) => {
    try {
      res.json(await query("select * from roles order by name"));
    } catch (error) {
      next(error);
    }
  });

  router.get("/assignments", async (req, res, next) => {
    try {
      const { projectId } = req.query;
      const rows = projectId
        ? await query("select * from assignments where project_id = $1 order by month, person_id", [projectId])
        : await query("select * from assignments order by month, person_id");
      res.json(rows);
    } catch (error) {
      next(error);
    }
  });

  router.put("/assignments/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const { allocation_percentage } = req.body;
      const rows = await query(
        "update assignments set allocation_percentage = $2 where id = $1 returning *",
        [id, allocation_percentage],
      );
      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  });

  router.post("/assignments/bulk", async (req, res, next) => {
    try {
      const { rows } = req.body;
      const inserted = [];
      for (const row of rows) {
        const result = await query(
          "insert into assignments (person_id, project_id, month, allocation_percentage) values ($1, $2, $3, $4) returning *",
          [row.person_id, row.project_id, row.month, row.allocation_percentage],
        );
        inserted.push(result[0]);
      }
      res.status(201).json(inserted);
    } catch (error) {
      next(error);
    }
  });

  router.get("/project-costs", async (req, res, next) => {
    try {
      const { projectId } = req.query;
      const rows = projectId
        ? await query("select * from project_costs where project_id = $1 order by month", [projectId])
        : await query("select * from project_costs order by project_id, month");
      res.json(rows);
    } catch (error) {
      next(error);
    }
  });

  router.put("/project-costs/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const { amount, cost_status } = req.body;
      const rows = await query(
        "update project_costs set amount = $2, cost_status = $3 where id = $1 returning *",
        [id, amount, cost_status],
      );
      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  });

  router.get("/milestones", async (_req, res, next) => {
    try {
      res.json(await query("select * from milestones order by datetime"));
    } catch (error) {
      next(error);
    }
  });

  router.get("/notes", async (req, res, next) => {
    try {
      const { projectId } = req.query;
      const rows = projectId
        ? await query("select * from notes where project_id = $1 order by due_date nulls last", [projectId])
        : await query("select * from notes order by due_date nulls last");
      res.json(rows);
    } catch (error) {
      next(error);
    }
  });

  router.put("/notes/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, description_long, status, start_date, due_date, responsible_id, project_id } = req.body;
      const rows = await query(
        "update notes set title = $2, description_long = $3, status = $4, start_date = $5, due_date = $6, responsible_id = $7, project_id = $8 where id = $1 returning *",
        [id, title, description_long, status, start_date, due_date, responsible_id, project_id],
      );
      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  });

  router.get("/note-tasks", async (_req, res, next) => {
    try {
      res.json(await query("select * from note_tasks order by note_id, id"));
    } catch (error) {
      next(error);
    }
  });

  router.put("/note-tasks/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const rows = await query("update note_tasks set status = $2 where id = $1 returning *", [id, status]);
      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  });

  router.post("/note-tasks", async (req, res, next) => {
    try {
      const { note_id, description, status } = req.body;
      const rows = await query(
        "insert into note_tasks (note_id, description, status) values ($1, $2, $3) returning *",
        [note_id, description, status],
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      next(error);
    }
  });

  app.use("/api", router);

  app.use((error, _req, res, _next) => {
    res.status(500).json({ error: error.message || "Unexpected server error" });
  });
}
