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
}
