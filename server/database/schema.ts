export interface ReorderHistory {
  id: number; // INTEGER, primary key, auto-incrementing
  timestamp: string; // TEXT, not null, defaulting to the current timestamp
  old_order: string; // TEXT (JSON string)
  new_order: string; // TEXT (JSON string)
}

export interface ExternalPurchase {
  id: number;
  name: string;
  purchase_date: string;
}

export interface DatabaseSchema {
  participants: {
    id: number;
    name: string;
    created_at: string;
    order_position: number;
  };
  coffee_purchases: {
    id: number;
    participant_id: number;
    purchase_date: string;
  };
  reorder_history: ReorderHistory;
  external_purchases: ExternalPurchase;
}
