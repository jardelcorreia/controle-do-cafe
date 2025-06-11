# ☕ Coffee Shop - Sistema de Controle e Auditoria do Café

Sistema para controlar a rotação de compra de café entre participantes, com funcionalidade de reordenar a sequência usando botões e visualização do histórico de alterações.

## 🚀 Funcionalidades

- ✅ Controle de participantes (Adicionar, Editar, Remover)
- ✅ Rotação automática de quem deve comprar café, baseada na ordem da lista
- ✅ Histórico de compras de café
- ✅ Reordenação da lista de participantes usando botões de mover para cima/baixo.
- ✅ **Histórico de Reordenações**: Visualização das duas últimas alterações na ordem da lista de participantes, acessível através de um ícone na seção de participantes.
- ✅ Limpeza do histórico de compras
- ✅ Interface responsiva

## 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express 5, TypeScript
- **Database**: SQLite com Kysely ORM

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
   **Observação:** O aplicativo inicializará automaticamente as tabelas do banco de dados (`participants`, `coffee_purchases`, `reorder_history`) no arquivo `data/database.sqlite` se elas não existirem. Certifique-se de que o diretório `data` seja gravável pelo processo do aplicativo.

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
   (Certifique-se de que o diretório `/opt/render/project/data` esteja configurado como um disco persistente em seu serviço Render para que os dados do SQLite, incluindo o histórico de reordenações, não sejam perdidos em reinicializações ou deploys.)

### Railway.app
1. Conecte o repositório
2. Deploy automático
   (Considere a configuração de um volume persistente para o diretório `data` para garantir a persistência do banco de dados SQLite.)

### DigitalOcean App Platform
1. Conecte o repositório
2. Configure Node.js service
3. Build: `npm run build`
4. Run: `npm start`
   (Considere a configuração de um disco persistente para o diretório `data` para garantir a persistência do banco de dados SQLite.)

## 📝 Estrutura do Projeto

```
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── hooks/        # Custom hooks
│   │   └── types/        # TypeScript types
├── server/               # Backend Express
│   ├── database/         # Configuração do banco (incluindo connection.ts que inicializa o schema)
│   └── static-serve.ts   # Servir arquivos estáticos
├── data/                 # Banco SQLite (inicialmente vazio, `database.sqlite` é criado aqui pelo app)
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
      // ... (mais uma entrada se existir)
    ]
    ```
    (Retorna array vazio `[]` se não houver histórico.)


## 📄 Licença

MIT License
```
