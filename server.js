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

app.get("/api/alunos/turma/:turmaId", async (req, res) => {
  const { turmaId } = req.params;
  const { data, error } = await supabase
    .from("alunos")
    .select("*")
    .eq("turma_id", turmaId);
  if (error) {
    console.error("Erro ao buscar alunos da turma:", error);
    return res.status(500).json({ error: "Erro ao buscar alunos da turma" });
  }
  res.json(data);
});

app.post("/api/alunos", async (req, res) => {
  const { nome, turmaId } = req.body;
  if (!nome || !turmaId) {
    return res.status(400).json({ error: "Nome e turmaId são obrigatórios" });
  }
  const { data: turma, error: turmaError } = await supabase
    .from("turmas")
    .select("id")
    .eq("id", turmaId)
    .single();
  if (turmaError || !turma) {
    return res.status(404).json({ error: "Turma não encontrada" });
  }
  const { data, error } = await supabase
    .from("alunos")
    .insert([{ nome, turma_id: turmaId }])
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

app.get("/api/presencas/turma/:turmaId/data/:data", async (req, res) => {
  const { turmaId, data } = req.params;
  const { data: presencas, error } = await supabase
    .from("presencas")
    .select("*")
    .eq("turma_id", turmaId)
    .eq("data", data);
  if (error) {
    console.error("Erro ao buscar presenças:", error);
    return res.status(500).json({ error: "Erro ao buscar presenças" });
  }
  res.json(presencas);
});

app.get("/api/presencas/aluno/:alunoId", async (req, res) => {
  const { alunoId } = req.params;
  const { data: presencas, error } = await supabase
    .from("presencas")
    .select("data, turma_id, registros");
  if (error) {
    console.error("Erro ao buscar presenças do aluno:", error);
    return res.status(500).json({ error: "Erro ao buscar presenças do aluno" });
  }
  const historicoAluno = presencas
    .filter((p) => p.registros.some((r) => r.alunoId === alunoId))
    .map((p) => {
      const registro = p.registros.find((r) => r.alunoId === alunoId);
      return {
        data: p.data,
        turmaId: p.turma_id,
        presente: registro.presente,
      };
    });
  res.json(historicoAluno);
});

app.post("/api/presencas", async (req, res) => {
  const { turmaId, data, registros } = req.body;
  if (!turmaId || !data || !registros || !Array.isArray(registros)) {
    return res.status(400).json({
      error: "Dados incompletos. Forneça turmaId, data e um array de registros",
    });
  }
  for (const registro of registros) {
    if (!registro.alunoId || typeof registro.presente !== "boolean") {
      return res.status(400).json({
        error: "Cada registro deve ter alunoId e status de presença (boolean)",
      });
    }
  }
  const { data: existing, error: checkError } = await supabase
    .from("presencas")
    .select("id")
    .eq("turma_id", turmaId)
    .eq("data", data)
    .single();
  if (checkError && checkError.code !== "PGRST116") {
    console.error("Erro ao verificar presença existente:", checkError);
    return res.status(500).json({ error: "Erro ao verificar presenças" });
  }
  if (existing) {
    const { data, error } = await supabase
      .from("presencas")
      .update({ registros })
      .eq("id", existing.id)
      .select();
    if (error) {
      console.error("Erro ao atualizar presenças:", error);
      return res.status(500).json({ error: "Erro ao atualizar presenças" });
    }
    res.status(200).json(data[0]);
  } else {
    const { data, error } = await supabase
      .from("presencas")
      .insert([{ turma_id: turmaId, data, registros }])
      .select();
    if (error) {
      console.error("Erro ao registrar presenças:", error);
      return res.status(500).json({ error: "Erro ao registrar presenças" });
    }
    res.status(201).json(data[0]);
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});