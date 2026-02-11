import express from "express";
import cors from "cors";
import componentsRouter from "./routes/components.js";
import importRouter from "./routes/import.js";
import statsRouter from "./routes/stats.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use("/api/components", componentsRouter);
app.use("/api/import", importRouter);
app.use("/api/stats", statsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
