const express = require("express");
const router = express.Router();
const supabase = require("../db/supabase");

// Listar todas as presenças
router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("presencas").select("*");
  if (error) {
    console.error("Erro ao buscar presenças:", error);
    return res.status(500).json({ error: "Erro ao buscar presenças" });
  }
  res.json(data);
});

// Buscar presenças por turma e data
router.get("/turma/:turmaid/data/:data", async (req, res) => {
  const { turmaid, data } = req.params;
  const { data: presenca, error: presencaError } = await supabase
    .from("presencas")
    .select("id")
    .eq("turma_id", turmaid)
    .eq("data", data)
    .single();
  if (presencaError && presencaError.code !== "PGRST116") {
    console.error("Erro ao buscar presenças:", presencaError);
    return res.status(500).json({ error: "Erro ao buscar presenças" });
  }
  if (!presenca) {
    return res.json({ turma_id: turmaid, data, registros: [] });
  }
  const { data: registros, error: registrosError } = await supabase
    .from("presenca_alunos")
    .select("aluno_id, presente")
    .eq("presenca_id", presenca.id);
  if (registrosError) {
    console.error("Erro ao buscar registros de presença:", registrosError);
    return res.status(500).json({ error: "Erro ao buscar registros de presença" });
  }
  const registrosFormatados = registros.map((registro) => ({
    alunoid: registro.aluno_id,
    presente: registro.presente,
  }));
  res.json({ turma_id: turmaid, data, registros: registrosFormatados });
});

// Buscar presenças por aluno
router.get("/aluno/:alunoid", async (req, res) => {
  const { alunoid } = req.params;
  const { data: presencas, error } = await supabase
    .from("presenca_alunos")
    .select("presente, presenca_id, presencas (turma_id, data)")
    .eq("aluno_id", alunoid);
  if (error) {
    console.error("Erro ao buscar presenças do aluno:", error);
    return res.status(500).json({ error: "Erro ao buscar presenças do aluno" });
  }
  const historicoAluno = presencas.map((p) => ({
    data: p.presencas.data,
    turmaid: p.presencas.turma_id,
    presente: p.presente,
  }));
  res.json(historicoAluno);
});

// Registrar presenças
router.post("/", async (req, res) => {
  const { turmaid, data, registros } = req.body;
  if (!turmaid || !data || !registros || !Array.isArray(registros)) {
    return res.status(400).json({
      error: "Dados incompletos. Forneça turmaId, data e um array de registros",
    });
  }
  for (const registro of registros) {
    if (
      !registro.alunoid ||
      typeof registro.alunoid !== "string" ||
      typeof registro.presente !== "boolean"
    ) {
      return res.status(400).json({
        error: "Cada registro deve ter alunoid (string) e presente (boolean)",
      });
    }
  }
  const { data: turma, error: turmaError } = await supabase
    .from("turmas")
    .select("id")
    .eq("id", turmaid)
    .single();
  if (turmaError || !turma) {
    return res.status(404).json({ error: "Turma não encontrada" });
  }
  const { data: existingPresenca, error: checkError } = await supabase
    .from("presencas")
    .select("id")
    .eq("turma_id", turmaid)
    .eq("data", data)
    .single();
  if (checkError && checkError.code !== "PGRST116") {
    console.error("Erro ao verificar presença existente:", checkError);
    return res.status(500).json({ error: "Erro ao verificar presenças" });
  }
  let presencaId;
  if (existingPresenca) {
    presencaId = existingPresenca.id;
    const { error: deleteError } = await supabase
      .from("presenca_alunos")
      .delete()
      .eq("presenca_id", presencaId);
    if (deleteError) {
      console.error("Erro ao deletar registros antigos:", deleteError);
      return res.status(500).json({ error: "Erro ao atualizar presenças" });
    }
  } else {
    const { data: newPresenca, error: insertError } = await supabase
      .from("presencas")
      .insert([{ turma_id: turmaid, data }])
      .select()
      .single();
    if (insertError) {
      console.error("Erro ao criar registro de presenças:", insertError);
      return res.status(500).json({ error: "Erro ao criar registro de presenças" });
    }
    presencaId = newPresenca.id;
  }
  const registrosParaInserir = registros.map((registro) => ({
    presenca_id: presencaId,
    aluno_id: registro.alunoid,
    presente: registro.presente,
  }));
  const { data: insertedRegistros, error: insertRegistrosError } = await supabase
    .from("presenca_alunos")
    .insert(registrosParaInserir)
    .select();
  if (insertRegistrosError) {
    console.error("Erro ao inserir registros de presença:", insertRegistrosError);
    return res.status(500).json({ error: "Erro ao inserir registros de presença" });
  }
  const registrosFormatados = insertedRegistros.map((registro) => ({
    alunoid: registro.aluno_id,
    presente: registro.presente,
  }));
  res.status(existingPresenca ? 200 : 201).json({
    turma_id: turmaid,
    data,
    registros: registrosFormatados,
  });
});

module.exports = router; 
