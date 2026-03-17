export type TransactionType = 'income' | 'expense';

export type AssetType = 'Emas' | 'Saham' | 'Tabungan' | 'Kripto' | 'Properti' | 'Lainnya';

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  type: AssetType;
  value: number;
  last_updated: string;
}

export interface Transaction {
  id: string;
  created_at: string;
  date: string;
  amount: number;
  category: string;
  sub_category?: string | null;
  type: TransactionType;
  note: string | null;
  description: string;
  receipt_url?: string | null;
  user_id?: string;
}

export interface CategorySummary {
  type: TransactionType;
  category: string;
  amount: number;
  percentage: number;
}

export type LoanType = 'utang' | 'piutang';
export type LoanStatus = 'active' | 'paid';

export interface Loan {
  id: string;
  created_at: string;
  type: LoanType;
  amount: number;
  remaining_amount: number;
  description: string;
  contact_name: string;
  due_date: string | null;
  status: LoanStatus;
  user_id?: string;
}
export interface Goal {
  id: string;
  created_at: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string | null;
  icon: string | null;
  status: 'active' | 'completed';
  user_id?: string;
}
