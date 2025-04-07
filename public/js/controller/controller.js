const Controller = {
    init: async function () {
        const path = window.location.pathname;
        if (path.includes("cadastros.html")) {
            this.initCadastros();
        } else if (path.includes("marcar-presenca.html")) {
            this.initMarcarPresenca();
        } else if (path.includes("consultar-frequencias.html")) {
            this.initConsultarFrequencia();
        } else if (path.includes("relatorio-aluno.html")) {
            this.initRelatorioAluno();
        }
    },
  
    initCadastros: async function () {
        const formTurma = document.getElementById("formTurma");
        const formAluno = document.getElementById("formAluno");
        if (formTurma) {
            formTurma.addEventListener("submit", this.handleAddTurma.bind(this));
        }
        if (formAluno) {
            formAluno.addEventListener("submit", this.handleAddAluno.bind(this));
        }
        await View.atualizarListaTurmas();
    },
  
    initMarcarPresenca: async function () {
        const formPresenca = document.getElementById("formPresenca");
        if (formPresenca) {
            formPresenca.addEventListener("submit", this.handleLoadAttendanceList.bind(this));
            document.getElementById("dataPresenca").max = new Date().toISOString().split("T")[0];
        }
        await View.atualizarSeletorTurmas("turmaPresenca");
    },
  
    initConsultarFrequencia: async function () {
        const formConsultaFrequencia = document.getElementById("formConsultaFrequencia");
        if (formConsultaFrequencia) {
            formConsultaFrequencia.addEventListener("submit", this.handleShowClassReport.bind(this));
        }
        await View.atualizarSeletorTurmas("turmaFrequencia");
    },
  
    initRelatorioAluno: async function () {
        const formRelatorioAluno = document.getElementById("formRelatorioAluno");
        if (formRelatorioAluno) {
            formRelatorioAluno.addEventListener("submit", this.handleShowStudentReport.bind(this));
        }
        await View.atualizarSeletorAlunos("alunoRelatorio");
    },
  
    handleAddTurma: async function (event) {
        event.preventDefault();
        const nomeTurma = document.getElementById("nomeTurma").value;
        const turnoTurma = document.getElementById("turnoTurma").value;
        try {
            const novaTurma = await Model.addTurma(nomeTurma, turnoTurma);
            if (novaTurma) {
                alert(`Turma "${nomeTurma}" cadastrada com sucesso!`);
                document.getElementById("formTurma").reset();
                await View.atualizarListaTurmas();
            } else {
                alert("Erro ao cadastrar turma. Tente novamente.");
            }
        } catch (error) {
            console.error("Erro ao adicionar turma:", error);
            alert("Erro ao cadastrar turma. Verifique o console para mais detalhes.");
        }
    },
  
    handleAddAluno: async function (event) {
        event.preventDefault();
        const nomeAluno = document.getElementById("nomeAluno").value;
        const turmaId = document.getElementById("turmaAluno").value;
        try {
            const novoAluno = await Model.addAluno(nomeAluno, turmaId);
            if (novoAluno) {
                alert(`Aluno "${nomeAluno}" cadastrado com sucesso!`);
                document.getElementById("formAluno").reset();
            } else {
                alert("Erro ao cadastrar aluno. Tente novamente.");
            }
        } catch (error) {
            console.error("Erro ao adicionar aluno:", error);
            alert("Erro ao cadastrar aluno. Verifique o console para mais detalhes.");
        }
    },
  
    handleLoadAttendanceList: async function (event) {
        event.preventDefault();
        const turmaId = document.getElementById("turmaPresenca").value;
        const data = document.getElementById("dataPresenca").value;
        try {
            if (!turmaId || !data) {
                alert("Por favor, selecione uma turma e uma data.");
                return;
            }
            await View.renderizarListaPresenca(turmaId, data);
        } catch (error) {
            console.error("Erro ao carregar lista de presença:", error);
            alert("Erro ao carregar lista de presença. Verifique o console para mais detalhes.");
        }
    },
  
    handleShowClassReport: async function (event) {
        event.preventDefault();
        const turmaId = document.getElementById("turmaFrequencia").value;
        const data = document.getElementById("dataFrequencia").value;
        try {
            if (!turmaId || !data) {
                alert("Por favor, selecione uma turma e uma data.");
                return;
            }
            await View.renderizarRelatorioFrequencia(turmaId, data);
        } catch (error) {
            console.error("Erro ao exibir relatório de frequência:", error);
            alert("Erro ao exibir relatório de frequência. Verifique o console para mais detalhes.");
        }
    },
  
    handleShowStudentReport: async function (event) {
        event.preventDefault();
        const alunoId = document.getElementById("alunoRelatorio").value;
        try {
            if (!alunoId) {
                alert("Por favor, selecione um aluno.");
                return;
            }
            await View.renderizarRelatorioAluno(alunoId);
        } catch (error) {
            console.error("Erro ao exibir relatório do aluno:", error);
            alert("Erro ao exibir relatório do aluno. Verifique o console para mais detalhes.");
        }
    },
};
  
document.addEventListener("DOMContentLoaded", function () {
    Controller.init();
});
