# ☕ Coffee Shop - Sistema de Controle e Auditoria do Café

Sistema para controlar a rotação de compra de café entre participantes, com funcionalidade de reordenar a sequência usando botões, visualização do histórico de alterações e acesso restrito por senha.

## 🚀 Funcionalidades

- ✅ Controle de participantes (Adicionar, Editar, Remover)
- ✅ Rotação automática de quem deve comprar café, baseada na ordem da lista
- ✅ Histórico de compras de café
- ✅ Reordenação da lista de participantes usando botões de mover para cima/baixo.
- ✅ **Histórico de Reordenações**: Visualização das duas últimas alterações na ordem da lista de participantes, acessível através de um ícone na seção de participantes.
- ✅ Limpeza do histórico de compras
- ✅ Interface responsiva
- ✅ Sistema de login com senha compartilhada para acesso restrito.

## 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router DOM
- **Backend**: Node.js, Express 4, TypeScript, `serverless-http` para compatibilidade com Netlify Functions.
- **Database**: PostgreSQL (via Supabase) com Kysely ORM
- **Plataforma de Deploy**: Netlify

## 📦 Instalação e Configuração

1.  **Clone o repositório**
    ```bash
    git clone https://github.com/jardelcorreia/controle-do-cafe.git
    cd controle-do-cafe
    ```
2.  **Instale as dependências**
    ```bash
    npm install
    ```
3.  **Configure o Banco de Dados (Supabase)**
    - Crie um projeto no [Supabase](https://supabase.com/).
    - No editor SQL do Supabase, execute o script SQL abaixo para criar as tabelas necessárias:
      ```sql
      -- Tabela de Participantes
      CREATE TABLE participants (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
          order_position INTEGER DEFAULT 0
      );

      -- Tabela de Compras de Café
      CREATE TABLE coffee_purchases (
          id SERIAL PRIMARY KEY,
          participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
          purchase_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      -- Tabela de Histórico de Reordenamento
      CREATE TABLE reorder_history (
          id SERIAL PRIMARY KEY,
          "timestamp" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
          old_order TEXT,
          new_order TEXT
      );

      -- Tabela de Compras Externas
      CREATE TABLE external_purchases (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          purchase_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      -- Opcional: Índices
      CREATE INDEX idx_participants_order_position ON participants(order_position);
      CREATE INDEX idx_coffee_purchases_participant_id ON coffee_purchases(participant_id);
      ```
    - Obtenha a string de conexão do **Connection Pooler** do seu banco de dados Supabase. Ela se parecerá com: `postgresql://postgres.project_ref:[YOUR-PASSWORD]@aws-region.pooler.supabase.com:6543/postgres`.

4.  **Configure as Variáveis de Ambiente (para desenvolvimento local)**
    - Crie um arquivo `.env` na raiz do projeto.
    - Adicione as seguintes variáveis, substituindo pelos seus valores:
      ```env
      DATABASE_URL=sua_string_de_conexao_do_supabase_pooler_aqui
      APP_SHARED_PASSWORD=sua_senha_secreta_para_o_app_aqui
      # NODE_ENV=development (Netlify CLI geralmente define isso ou similar para 'dev')
      ```
    - **Importante:** Certifique-se de que o arquivo `.env` esteja listado no seu `.gitignore`.

## 🏃‍♂️ Executar

### Desenvolvimento Local com Netlify CLI
Para simular o ambiente Netlify localmente, incluindo as Netlify Functions:
```bash
npm run dev
```
Este comando utiliza a Netlify CLI. O frontend (Vite) geralmente roda em uma porta (ex: 3000 ou 5173) e a CLI do Netlify provê um proxy para ele e para as funções em outra porta (geralmente 8888). Acesse a aplicação pela porta indicada pela Netlify CLI.

### Build para Produção
```bash
npm run build
```
Este comando executa os seguintes passos:
1.  `npm run prebuild:functions`: Copia os arquivos de `server/database/` para `netlify/functions/database/`.
2.  `vite build`: Compila o frontend para o diretório `dist/public/`.
3.  `mkdir -p netlify/functions-dist`: Garante que o diretório de saída das funções exista.
4.  `npm run build:functions`: Compila as Netlify Functions de `netlify/functions/` para `netlify/functions-dist/` usando `tsc --project tsconfig.functions.json`.

## 🌐 Deploy no Netlify

1.  **Conecte seu Repositório Git ao Netlify:**
    *   Vá ao painel do Netlify e crie um "New site from Git".
    *   Escolha seu provedor Git e selecione o repositório `controle-do-cafe`.

2.  **Configurações de Build:**
    *   O Netlify deve detectar automaticamente o arquivo `netlify.toml` e usar as configurações definidas nele.
    *   **Build Command**: `npm run build` (ou `npm install && npm run build` - o `npm install` é geralmente executado por padrão pelo Netlify).
    *   **Publish directory**: `dist/public`
    *   **Functions directory**: `netlify/functions-dist`

3.  **Variáveis de Ambiente Essenciais no Netlify:**
    *   Vá para "Site configuration" > "Build & deploy" > "Environment variables".
    *   Adicione as seguintes variáveis:
        *   `DATABASE_URL`: Cole a string de conexão do Supabase Connection Pooler aqui (com sua senha).
        *   `APP_SHARED_PASSWORD`: Defina a senha compartilhada para o login da aplicação.
        *   `NODE_ENV`: `production` (O Netlify geralmente define isso automaticamente para deploys de produção, mas é bom garantir).

4.  **Deploy:**
    *   Após configurar, acione um deploy (geralmente acontece automaticamente após um push para a branch configurada, ou você pode acionar manualmente na UI do Netlify).

## 📝 Estrutura do Projeto (Atualizada para Netlify)
```
├── client/                     # Frontend React (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── types/
├── netlify/
│   ├── functions/              # Código fonte das Netlify Functions (TypeScript)
│   │   ├── database/           # Arquivos de DB copiados aqui antes da compilação das funções
│   │   └── api.ts              # Função principal que lida com todas as rotas /api/*
│   └── functions-dist/         # Saída da compilação das Netlify Functions (JavaScript) - Gerado pelo build
├── server/                     # Código original do backend (agora usado como fonte para a função)
│   └── database/               # Configuração do Kysely e schema (copiado para netlify/functions/database)
├── dist/                       # Saída do build do frontend (Vite)
│   └── public/
├── .env.example                # Exemplo de arquivo .env
├── .gitignore
├── netlify.toml                # Configuração de deploy e redirecionamentos para Netlify
├── package.json
├── tsconfig.json               # Configuração TypeScript principal
├── tsconfig.functions.json     # Configuração TypeScript para as Netlify Functions
└── vite.config.js              # Configuração do Vite
```

## 🎯 API Endpoints
A API é servida através de uma única Netlify Function (`api`) e as rotas são gerenciadas internamente pelo Express. O acesso via frontend é feito através de `/api/*`.

- `POST /api/login` - Autentica o usuário.
  - Body: `{ "password": "string" }`
- `GET /api/health` - Verifica a saúde da função e conectividade com o banco.
- `GET /api/participants` - Lista participantes.
- `POST /api/participants` - Adiciona participante.
  - Body: `{ "name": "string" }`
- `PUT /api/participants/:id` - Atualiza participante.
  - Body: `{ "name": "string" }`
- `PUT /api/participants/reorder` - Reordena participantes.
  - Body: `{ "participantIds": [number] }`
- `DELETE /api/participants/:id` - Remove participante.
- `GET /api/purchases` - Lista histórico de compras.
- `POST /api/purchases` - Registra compra.
  - Body (Participante): `{ "participant_id": number }`
  - Body (Externo): `{ "buyer_name": "string" }`
- `DELETE /api/purchases` - Limpa histórico de compras.
- `DELETE /api/purchases/:id` - Remove compra individual.
  - Query Params: `type=coffee` ou `type=external`
- `GET /api/next-buyer` - Próximo comprador.
- `GET /api/reorder-history` - Histórico de reordenações.

## 📄 Licença

MIT License.
```
