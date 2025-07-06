export interface ReorderHistoryTable {
  id: number; // SERIAL PRIMARY KEY
  timestamp: Date; // TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  old_order: string; // JSONB
  new_order: string; // JSONB
}

export interface ExternalPurchaseTable {
  id: number; // SERIAL PRIMARY KEY
  name: string; // VARCHAR(255) NOT NULL
  purchase_date: Date; // TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
}

export interface ParticipantsTable {
  id: number; // SERIAL PRIMARY KEY
  name: string; // VARCHAR(255) UNIQUE NOT NULL
  created_at: Date; // TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  order_position: number; // INTEGER NOT NULL
}

export interface CoffeePurchasesTable {
  id: number; // SERIAL PRIMARY KEY
  participant_id: number; // INTEGER REFERENCES participants(id)
  purchase_date: Date; // TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
}

// Interface agregada para o Kysely
export interface DB {
  participants: ParticipantsTable;
  coffee_purchases: CoffeePurchasesTable;
  reorder_history: ReorderHistoryTable;
  external_purchases: ExternalPurchaseTable;
}

// Removida a interface DatabaseSchema antiga, substituída por DB
// e interfaces de tabela individuais para melhor clareza com PostgreSQL.
// Os tipos de dados foram ajustados para refletir os tipos PostgreSQL.
// Por exemplo, INTEGER auto-incrementing é SERIAL. Datas são TIMESTAMPTZ.
// JSON é JSONB para melhor performance e funcionalidade.
