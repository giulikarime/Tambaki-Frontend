# Tambaki B2B — Gerenciamento de Restaurantes

**Tambaki** é um sistema completo de gerenciamento de restaurantes, desenvolvido como Trabalho de Conclusão de Curso (TCC) para o curso Técnico em Desenvolvimento de Sistemas — Turma TDS03, formandos de 2026, do SENAI Mariano Ferraz.

---

## Funcionalidades

* Registro e gerenciamento de pedidos
* Análise de custos
* Gestão de estoque
* Abertura e fechamento de caixa
* Cadastro e autenticação de usuários

---

## Tecnologias Utilizadas

### Frontend

* React 19
* Vite
* Axios
* React Router DOM

### Backend

* NestJS
* Prisma ORM
* TypeScript
* RxJS

### Banco de Dados

* PostgreSQL

---

## Estrutura do Projeto

```text
Tambaki---Gerenciamento-de-Restaurantes/
│
├── nest-backend/                  # API REST em NestJS & TypeScript
│   ├── prisma/
│   │   ├── migrations/            # Migrações do banco de dados
│   │   ├── schema.prisma          # Esquema de dados (Prisma)
│   │   └── seed.ts                # População inicial do banco de dados
│   ├── src/
│   │   ├── auth/                  # Módulo de autenticação (Login, DTOs, Service, Controller)
│   │   ├── generated/             # Cliente Prisma gerado automaticamente
│   │   ├── app.module.ts          # Módulo principal da aplicação
│   │   └── main.ts                # Ponto de entrada do NestJS
│   ├── .env.example               # Modelo de variáveis de ambiente do backend
│   └── package.json
│
└── react-frontend/                # Aplicação web em React 19 + Vite
    ├── src/
    │   ├── assets/                # Imagens, logos e recursos estáticos
    │   ├── components/            # Componentes reutilizáveis de interface
    │   ├── pages/                 # Páginas da aplicação (FirstAccess, Login, etc.)
    │   ├── services/              # Configuração do Axios e integração com a API
    │   ├── App.jsx                # Componente raiz e rotas
    │   ├── index.css              # Configurações globais de estilos e Tailwind
    │   └── main.jsx               # Ponto de entrada do React
    ├── .env.example               # Modelo de variáveis de ambiente do frontend
    ├── vite.config.js             # Configuração do Vite
    └── package.json
```

---

## Como Executar o Projeto

### 1. Banco de Dados

Garanta que você possui o pgAdmin (Postgresql) instalado na sua máquina com as senhas.

```bash
user: postgres
senha: postgres
```

### 2. Backend

Acesse a pasta do backend e instale as dependências:

```bash
cd nest-backend
npm install
npx prisma migrate reset
npx prisma generate
npx prisma db seed
```

Inicie o servidor em modo de desenvolvimento:

```bash
npm run start
```

O backend estará disponível em:

```text
http://localhost:3000
```

### 3. Frontend

Em outro terminal, acesse a pasta do frontend:

```bash
cd react-frontend
npm install
```

Inicie a aplicação:

```bash
npm run dev
```

O frontend estará disponível em:

```text
http://localhost:5173
```

---

## Variáveis de Ambiente

Antes de executar o projeto, configure os arquivos `.env` de acordo com os modelos disponibilizados em:

```text
nest-backend/.env.example
react-frontend/.env.example
```

> **Importante:** nunca compartilhe ou versione arquivos `.env` que contenham senhas, chaves ou outras informações sensíveis.

---

## Autores

* Laura S. Borges
* Júlia Resplandes
* Gabriele I. Sousa
* Rafael S. Pereira
* Giuliana K. Durães

---

## Projeto Acadêmico

Projeto desenvolvido como Trabalho de Conclusão de Curso (TCC) do curso **Técnico em Desenvolvimento de Sistemas — TDS03**, do **SENAI Mariano Ferraz**, com conclusão prevista para 2026.


