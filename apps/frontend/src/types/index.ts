export type TransactionType = 'income' | 'expense';

export type AssetType =
  | 'stock'
  | 'crypto'
  | 'mutual_fund'
  | 'obligasi'
  | 'commodity'
  | 'cash'
  | 'investment';

export interface Asset {
  id: string;
  user_id?: string;
  name: string;
  type: AssetType;
  quantity: number;
  unit: string | null;
  is_market_synced: boolean;
  value: number;
  invested_capital: number;
  market_price: number;
  last_synced_at?: string;
  change_24h?: number;
  profit_amount: number;
  profit_percent: number;
  created_at: string;
  updated_at: string;
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
  metadata?: Record<string, unknown>;
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

export interface User {
  id: string;
  name: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  partner_id?: string | null;
  household_id?: string | null;
  partner_name?: string | null;
  partner_email?: string | null;
  large_expense_threshold?: number;
  anniversary_date?: string | null;
  timezone?: string;
  budget_cycle_start?: number;
  is_privacy_mode?: boolean;
  is_eco_mode?: boolean;
  currency_format?: string;
  exchange_rate?: number;
  monthly_budget_limit?: number;
  email_verified_at?: string | null;
  last_active_at?: string | null;
  legacy_threshold_months?: number;
  is_legacy_triggered?: boolean;
  two_factor_enabled?: boolean;
  tax_status?: string;
  dependents_count?: number;
  legacy_grace_start_at?: string | null;
  legacy_partner_name?: string | null;
  legacy_partner_email?: string | null;
  industry_sector?: string | null;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
      sudo_required?: boolean;
    };
  };
}

export interface WealthHistoryItem {
  id: string;
  user_id: string;
  month: number;
  year: number;
  total_value: number;
}

export interface FinancialSummary {
  income: number;
  expense: number;
  balance: number;
  cumulative_balance: number;
  calendar_income: number;
  calendar_expense: number;
  transactions?: Transaction[];
}
