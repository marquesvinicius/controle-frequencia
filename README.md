# Controle de Frequência de Alunos

Este projeto é uma atividade da disciplina de Arquitetura de Software da UNIRV, no curso de Engenharia de Software.

## Acesso ao Sistema

O sistema está disponível online através do Vercel:
[https://controle-frequencia.vercel.app](https://controle-frequencia.vercel.app)

## Objetivo

Desenvolver um sistema para controle de presença de alunos, com as seguintes funcionalidades:
- Cadastro de turmas
- Cadastro de alunos (associados a uma turma)
- Marcação de presença
- Consulta de frequência por turma
- Relatório por aluno

## Arquitetura

O sistema utiliza uma **Arquitetura em Camadas (MVC)** com Backend:
- **Model**: Gerencia dados e regras de negócio
- **View**: Interface do usuário com Bootstrap
- **Controller**: Gerencia a lógica de apresentação e eventos
- **Backend**: API RESTful com Express.js e Supabase

## Tecnologias Utilizadas

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **CSS Framework**: Bootstrap 5
- **Backend**: Node.js, Express.js
- **Banco de Dados**: Supabase (PostgreSQL)
- **Deploy**: Vercel

## Desenvolvimento Local

1. Instale o Node.js (https://nodejs.org)
2. Clone o repositório
3. Configure as variáveis de ambiente:
   ```
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_do_supabase
   ```
4. Instale as dependências:
   ```
   npm install
   ```
5. Inicie o servidor:
   ```
   npm start
   ```
6. Acesse o sistema em `http://localhost:3000`

## Estrutura do Projeto

`controle-frequencia/
├── public/ # Frontend
│ ├── index.html # Página principal
│ ├── pages/ # Páginas específicas
│ │ ├── cadastros.html
│ │ ├── marcar-presenca.html
│ │ ├── consultar-frequencias.html
│ │ └── relatorio-aluno.html
│ └── js/ # Scripts (MVC)
│   ├──model.js
│   ├── view.js
│   └── controller.js
│
├── backend/ # Backend
│ ├── server.js # Servidor Express
│ ├── routes/ # Rotas da API
│ │ ├── alunos.js
│ │ ├── turmas.js
│ │ └── presencas.js
│ └── db/ # Configuração do banco
│ └── supabase.js
│
├── vercel.json # Configuração do Vercel
├── package.json # Configuração do projeto
└── README.md`

## Funcionalidades

1. **Cadastros**
   - Cadastro de turmas com nome e turno
   - Cadastro de alunos associados a uma turma

2. **Controle de Presença**
   - Marcação de presença por turma e data
   - Interface intuitiva com lista de alunos

3. **Consultas**
   - Visualização de frequência por turma
   - Relatório individual por aluno

## Deploy

O projeto está configurado para deploy automático no Vercel. Cada push para a branch principal resulta em um novo deploy.

---
Desenvolvido por Marques Vinícius Melo Martins