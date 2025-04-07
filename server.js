// server.js
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes para Turmas
app.get("/api/turmas", async (req, res) => {
  const { data, error } = await supabase.from("turmas").select("*");
  if (error) {
    console.error("Erro ao buscar turmas:", error);
    return res.status(500).json({ error: "Erro ao buscar turmas" });
  }
  res.json(data);
});

app.post("/api/turmas", async (req, res) => {
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

// API Routes para Alunos
app.get("/api/alunos", async (req, res) => {
  const { data, error } = await supabase.from("alunos").select("*");
  if (error) {
    console.error("Erro ao buscar alunos:", error);
    return res.status(500).json({ error: "Erro ao buscar alunos" });
  }
  res.json(data);
});

app.get("/api/alunos/turma/:turmaid", async (req, res) => {
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

app.post("/api/alunos", async (req, res) => {
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

// API Routes para Presenças
app.get("/api/presencas", async (req, res) => {
  const { data, error } = await supabase.from("presencas").select("*");
  if (error) {
    console.error("Erro ao buscar presenças:", error);
    return res.status(500).json({ error: "Erro ao buscar presenças" });
  }
  res.json(data);
});

app.get("/api/presencas/turma/:turmaid/data/:data", async (req, res) => {
  const { turmaid, data } = req.params;
  // Primeiro, buscar o registro de presenças para a turma e data
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
    // Se não houver registro de presenças, retornar um objeto vazio com registros vazios
    return res.json({ turma_id: turmaid, data, registros: [] });
  }
  // Buscar os registros de presença dos alunos
  const { data: registros, error: registrosError } = await supabase
    .from("presenca_alunos")
    .select("aluno_id, presente")
    .eq("presenca_id", presenca.id);
  if (registrosError) {
    console.error("Erro ao buscar registros de presença:", registrosError);
    return res.status(500).json({ error: "Erro ao buscar registros de presença" });
  }
  // Formatar os registros no formato esperado pelo frontend
  const registrosFormatados = registros.map((registro) => ({
    alunoid: registro.aluno_id,
    presente: registro.presente,
  }));
  res.json({ turma_id: turmaid, data, registros: registrosFormatados });
});

app.get("/api/presencas/aluno/:alunoid", async (req, res) => {
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

app.post("/api/presencas", async (req, res) => {
  const { turmaid, data, registros } = req.body;
  if (!turmaid || !data || !registros || !Array.isArray(registros)) {
    return res.status(400).json({
      error: "Dados incompletos. Forneça turmaId, data e um array de registros",
    });
  }
  // Validar o formato de cada registro
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
  // Validar se a turma existe
  const { data: turma, error: turmaError } = await supabase
    .from("turmas")
    .select("id")
    .eq("id", turmaid)
    .single();
  if (turmaError || !turma) {
    return res.status(404).json({ error: "Turma não encontrada" });
  }
  // Verificar se já existe um registro de presenças para essa turma e data
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
    // Deletar os registros antigos de presença para essa chamada
    const { error: deleteError } = await supabase
      .from("presenca_alunos")
      .delete()
      .eq("presenca_id", presencaId);
    if (deleteError) {
      console.error("Erro ao deletar registros antigos:", deleteError);
      return res.status(500).json({ error: "Erro ao atualizar presenças" });
    }
  } else {
    // Criar um novo registro de presenças
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
  // Inserir os novos registros de presença dos alunos
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
  // Retornar o registro de presenças no formato esperado pelo frontend
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});