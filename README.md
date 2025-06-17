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

### Configuração do Banco de Dados com `DATA_DIRECTORY`

O local do arquivo de banco de dados SQLite (`database.sqlite`) é determinado pela variável de ambiente `DATA_DIRECTORY`.

- Conforme definido em `server/database/connection.ts`, se `DATA_DIRECTORY` estiver configurada, seu valor será usado como o caminho para a pasta que conterá o arquivo `database.sqlite`.
- Se `DATA_DIRECTORY` não estiver configurada, o sistema usará `./data` como o diretório padrão.
- O aplicativo criará automaticamente o diretório especificado (e o arquivo `database.sqlite` dentro dele na primeira execução) se ele não existir.

Para desenvolvimento local, você pode definir `DATA_DIRECTORY` explicitamente (como mostrado no exemplo acima) ou omiti-la para usar o padrão `./data`. É crucial que o processo do Node.js tenha permissões de escrita para este diretório.

Esta variável é fundamental para garantir que os dados da aplicação (participantes, histórico de compras, etc.) sejam persistidos corretamente.

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
    - `DATA_DIRECTORY`: Configure um caminho para armazenamento persistente. Por exemplo, no Render, a configuração em `render.yaml` pode montar um disco em `/opt/render/project/data`, e você definiria `DATA_DIRECTORY` para este caminho.
    - `APP_SHARED_PASSWORD`: **Defina a senha compartilhada desejada aqui.** Este é crucial para a funcionalidade de login.
    - `PORT`: A plataforma geralmente define isso, mas se necessário, configure para a porta que seu serviço deve escutar (ex: 3001 ou 10000).

    **Nota sobre Persistência de Dados**: É vital configurar um disco/volume persistente para o `DATA_DIRECTORY` em sua plataforma de deploy, como ilustrado no exemplo do Render com `render.yaml`. Isso garante que o arquivo `database.sqlite` (localizado dentro do `DATA_DIRECTORY` e contendo todos os dados de participantes, compras e histórico) não seja perdido entre deploys ou reinicializações do serviço. A não configuração correta resultará na perda de todos os dados da aplicação a cada novo deploy ou reinício.

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
