import { Router, Request, Response } from "express";
import db from "../db.js";
import { importFromFigma } from "../services/figma.js";
import { importFromStorybook } from "../services/storybook.js";

const router = Router();

const insertStmt = db.prepare(
  `INSERT OR IGNORE INTO components (id, name, category, description, code, figma_url, storybook_url, preview_url)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
);

router.post("/figma", async (req: Request, res: Response) => {
  try {
    const { fileKey, token } = req.body;
    if (!fileKey || !token) {
      res.status(400).json({ error: "fileKey and token are required" });
      return;
    }

    const components = await importFromFigma(fileKey, token);
    let imported = 0;
    let skipped = 0;

    for (const c of components) {
      const result = insertStmt.run(
        c.id, c.name, c.category, c.description, c.code, c.figma_url, null, c.preview_url
      );
      if (result.changes > 0) imported++;
      else skipped++;
    }

    const summaries = db
      .prepare("SELECT id, name, category, description FROM components ORDER BY created_at DESC LIMIT ?")
      .all(imported);

    res.json({ imported, skipped, components: summaries });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.post("/storybook", async (req: Request, res: Response) => {
  try {
    const { storybookUrl } = req.body;
    if (!storybookUrl) {
      res.status(400).json({ error: "storybookUrl is required" });
      return;
    }

    const components = await importFromStorybook(storybookUrl);
    let imported = 0;
    let skipped = 0;

    for (const c of components) {
      const result = insertStmt.run(
        c.id, c.name, c.category, c.description, c.code, null, c.storybook_url, null
      );
      if (result.changes > 0) imported++;
      else skipped++;
    }

    const summaries = db
      .prepare("SELECT id, name, category, description FROM components ORDER BY created_at DESC LIMIT ?")
      .all(imported);

    res.json({ imported, skipped, components: summaries });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

export default router;
