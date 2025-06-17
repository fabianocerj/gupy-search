import express from "express";
import axios from "axios";
import { load } from "cheerio";
import { subdomains } from "./subdomains.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/buscar", async (req, res) => {
  const termo = (req.query.q || "").trim().toLowerCase();
  if (!termo) return res.status(400).json({ erro: "Palavra-chave ausente" });
  const resultados = [];
  await Promise.all(subdomains.map(async sub => {
    const url = `https://${sub}.gupy.io/jobs?q=${encodeURIComponent(termo)}`;
    try {
      const { data } = await axios.get(url, { timeout: 5000 });
      const encontrou = load(data)("div[class*=job-listing]").length > 0;
      if (encontrou) resultados.push(url);
    } catch {}
  }));
  res.json({ resultados });
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
