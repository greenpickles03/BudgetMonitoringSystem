export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  type: CategoryType;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  type: CategoryType;
}

export type BudgetPeriod = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';

export interface Budget {
  id: number;
  name: string;
  description?: string;
  amount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  categoryId?: number;
  categoryName?: string;
  userId: number;
  startDate: string;
  endDate: string;
  period: BudgetPeriod;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetRequest {
  name: string;
  description?: string;
  amount: number;
  categoryId?: number;
  startDate: string;
  endDate: string;
  period: BudgetPeriod;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId?: number;
  categoryName?: string;
  budgetId?: number;
  budgetName?: string;
  userId: number;
  transactionDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionRequest {
  description: string;
  amount: number;
  type: TransactionType;
  categoryId?: number;
  budgetId?: number;
  transactionDate: string;
  notes?: string;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  totalBudgets: number;
  activeBudgets: number;
  totalTransactions: number;
  recentBudgets: Budget[];
  recentTransactions: Transaction[];
  expenseByCategory: Record<string, number>;
  incomeByCategory: Record<string, number>;
}
