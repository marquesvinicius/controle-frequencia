# Controle de Frequência de Alunos

Este projeto é uma atividade da disciplina de Arquitetura de Software da UNIRV, no curso de Engenharia de Software.

## Objetivo

Desenvolver um sistema para controle de presença de alunos, com as seguintes funcionalidades:
- Cadastro de turmas
- Cadastro de alunos (associados a uma turma)
- Marcação de presença por data (a ser implementado)
- Consulta de frequência (a ser implementado)
- Relatório por aluno (a ser implementado)

## Arquitetura

O sistema utiliza uma **Arquitetura em Camadas (MVC)** com Backend:
- **Model**: Gerencia dados e interage com o backend via API
- **View**: HTML com Bootstrap para uma interface simples e responsiva
- **Controller**: Conecta eventos da interface com as ações do Model
- **Backend**: API RESTful com Express.js e persistência em arquivos JSON

## Decisões de Projeto

- **HTML, CSS e JS**: para interface simples e responsiva
- **Bootstrap**: para uma interface com mínima codificação CSS
- **Express.js**: framework backend leve e eficiente
- **API REST**: para separação clara entre frontend e backend
- **Persistência em arquivos JSON**: solução simples sem necessidade de configurar banco de dados

## Tecnologias Utilizadas

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **CSS Framework**: Bootstrap 5
- **Backend**: Node.js, Express.js
- **Persistência**: Arquivos JSON
- **Ferramentas**: UUID para geração de IDs, CORS para comunicação cross-origin

## Como usar

1. Instale o Node.js (https://nodejs.org)
2. Clone o repositório
3. Instale as dependências:
```
npm install
```
4. Inicie o servidor:
```
npm start
```
5. Acesse o sistema em `http://localhost:3000`

## Estrutura do Projeto

```
controle-frequencia/
  ├── data/               # Armazenamento de dados (JSON)
  │    ├── alunos.json
  │    └── turmas.json
  ├── public/             # Frontend
  │    ├── css/
  │    │    └── style.css
  │    ├── js/
  │    │    ├── model.js
  │    │    ├── view.js
  │    │    └── controller.js
  │    └── index.html
  ├── server.js           # Servidor Express
  ├── package.json        # Configuração do projeto
  └── README.md
```

---
Desenvolvido por Marques Vinícius Melo Martins