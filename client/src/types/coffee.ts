export interface Participant {
  id: number;
  name: string;
  created_at: string;
  order_position: number;
}

export interface Purchase {
  id: number;
  participant_id: number;
  name: string;
  purchase_date: string;
}

export interface NextBuyerResponse {
  next_buyer: Participant | null;
  last_purchase: Purchase | null;
  message?: string;
}
