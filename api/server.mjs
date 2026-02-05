import express from "express";

const app = express();
app.use(express.text({ type: "*/*", limit: "15mb" }));

app.get("/health", (req, res) => res.status(200).send("ok"));

app.post("/render/invoice", async (req, res) => {
  const xml = req.body;

  if (!xml || typeof xml !== "string") {
    return res.status(400).send("XML required");
  }

  // NA START: zwracamy "placeholder" aby upewnić się, że REST działa.
  // Docelowo tu podłączymy właściwe generowanie PDF.
  res.status(501).send("PDF generator not wired yet (REST works).");
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on :${port}`));
