const express = require("express");
const cors = require("cors");

const turmasRoutes = require("./routes/turmas");
const alunosRoutes = require("./routes/alunos");
const presencasRoutes = require("./routes/presencas");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/turmas", turmasRoutes);
app.use("/api/alunos", alunosRoutes);
app.use("/api/presencas", presencasRoutes);

app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app; 
