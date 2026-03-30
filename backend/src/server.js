import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { registerRoutes } from "./routes/index.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "capaci-track-api" });
});

registerRoutes(app);

app.listen(port, () => {
  console.log(`CapaciTrack API listening on port ${port}`);
});
