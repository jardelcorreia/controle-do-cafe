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

// A função checkConnection foi removida pois causava um erro de build (dialect.pool não é acessível)
// e não é estritamente necessária. A conexão será testada na primeira query real.
