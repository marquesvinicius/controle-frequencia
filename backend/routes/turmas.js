const express = require("express");
const router = express.Router();
const supabase = require("../db/supabase");

// Listar todas as turmas
router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("turmas").select("*");
  if (error) {
    console.error("Erro ao buscar turmas:", error);
    return res.status(500).json({ error: "Erro ao buscar turmas" });
  }
  res.json(data);
});

// Criar nova turma
router.post("/", async (req, res) => {
  const { nome, turno } = req.body;
  if (!nome || !turno) {
    return res.status(400).json({ error: "Nome e turno são obrigatórios" });
  }
  const { data, error } = await supabase
    .from("turmas")
    .insert([{ nome, turno }])
    .select();
  if (error) {
    console.error("Erro ao criar turma:", error);
    return res.status(500).json({ error: "Erro ao criar turma" });
  }
  res.status(201).json(data[0]);
});

module.exports = router; 