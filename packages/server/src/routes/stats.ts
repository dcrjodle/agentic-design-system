import { Router, Request, Response } from "express";
import db from "../db.js";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  const total = (db.prepare("SELECT COUNT(*) as count FROM components").get() as { count: number }).count;
  const categories = db.prepare("SELECT category, COUNT(*) as count FROM components GROUP BY category ORDER BY count DESC").all();
  const recent = db.prepare("SELECT id, name, category, description FROM components ORDER BY updated_at DESC LIMIT 10").all();
  res.json({ total, categories, recent });
});

export default router;
