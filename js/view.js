// js/view.js
const View = {
    atualizarListaTurmas: async function () {
      if (!document.getElementById("turmaAluno")) return; // Só executa em cadastros.html
      try {
        const select = document.getElementById("turmaAluno");
        select.innerHTML = "";
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Selecione uma turma";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);
        const turmas = await Model.getTurmas();
        if (turmas.length === 0) {
          const option = document.createElement("option");
          option.value = "";
          option.textContent = "Nenhuma turma cadastrada";
          option.disabled = true;
          select.appendChild(option);
        } else {
          turmas.forEach((turma) => {
            const option = document.createElement("option");
            option.value = turma.id;
            option.textContent = `${turma.nome} (${turma.turno})`;
            select.appendChild(option);
          });
        }
      } catch (error) {
        console.error("Erro ao atualizar lista de turmas:", error);
        alert("Erro ao carregar turmas. Verifique o console para mais detalhes.");
      }
    },
  
    atualizarSeletorTurmas: async function (seletorId) {
      if (!document.getElementById(seletorId)) return;
      try {
        const select = document.getElementById(seletorId);
        select.innerHTML = "";
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Selecione uma turma";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);
        const turmas = await Model.getTurmas();
        if (turmas.length === 0) {
          const option = document.createElement("option");
          option.value = "";
          option.textContent = "Nenhuma turma cadastrada";
          option.disabled = true;
          select.appendChild(option);
        } else {
          turmas.forEach((turma) => {
            const option = document.createElement("option");
            option.value = turma.id;
            option.textContent = `${turma.nome} (${turma.turno})`;
            select.appendChild(option);
          });
        }
      } catch (error) {
        console.error("Erro ao atualizar seletor de turmas:", error);
      }
    },
  
    atualizarSeletorAlunos: async function (seletorId) {
        if (!document.getElementById(seletorId)) return;
        try {
          const select = document.getElementById(seletorId);
          select.innerHTML = "";
          const defaultOption = document.createElement("option");
          defaultOption.value = "";
          defaultOption.textContent = "Selecione um aluno";
          defaultOption.disabled = true;
          defaultOption.selected = true;
          select.appendChild(defaultOption);
    
          const alunos = await Model.getAlunos();
          const turmas = await Model.getTurmas(); // Busca as turmas para associar
    
          if (alunos.length === 0) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Nenhum aluno cadastrado";
            option.disabled = true;
            select.appendChild(option);
          } else {
            alunos.sort((a, b) => a.nome.localeCompare(b.nome));
            alunos.forEach((aluno) => {
              const turma = turmas.find((t) => t.id === aluno.turmaId); // Encontra a turma do aluno
              const turmaNome = turma ? turma.nome : "Turma não encontrada";
              const option = document.createElement("option");
              option.value = aluno.id;
              option.textContent = `${aluno.nome}`; // Formato: "Turma - Nome"
              select.appendChild(option);
            });
          }
        } catch (error) {
          console.error("Erro ao atualizar seletor de alunos:", error);
        }
      },
  
    renderizarListaPresenca: async function (turmaId, data) {
      if (!document.getElementById("listaPresenca")) return;
      try {
        const container = document.getElementById("listaPresenca");
        container.innerHTML = "<p>Carregando lista de alunos...</p>";
        const alunos = await Model.getAlunosByTurma(turmaId);
        if (alunos.length === 0) {
          container.innerHTML = "<p>Nenhum aluno cadastrado para esta turma.</p>";
          return;
        }
        const presencas = await Model.getPresencasByTurmaData(turmaId, data);
        let registrosExistentes = [];
        if (presencas.length > 0) {
          registrosExistentes = presencas[0].registros;
        }
        const form = document.createElement("form");
        form.id = "formPresencaSubmit";
        form.classList.add("mb-4");
        const table = document.createElement("table");
        table.classList.add("table", "table-striped");
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        const thNome = document.createElement("th");
        thNome.textContent = "Nome";
        const thPresenca = document.createElement("th");
        thPresenca.textContent = "Presente";
        headerRow.appendChild(thNome);
        headerRow.appendChild(thPresenca);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        const tbody = document.createElement("tbody");
        alunos.forEach((aluno) => {
          const row = document.createElement("tr");
          const tdNome = document.createElement("td");
          tdNome.textContent = aluno.nome;
          const tdPresenca = document.createElement("td");
          const checkPresente = document.createElement("input");
          checkPresente.type = "checkbox";
          checkPresente.name = `aluno_${aluno.id}`;
          checkPresente.value = "presente";
          checkPresente.classList.add("form-check-input");
          checkPresente.dataset.alunoId = aluno.id;
          const registroExistente = registrosExistentes.find((r) => r.alunoId === aluno.id);
          if (registroExistente && registroExistente.presente) {
            checkPresente.checked = true;
          }
          tdPresenca.appendChild(checkPresente);
          row.appendChild(tdNome);
          row.appendChild(tdPresenca);
          tbody.appendChild(row);
        });
        table.appendChild(tbody);
        form.appendChild(table);
        const submitBtn = document.createElement("button");
        submitBtn.type = "submit";
        submitBtn.classList.add("btn", "btn-primary");
        submitBtn.textContent = "Salvar Presenças";
        form.appendChild(submitBtn);
        container.innerHTML = "";
        container.appendChild(form);
  
        form.addEventListener("submit", async (event) => {
          event.preventDefault();
          const registros = [];
          alunos.forEach((aluno) => {
            const checkbox = document.querySelector(`input[data-aluno-id="${aluno.id}"]`);
            registros.push({
              alunoid: aluno.id,
              presente: checkbox.checked,
            });
          });
          try {
            await Model.registrarPresencas(turmaId, data, registros);
            alert("Presenças registradas com sucesso!");
            await this.renderizarListaPresenca(turmaId, data);
          } catch (error) {
            console.error("Erro ao salvar presenças:", error);
            alert("Erro ao salvar presenças. Verifique o console.");
          }
        });
      } catch (error) {
        console.error("Erro ao renderizar lista de presença:", error);
        const container = document.getElementById("listaPresenca");
        if (container) {
          container.innerHTML = "<p>Erro ao carregar lista. Verifique o console.</p>";
        }
      }
    },
  
    renderizarRelatorioFrequencia: async function (turmaId, data) {
      if (!document.getElementById("relatorioFrequencia")) return;
      try {
        const container = document.getElementById("relatorioFrequencia");
        container.innerHTML = "<p>Carregando relatório de frequência...</p>";
        const turmas = await Model.getTurmas();
        const turma = turmas.find((t) => t.id === turmaId);
        if (!turma) {
          container.innerHTML = "<p>Turma não encontrada.</p>";
          return;
        }
        const presencas = await Model.getPresencasByTurmaData(turmaId, data);
        if (presencas.length === 0) {
          container.innerHTML = `<div class="alert alert-info">Não há registro de frequência para a turma ${turma.nome} na data ${data}.</div>`;
          return;
        }
        const alunos = await Model.getAlunosByTurma(turmaId);
        if (alunos.length === 0) {
          container.innerHTML = "<p>Nenhum aluno cadastrado para esta turma.</p>";
          return;
        }
        const reportHeader = document.createElement("div");
        reportHeader.innerHTML = `
          <h3>Relatório de Frequência</h3>
          <p>Turma: ${turma.nome} (${turma.turno})</p>
          <p>Data: ${data}</p>
        `;
        const table = document.createElement("table");
        table.classList.add("table", "table-striped");
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        const thNome = document.createElement("th");
        thNome.textContent = "Nome";
        const thStatus = document.createElement("th");
        thStatus.textContent = "Status";
        headerRow.appendChild(thNome);
        headerRow.appendChild(thStatus);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        const tbody = document.createElement("tbody");
        const registros = presencas[0].registros;
        let presentes = 0;
        let ausentes = 0;
        alunos.forEach((aluno) => {
          const row = document.createElement("tr");
          const tdNome = document.createElement("td");
          tdNome.textContent = aluno.nome;
          const tdStatus = document.createElement("td");
          const registro = registros.find((r) => r.alunoid === aluno.id);
          if (registro && registro.presente) {
            tdStatus.textContent = "Presente";
            tdStatus.classList.add("text-success");
            presentes++;
          } else {
            tdStatus.textContent = "Ausente";
            tdStatus.classList.add("text-danger");
            ausentes++;
          }
          row.appendChild(tdNome);
          row.appendChild(tdStatus);
          tbody.appendChild(row);
        });
        table.appendChild(tbody);
        const summary = document.createElement("div");
        const total = alunos.length;
        const percentPresentes = ((presentes / total) * 100).toFixed(1);
        summary.innerHTML = `
          <p class="mt-3">
            <strong>Resumo:</strong> ${presentes} presentes (${percentPresentes}%) e ${ausentes} ausentes de um total de ${total} alunos.
          </p>
        `;
        container.innerHTML = "";
        container.appendChild(reportHeader);
        container.appendChild(table);
        container.appendChild(summary);
      } catch (error) {
        console.error("Erro ao renderizar relatório de frequência:", error);
        const container = document.getElementById("relatorioFrequencia");
        if (container) {
          container.innerHTML = "<p>Erro ao carregar relatório. Verifique o console para mais detalhes.</p>";
        }
      }
    },
  
    renderizarRelatorioAluno: async function (alunoId) {
      if (!document.getElementById("relatorioAluno")) return;
      try {
        const container = document.getElementById("relatorioAluno");
        container.innerHTML = "<p>Carregando relatório do aluno...</p>";
        const alunos = await Model.getAlunos();
        const aluno = alunos.find((a) => a.id === alunoId);
        if (!aluno) {
          container.innerHTML = "<p>Aluno não encontrado.</p>";
          return;
        }
        const turmas = await Model.getTurmas();
        const turma = turmas.find((t) => t.id === aluno.turmaId);
        const historicoPresenca = await Model.getPresencasByAluno(alunoId);
        const reportHeader = document.createElement("div");
        reportHeader.innerHTML = `
          <h3>Relatório de Frequência Individual</h3>
          <p>Aluno: ${aluno.nome}</p>
          <p>Turma: ${turma ? `${turma.nome} (${turma.turno})` : "Não encontrada"}</p>
        `;
        if (historicoPresenca.length === 0) {
          container.innerHTML = "";
          container.appendChild(reportHeader);
          container.innerHTML += `<div class="alert alert-info">Não há registros de frequência para este aluno.</div>`;
          return;
        }
        const table = document.createElement("table");
        table.classList.add("table", "table-striped");
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        const thData = document.createElement("th");
        thData.textContent = "Data";
        const thStatus = document.createElement("th");
        thStatus.textContent = "Status";
        headerRow.appendChild(thData);
        headerRow.appendChild(thStatus);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        const tbody = document.createElement("tbody");
        historicoPresenca.sort((a, b) => new Date(b.data) - new Date(a.data));
        let presentes = 0;
        let ausentes = 0;
        historicoPresenca.forEach((registro) => {
          const row = document.createElement("tr");
          const tdData = document.createElement("td");
          tdData.textContent = registro.data;
          const tdStatus = document.createElement("td");
          if (registro.presente) {
            tdStatus.textContent = "Presente";
            tdStatus.classList.add("text-success");
            presentes++;
          } else {
            tdStatus.textContent = "Ausente";
            tdStatus.classList.add("text-danger");
            ausentes++;
          }
          row.appendChild(tdData);
          row.appendChild(tdStatus);
          tbody.appendChild(row);
        });
        table.appendChild(tbody);
        const summary = document.createElement("div");
        const total = historicoPresenca.length;
        const percentPresentes = ((presentes / total) * 100).toFixed(1);
        summary.innerHTML = `
          <p class="mt-3">
            <strong>Resumo:</strong> Presente em ${presentes} de ${total} aulas (${percentPresentes}% de frequência).
          </p>
        `;
        container.innerHTML = "";
        container.appendChild(reportHeader);
        container.appendChild(table);
        container.appendChild(summary);
      } catch (error) {
        console.error("Erro ao renderizar relatório do aluno:", error);
        const container = document.getElementById("relatorioAluno");
        if (container) {
          container.innerHTML = "<p>Erro ao carregar relatório. Verifique o console para mais detalhes.</p>";
        }
      }
    },
  };