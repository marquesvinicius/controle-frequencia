// js/model.js
const Model = {
    API_URL: "/api",

    async getTurmas() {
        try {
            const response = await fetch(`${this.API_URL}/turmas`);
            if (!response.ok) throw new Error("Erro ao buscar turmas");
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar turmas:", error);
            return [];
        }
    },

    async addTurma(nome, turno) {
        try {
            const response = await fetch(`${this.API_URL}/turmas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, turno }),
            });
            if (!response.ok) throw new Error("Erro ao criar turma");
            return await response.json();
        } catch (error) {
            console.error("Erro ao adicionar turma:", error);
            return null;
        }
    },

    async getAlunos() {
        try {
            const response = await fetch(`${this.API_URL}/alunos`);
            if (!response.ok) throw new Error("Erro ao buscar alunos");
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar alunos:", error);
            return [];
        }
    },

    async getAlunosByTurma(turmaid) {
        try {
            const response = await fetch(`${this.API_URL}/alunos/turma/${turmaid}`);
            if (!response.ok) throw new Error("Erro ao buscar alunos da turma");
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar alunos da turma:", error);
            return [];
        }
    },

    async addAluno(nome, turmaid) {
        try {
            const response = await fetch(`${this.API_URL}/alunos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, turmaid }),
            });
            if (!response.ok) throw new Error("Erro ao criar aluno");
            return await response.json();
        } catch (error) {
            console.error("Erro ao adicionar aluno:", error);
            return null;
        }
    },

    async registrarPresencas(turmaid, data, registros) {
        try {
            const response = await fetch(`${this.API_URL}/presencas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ turmaid, data, registros }),
            });
            if (!response.ok) throw new Error("Erro ao registrar presenças");
            return await response.json();
        } catch (error) {
            console.error("Erro ao registrar presenças:", error);
            return null;
        }
    },

    async getPresencasByTurmaData(turmaid, data) {
        try {
            const response = await fetch(`${this.API_URL}/presencas/turma/${turmaid}/data/${data}`);
            if (!response.ok) throw new Error("Erro ao buscar presenças");
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar presenças:", error);
            return [];
        }
    },

    async getPresencasByAluno(alunoid) {
        try {
            const response = await fetch(`${this.API_URL}/presencas/aluno/${alunoid}`);
            if (!response.ok) throw new Error("Erro ao buscar presenças do aluno");
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar presenças do aluno:", error);
            return [];
        }
    },

    formatarData(data) {
        if (data instanceof Date) {
            return data.toISOString().split("T")[0];
        }
        return data;
    },
};