const express = require("express");
const router = express.Router();
const supabase = require("../db/supabase");

// Listar todos os alunos
router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("alunos").select("*");
  if (error) {
    console.error("Erro ao buscar alunos:", error);
    return res.status(500).json({ error: "Erro ao buscar alunos" });
  }
  res.json(data);
});

// Listar alunos por turma
router.get("/turma/:turmaid", async (req, res) => {
  const { turmaid } = req.params;
  const { data, error } = await supabase
    .from("alunos")
    .select("*")
    .eq("turma_id", turmaid);
  if (error) {
    console.error("Erro ao buscar alunos da turma:", error);
    return res.status(500).json({ error: "Erro ao buscar alunos da turma" });
  }
  res.json(data);
});

// Criar novo aluno
router.post("/", async (req, res) => {
  const { nome, turmaid } = req.body;
  if (!nome || !turmaid) {
    return res.status(400).json({ error: "Nome e turmaId são obrigatórios" });
  }
  const { data: turma, error: turmaError } = await supabase
    .from("turmas")
    .select("id")
    .eq("id", turmaid)
    .single();
  if (turmaError || !turma) {
    return res.status(404).json({ error: "Turma não encontrada" });
  }
  const { data, error } = await supabase
    .from("alunos")
    .insert([{ nome, turma_id: turmaid }])
    .select();
  if (error) {
    console.error("Erro ao criar aluno:", error);
    return res.status(500).json({ error: "Erro ao criar aluno" });
  }
  res.status(201).json(data[0]);
});

module.exports = router; 