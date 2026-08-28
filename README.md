# Tambaki B2B — Frontend

Frontend do sistema **Tambaki**, uma aplicação completa de gerenciamento de restaurantes, desenvolvida como Trabalho de Conclusão de Curso (TCC) para o curso Técnico em Desenvolvimento de Sistemas — Turma TDS03, formandos de 2026, do SENAI Mariano Ferraz.

Este repositório contém apenas a aplicação web **(React)**. O backend (API REST em NestJS) é mantido em um projeto separado.

## Funcionalidades

* Registro e gerenciamento de pedidos
* Análise de custos
* Gestão de estoque
* Abertura e fechamento de caixa
* Cadastro e autenticação de usuários

## Tecnologias Utilizadas

* React 19
* Vite
* Axios
* React Router DOM
* Tailwind CSS

## Estrutura do Projeto

```
react-frontend/
│
├── src/
│   ├── assets/                     # Imagens, logos e recursos estáticos
│   │   ├── .gitkeep
│   │   └── Tambaki_Prototype.png
│   │
│   ├── components/                 # Componentes reutilizáveis de interface
│   │   ├── HeaderAndSidebar/
│   │   ├── LogoRestaurant/
│   │   ├── SeaLogin/
│   │   └── .gitkeep
│   │
│   ├── pages/                      # Páginas da aplicação
│   │   ├── Configuration/
│   │   ├── Financial/
│   │   ├── FirstAccess/
│   │   ├── Home/
│   │   ├── Menu/
│   │   ├── Perfil/
│   │   ├── Stock/
│   │   ├── Tables/
│   │   ├── Ticket/
│   │   ├── UsersPage/
│   │   └── .gitkeep
│   │
│   ├── services/                   # Configuração do Axios e integração com a API
│   │   ├── api.js
│   │   ├── auth.ts
│   │   ├── orders.js
│   │   ├── reserves.js
│   │   └── tables.js
│   │
│   ├── App.css                     # Estilos do componente raiz
│   ├── App.jsx                     # Componente raiz e rotas
│   ├── index.css                   # Configurações globais de estilos e Tailwind
│   └── main.jsx                    # Ponto de entrada do React
│
├── .env.example                    # Modelo de variáveis de ambiente do frontend
├── .gitignore
├── .oxlintrc.json                  # Configuração do linter (oxlint)
├── index.html
├── vite.config.js                  # Configuração do Vite
└── package.json
```

## Pré-requisitos

* Node.js instalado
* Backend do projeto Tambaki (nest-backend) em execução, para que as requisições da API funcionem corretamente

## Como Executar o Projeto

1. Acesse a pasta do frontend:

```
cd react-frontend
```

2. Instale as dependências:

```
npm install
npm install react-modal
npm install lucide-react
npm install framer-motion
```

3. Configure o arquivo `.env` de acordo com o modelo disponibilizado em `.env.example`.

4. Inicie a aplicação em modo de desenvolvimento:

```
npm run dev
```

O frontend estará disponível em:

```
http://localhost:5173
```

5. Acesso o backend em [Tambaki-Backend](https://github.com/giulikarime/Tambaki-Backend.git)

## Variáveis de Ambiente

Antes de executar o projeto, configure o arquivo `.env` com base no modelo:

```
react-frontend/.env.example
```

## Autores

* Laura S. Borges
* Júlia Resplandes
* Gabriele I. Sousa
* Rafael S. Pereira
* Giuliana K. Durães

## Projeto Acadêmico

Projeto desenvolvido como Trabalho de Conclusão de Curso (TCC) do curso Técnico em Desenvolvimento de Sistemas — TDS03, do SENAI Mariano Ferraz, com conclusão prevista para 2026.
