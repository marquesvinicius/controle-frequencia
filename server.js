// server.js
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 3000;

const TURMAS_FILE = path.join(__dirname, "data", "turmas.json");
const ALUNOS_FILE = path.join(__dirname, "data", "alunos.json");
const PRESENCAS_FILE = path.join(__dirname, "data", "presencas.json");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Helper Functions
async function readData(file) {
  try {
    const data = await fs.readFile(file, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeData(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

// API Routes for Turmas
app.get("/api/turmas", async (req, res) => {
  const turmas = await readData(TURMAS_FILE);
  res.json(turmas);
});

app.post("/api/turmas", async (req, res) => {
  try {
    const { nome, turno } = req.body;
    if (!nome || !turno) {
      return res.status(400).json({ error: "Nome e turno são obrigatórios" });
    }
    const turmas = await readData(TURMAS_FILE);
    const novaTurma = {
      id: uuidv4(),
      nome,
      turno,
      dataCriacao: new Date().toISOString(),
    };
    turmas.push(novaTurma);
    await writeData(TURMAS_FILE, turmas);
    res.status(201).json(novaTurma);
  } catch (error) {
    console.error("Error creating turma:", error);
    res.status(500).json({ error: "Erro ao criar turma" });
  }
});

// API Routes for Alunos
app.get("/api/alunos", async (req, res) => {
  const alunos = await readData(ALUNOS_FILE);
  res.json(alunos);
});

app.get("/api/alunos/turma/:turmaId", async (req, res) => {
  const { turmaId } = req.params;
  const alunos = await readData(ALUNOS_FILE);
  const alunosTurma = alunos.filter((aluno) => aluno.turmaId === turmaId);
  res.json(alunosTurma);
});

app.post("/api/alunos", async (req, res) => {
  try {
    const { nome, turmaId } = req.body;
    if (!nome || !turmaId) {
      return res.status(400).json({ error: "Nome e turmaId são obrigatórios" });
    }
    const turmas = await readData(TURMAS_FILE);
    const turmaExists = turmas.some((turma) => turma.id === turmaId);
    if (!turmaExists) {
      return res.status(404).json({ error: "Turma não encontrada" });
    }
    const alunos = await readData(ALUNOS_FILE);
    const novoAluno = {
      id: uuidv4(),
      nome,
      turmaId,
      dataCadastro: new Date().toISOString(),
    };
    alunos.push(novoAluno);
    await writeData(ALUNOS_FILE, alunos);
    res.status(201).json(novoAluno);
  } catch (error) {
    console.error("Error creating aluno:", error);
    res.status(500).json({ error: "Erro ao criar aluno" });
  }
});

// API Routes for Presenças
app.get("/api/presencas", async (req, res) => {
  const presencas = await readData(PRESENCAS_FILE);
  res.json(presencas);
});

app.get("/api/presencas/turma/:turmaId/data/:data", async (req, res) => {
  try {
    const { turmaId, data } = req.params;
    if (!turmaId || !data) {
      return res.status(400).json({ error: "ID da turma e data são obrigatórios" });
    }
    const presencas = await readData(PRESENCAS_FILE);
    const presencasFiltradas = presencas.filter((p) => p.turmaId === turmaId && p.data === data);
    res.json(presencasFiltradas);
  } catch (error) {
    console.error("Error getting attendance by class and date:", error);
    res.status(500).json({ error: "Erro ao buscar presenças" });
  }
});

app.get("/api/presencas/aluno/:alunoId", async (req, res) => {
  try {
    const { alunoId } = req.params;
    if (!alunoId) {
      return res.status(400).json({ error: "ID do aluno é obrigatório" });
    }
    const presencas = await readData(PRESENCAS_FILE);
    const registrosPresenca = presencas.filter((p) => p.registros.some((r) => r.alunoId === alunoId));
    const historicoAluno = registrosPresenca.map((p) => {
      const registro = p.registros.find((r) => r.alunoId === alunoId);
      return {
        data: p.data,
        turmaId: p.turmaId,
        presente: registro.presente,
      };
    });
    res.json(historicoAluno);
  } catch (error) {
    console.error("Error getting student attendance:", error);
    res.status(500).json({ error: "Erro ao buscar presença do aluno" });
  }
});

app.post("/api/presencas", async (req, res) => {
  try {
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
    const presencas = await readData(PRESENCAS_FILE);
    const existingIndex = presencas.findIndex((p) => p.turmaId === turmaId && p.data === data);
    if (existingIndex >= 0) {
      presencas[existingIndex].registros = registros;
    } else {
      presencas.push({ turmaId, data, registros });
    }
    await writeData(PRESENCAS_FILE, presencas);
    res.status(201).json({ turmaId, data, registros });
  } catch (error) {
    console.error("Error registering attendance:", error);
    res.status(500).json({ error: "Erro ao registrar presenças" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});