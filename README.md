
- ✅ Controle de participantes (Adicionar, Editar, Remover)
- ✅ Rotação automática de quem deve comprar café, baseada na ordem da lista
- ✅ Histórico de compras de café
- ✅ Reordenação da lista de participantes por arrastar e soltar (Drag & Drop)
- ✅ Histórico de Reordenações: Visualização das duas últimas alterações na ordem da lista de participantes, acessível através de um ícone na seção de participantes.
- ✅ Limpeza do histórico de compras
- ✅ Interface responsiva

## 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express 5, TypeScript
- **Database**: SQLite com Kysely ORM
- **Drag & Drop**: @dnd-kit

## 📦 Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o ambiente:
   ```bash
   export DATA_DIRECTORY="./data"
   mkdir -p data
   ```
   **Observação:** Para a funcionalidade de histórico de reordenações, a tabela `reorder_history` precisa ser criada no banco de dados `data/database.sqlite`. Execute o seguinte comando SQL usando uma ferramenta de sua preferência (ex: `sqlite3 data/database.sqlite`):
   ```sql
   CREATE TABLE IF NOT EXISTS reorder_history (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
     old_order TEXT,
     new_order TEXT
   );
   ```

## 🏃‍♂️ Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 🌐 Deploy

### Render.com (Recomendado)
1. Conecte seu repositório GitHub
2. Configure como "Web Service"
3. Build Command: `npm run build`
4. Start Command: `npm start`
5. Environment Variables:
   - `NODE_ENV=production`
   - `DATA_DIRECTORY=/opt/render/project/data`
   (Lembre-se de que a tabela `reorder_history` precisará ser criada no banco de dados se você estiver usando um volume persistente, ou a funcionalidade de histórico de reordenações não persistirá dados.)

### Railway.app
1. Conecte o repositório
2. Deploy automático
   (Considere a persistência do banco de dados e a criação da tabela `reorder_history`.)

### DigitalOcean App Platform
1. Conecte o repositório
2. Configure Node.js service
3. Build: `npm run build`
4. Run: `npm start`
   (Considere a persistência do banco de dados e a criação da tabela `reorder_history`.)

## 📝 Estrutura do Projeto

```
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── hooks/        # Custom hooks
│   │   └── types/        # TypeScript types
├── server/               # Backend Express
│   ├── database/         # Configuração do banco
│   └── static-serve.ts   # Servir arquivos estáticos
├── data/                 # Banco SQLite (inicialmente vazio, `database.sqlite` é criado aqui)
└── dist/                 # Build de produção
```

## 🎯 API Endpoints

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
  - Exemplo de resposta:
    ```json
    [
      {
        "id": 1,
        "timestamp": "2023-10-27T10:00:00.000Z",
        "old_order": "[3,1,2]",
        "new_order": "[1,2,3]"
      },
      {
        "id": 2,
        "timestamp": "2023-10-27T10:05:00.000Z",
        "old_order": "[1,2,3]",
        "new_order": "[2,1,3]"
      }
    ]
    ```
    (Retorna array vazio `[]` se não houver histórico ou se a tabela `reorder_history` não existir.)


## 📄 Licença

MIT License
