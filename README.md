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
- **Backend**: Node.js, Express 5, TypeScript
- **Database**: PostgreSQL (via Supabase) com Kysely ORM

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
      NODE_ENV=development
      ```
    - **Importante:** Certifique-se de que o arquivo `.env` esteja listado no seu `.gitignore`.

## 🏃‍♂️ Executar

### Desenvolvimento
```bash
npm run dev
```
A aplicação frontend estará disponível em `http://localhost:5173` (ou outra porta indicada pelo Vite) e o backend em `http://localhost:3001`.

### Build para Produção
```bash
npm run build
```
Este comando compila o frontend e o backend TypeScript.

### Iniciar em Modo de Produção (após o build)
```bash
npm start
```
Este comando inicia o servidor Node.js que serve a API e o frontend compilado.

## 🌐 Deploy (Exemplo com Render.com)
Conecte seu repositório Git ao Render.

**Configurações do Serviço Web:**

-   **Build Command**: `npm install && npm run build`
-   **Start Command**: `npm start`

**Variáveis de Ambiente Essenciais no Render:**

-   `NODE_ENV`: `production`
-   `DATABASE_URL`: Cole a string de conexão do Supabase Connection Pooler aqui (com sua senha).
-   `APP_SHARED_PASSWORD`: Defina a senha compartilhada para o login da aplicação.
-   `PORT`: O Render geralmente define isso automaticamente. Se não, use `10000` ou a porta que o `server/index.ts` está configurado para usar em produção.

**Nota sobre Persistência de Dados**: Com o Supabase, a persistência dos dados é gerenciada externamente, então não é necessário configurar discos persistentes no Render para o banco de dados da aplicação.

## 📝 Estrutura do Projeto
```
├── client/               # Frontend React (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── types/
├── server/               # Backend Express (Node.js)
│   ├── database/         # Configuração do Kysely e conexão com o BD
│   └── index.ts          # Ponto de entrada do servidor Express
├── dist/                 # Saída do build (frontend e backend transpilado)
├── .env.example          # Exemplo de arquivo .env (opcional, mas recomendado)
├── .gitignore
├── package.json
├── render.yaml           # Configuração de deploy para Render.com (se utilizada)
└── tsconfig.json         # Configuração TypeScript principal (geralmente para o client)
└── tsconfig.server.json  # Configuração TypeScript para o server
```

## 🎯 API Endpoints
A API segue os padrões REST.

- `POST /api/login` - Autentica o usuário.
  - Body: `{ "password": "string" }`
  - Response (Success): `{ "authenticated": true, "message": "Login successful." }`
  - Response (Failure): 401 Unauthorized `{ "error": "Invalid password." }`

- `GET /api/health` - Verifica a saúde do servidor e a conectividade com o banco de dados.
  - Response (Success 200): `{ "status": "ok" }`
  - Response (Failure 503): `{ "status": "error", "message": "Database not ready" }` (Este endpoint foi verificado como existente no código anteriormente)

- `GET /api/participants` - Lista participantes ordenados.
- `POST /api/participants` - Adiciona novo participante ao final da lista.
  - Body: `{ "name": "string" }`
- `PUT /api/participants/:id` - Atualiza nome de um participante.
  - Body: `{ "name": "string" }`
- `PUT /api/participants/reorder` - Reordena a lista de participantes.
  - Body: `{ "participantIds": [number] }` (array de IDs na nova ordem)
  - *Side-effect*: Grava as duas últimas reordenações no histórico.
- `DELETE /api/participants/:id` - Remove participante (se não tiver histórico de compras).

- `GET /api/purchases` - Lista o histórico de compras (combinando compras de participantes e externas).
- `POST /api/purchases` - Registra uma nova compra de café.
  - Body (Participante): `{ "participant_id": number }`
  - Body (Externo): `{ "buyer_name": "string" }`
- `DELETE /api/purchases` - Limpa todo o histórico de compras.
- `DELETE /api/purchases/:id` - Remove uma compra individual.
  - Query Params: `type=coffee` ou `type=external`

- `GET /api/next-buyer` - Retorna o próximo participante a comprar café e a última compra.
- `GET /api/reorder-history` - Retorna as duas últimas reordenações da lista de participantes.
  - (Retorna array vazio `[]` se não houver histórico.)

## 📄 Licença

MIT License.
```
