import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import db from "../db.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const { q, category } = req.query;

  if (q) {
    const rows = db
      .prepare(
        `SELECT c.* FROM components c
         JOIN components_fts f ON c.rowid = f.rowid
         WHERE components_fts MATCH ?
         ORDER BY rank`
      )
      .all(String(q));
    res.json(rows);
    return;
  }

  if (category) {
    const rows = db
      .prepare("SELECT * FROM components WHERE category = ? ORDER BY name")
      .all(String(category));
    res.json(rows);
    return;
  }

  const rows = db
    .prepare("SELECT * FROM components ORDER BY updated_at DESC")
    .all();
  res.json(rows);
});

router.get("/:id", (req: Request, res: Response) => {
  const row = db.prepare("SELECT * FROM components WHERE id = ?").get(req.params.id);
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(row);
});

router.post("/", (req: Request, res: Response) => {
  const { name, category, description, code, usage, layout, tokens, props, figma_url, storybook_url, preview_url } = req.body;
  if (!name || !code) {
    res.status(400).json({ error: "name and code are required" });
    return;
  }
  const id = randomUUID();
  db.prepare(
    `INSERT INTO components (id, name, category, description, code, usage, layout, tokens, props, figma_url, storybook_url, preview_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, name, category || "general", description || null, code, usage || null, layout || null, tokens || null, props || null, figma_url || null, storybook_url || null, preview_url || null);

  const row = db.prepare("SELECT * FROM components WHERE id = ?").get(id);
  res.status(201).json(row);
});

router.put("/:id", (req: Request, res: Response) => {
  const existing = db.prepare("SELECT * FROM components WHERE id = ?").get(req.params.id) as Record<string, unknown> | undefined;
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const fields = ["name", "category", "description", "code", "usage", "layout", "tokens", "props", "figma_url", "storybook_url", "preview_url"];
  const updates: string[] = [];
  const values: unknown[] = [];

  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(req.body[f]);
    }
  }

  if (updates.length === 0) {
    res.json(existing);
    return;
  }

  updates.push("updated_at = datetime('now')");
  values.push(req.params.id);

  db.prepare(`UPDATE components SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  const row = db.prepare("SELECT * FROM components WHERE id = ?").get(req.params.id);
  res.json(row);
});

router.delete("/:id", (req: Request, res: Response) => {
  const result = db.prepare("DELETE FROM components WHERE id = ?").run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ok: true });
});

export default router;
