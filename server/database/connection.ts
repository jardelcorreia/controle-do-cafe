import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { DB } from './schema.js'; // Nome do schema exportado do schema.ts
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV !== 'test') { // Permite testes sem DB_URL
  console.error("DATABASE_URL environment variable is not set.");
  // Considerar lançar erro em produção se não definida
}

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: connectionString,
    // Adicionar configuração SSL para produção se necessário
    // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  }),
});

export const db = new Kysely<DB>({ // Usar o tipo DB importado
  dialect,
  log(event) {
    if (process.env.NODE_ENV === 'development') {
      if (event.level === 'query') {
        console.log(event.query.sql);
        console.log(event.query.parameters);
      }
      if (event.level === 'error') {
        console.error(event.error);
      }
    } else if (event.level === 'error') {
      console.error(event.error); // Logar erros em produção também
    }
  }
});

console.log("Database connection setup for PostgreSQL using Kysely.");
