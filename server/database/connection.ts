import { Kysely, PostgresDialect } from "kysely";
import pg from "pg"; // Import 'pg'
const { Pool } = pg; // Destructure Pool from 'pg'
import { DatabaseSchema } from "./schema.js";
import dotenv from "dotenv";

dotenv.config(); // Carrega variáveis de ambiente do .env se existir (para desenvolvimento local)

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL, // Usará a connection string do Supabase
    // Configurações adicionais do pool, se necessário:
    // max: 10, // Número máximo de conexões no pool
    // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Para conexões SSL, comum em produção
  }),
});

export const db = new Kysely<DatabaseSchema>({
  dialect,
  log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"], // Log queries apenas em desenvolvimento
});

console.log("Database connection setup for PostgreSQL.");

// Não precisamos mais de:
// - Criação de diretório
// - Caminho de arquivo SQLite
// - Seed de dados aqui (deve ser feito no Supabase ou via script de migração)
// - Verificação de schema (ALTER TABLE) aqui (deve ser feito via migrações)

// Para verificar a conexão (opcional, pode ser feito no server/index.ts ao iniciar)
async function checkConnection() {
  try {
    // Kysely não tem um método db.health() ou db.connect() direto para apenas testar.
    // Uma forma de testar é fazer uma query simples.
    // Como Kysely é lazy, a conexão só é realmente tentada na primeira query.
    // Para um teste explícito, você pode tentar obter um cliente do pool:
    const poolClient = await dialect.pool.connect();
    console.log("Successfully connected to PostgreSQL database!");
    poolClient.release();
  } catch (error) {
    console.error("Failed to connect to PostgreSQL database:", error);
  }
}

// Descomente se quiser verificar a conexão na inicialização deste módulo
// checkConnection();
