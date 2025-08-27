import mongoose from 'mongoose';

export interface TimestampedDocument {
  created_at?: Date;
  updated_at?: Date;
}

export interface ClientType extends TimestampedDocument {
  _id: mongoose.Types.ObjectId | string;
  user_id: string;
  name: string;
  phone?: string;
  email?: string;
  amount_owed?: number;
  notes?: string;
}

export interface SupplierType extends TimestampedDocument {
  _id: mongoose.Types.ObjectId | string;
  user_id: string;
  name: string;
  phone?: string;
  email?: string;
  amount_owed?: number;
  notes?: string;
}

export interface DashboardResponse {
  total_money_owed_to_me: number;
  total_money_i_owe: number;
  net_position: number;
  total_clients: number;
  total_suppliers: number;
  recent_clients: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    amount_owed?: number;
  }[];
  recent_suppliers: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    amount_owed?: number;
  }[];
}