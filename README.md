# ☕ Coffee Shop - Sistema de Controle e Auditoria do Café

Sistema para controlar a rotação de compra de café entre participantes, com funcionalidade de arrastar e soltar para reordenar a sequência.

## 🚀 Funcionalidades

- ✅ Controle de participantes
- ✅ Rotação automática de quem deve comprar café
- ✅ Histórico de compras
- ✅ Reordenação por arrastar e soltar
- ✅ Limpeza do histórico
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

### Railway.app
1. Conecte o repositório
2. Deploy automático

### DigitalOcean App Platform
1. Conecte o repositório
2. Configure Node.js service
3. Build: `npm run build`
4. Run: `npm start`

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
├── data/                 # Banco SQLite (criado automaticamente)
└── dist/                 # Build de produção
```

## 🎯 API Endpoints

- `GET /api/participants` - Lista participantes
- `POST /api/participants` - Adiciona participante
- `PUT /api/participants/:id` - Atualiza participante
- `PUT /api/participants/reorder` - Reordena participantes
- `DELETE /api/participants/:id` - Remove participante
- `GET /api/purchases` - Histórico de compras
- `POST /api/purchases` - Registra compra
- `DELETE /api/purchases` - Limpa histórico
- `GET /api/next-buyer` - Próximo comprador

## 📄 Licença

MIT License
