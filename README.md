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
- **Database**: SQLite com Kysely ORM

## 📦 Instalação e Configuração

1.  Clone o repositório
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Configure o diretório de dados:
    ```bash
    export DATA_DIRECTORY="./data" # Ou defina no seu ambiente
    mkdir -p data
    ```
    **Observação:** O aplicativo inicializará automaticamente as tabelas do banco de dados (`participants`, `coffee_purchases`, `reorder_history`) no arquivo `data/database.sqlite` se elas não existirem. Certifique-se de que o diretório `data` seja gravável.

4.  Configure a senha compartilhada para o login (para desenvolvimento local):
    - Crie um arquivo `.env` na raiz do projeto (ao lado de `package.json`).
    - Adicione a seguinte linha, substituindo pela senha desejada:
      ```
      APP_SHARED_PASSWORD=sua_senha_secreta_aqui
      ```
    - **Importante:** Certifique-se de que o arquivo `.env` esteja listado no seu `.gitignore` para não ser commitado.

## 🏃‍♂️ Executar

### Desenvolvimento
```bash
npm run dev
```
(O servidor backend rodará na porta 3001 e o frontend Vite na porta especificada por ele, geralmente 5173)

### Produção
```bash
npm run build
npm start
```

## 🌐 Deploy

Ao fazer o deploy para plataformas como Render, Railway, ou DigitalOcean App Platform:

1.  **Build Command**: `npm run build` (ou conforme necessário pela plataforma)
2.  **Start Command**: `npm start` (ou conforme necessário pela plataforma)
3.  **Variáveis de Ambiente Essenciais**:
    - `NODE_ENV=production`
    - `DATA_DIRECTORY`: Configure um caminho para armazenamento persistente (ex: `/opt/render/project/data` no Render).
    - `APP_SHARED_PASSWORD`: **Defina a senha compartilhada desejada aqui.** Este é crucial para a funcionalidade de login.
    - `PORT`: A plataforma geralmente define isso, mas se necessário, configure para a porta que seu serviço deve escutar (ex: 3001 ou 10000).

    **Nota sobre Persistência de Dados**: É vital configurar um disco/volume persistente para o `DATA_DIRECTORY` em sua plataforma de deploy. Isso garante que o arquivo `database.sqlite` (com todos os dados de participantes, compras e histórico) não seja perdido entre deploys ou reinicializações do serviço.

## 📝 Estrutura do Projeto
```
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── contexts/     # React Contexts (ex: AuthContext)
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Componentes de página (ex: LoginPage)
│   │   └── types/        # TypeScript types
├── server/               # Backend Express
│   ├── database/         # Configuração do banco (incluindo connection.ts que inicializa o schema)
│   └── static-serve.ts   # Servir arquivos estáticos
├── data/                 # Banco SQLite (inicialmente vazio, `database.sqlite` é criado aqui pelo app)
└── dist/                 # Build de produção
```

## 🎯 API Endpoints

- `POST /api/login` - Autentica o usuário.
  - Body: `{ "password": "string" }`
  - Response (Success): `{ "authenticated": true, "message": "Login successful." }`
  - Response (Failure): 401 Unauthorized `{ "error": "Invalid password." }`
- `GET /api/participants` - Lista participantes ordenados.
- `POST /api/participants` - Adiciona novo participante ao final da lista.
  - Body: `{ "name": "string" }`
- `PUT /api/participants/:id` - Atualiza nome de um participante.
  - Body: `{ "name": "string" }`
- `PUT /api/participants/reorder` - Reordena a lista de participantes.
  - Body: `{ "participantIds": [number] }` (array de IDs na nova ordem)
  - Grava as duas últimas reordenações no histórico.
- `DELETE /api/participants/:id` - Remove participante (se não tiver histórico de compras).
- `GET /api/purchases` - Lista o histórico de compras.
- `POST /api/purchases` - Registra uma nova compra de café.
  - Body: `{ "participant_id": number }`
- `DELETE /api/purchases` - Limpa todo o histórico de compras.
- `GET /api/next-buyer` - Retorna o próximo participante a comprar café e a última compra.
- `GET /api/reorder-history` - Retorna as duas últimas reordenações da lista de participantes.
  - (Retorna array vazio `[]` se não houver histórico.)


## 📄 Licença

MIT License
```
