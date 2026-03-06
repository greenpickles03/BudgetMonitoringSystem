import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import type { DashboardSummary } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await dashboardService.getSummary();
        setSummary(data);
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (!summary) return null;

  const expenseChartData = Object.entries(summary.expenseByCategory).map(([name, value]) => ({
    name,
    value: Number(value),
  }));

  const incomeChartData = Object.entries(summary.incomeByCategory).map(([name, value]) => ({
    name,
    value: Number(value),
  }));

  const statsCards = [
    {
      label: 'Total Income',
      value: formatCurrency(Number(summary.totalIncome)),
      icon: '📈',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(Number(summary.totalExpense)),
      icon: '📉',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Net Balance',
      value: formatCurrency(Number(summary.netBalance)),
      icon: '💰',
      color: Number(summary.netBalance) >= 0 ? 'text-green-600' : 'text-red-600',
      bg: Number(summary.netBalance) >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      label: 'Active Budgets',
      value: `${summary.activeBudgets} / ${summary.totalBudgets}`,
      icon: '🎯',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div key={card.label} className={`${card.bg} rounded-xl p-5 flex items-center gap-4`}>
            <div className="text-3xl">{card.icon}</div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{card.label}</p>
              <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense by Category Pie Chart */}
        {expenseChartData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expenseChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {expenseChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-1">
              {expenseChartData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-600 truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Income vs Expense Bar Chart */}
        {incomeChartData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Income by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={incomeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Budgets */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Budgets</h3>
            <Link to="/budgets" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {summary.recentBudgets.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No budgets yet</p>
          ) : (
            <div className="space-y-3">
              {summary.recentBudgets.map((budget) => (
                <div key={budget.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{budget.name}</p>
                    <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          budget.percentageUsed >= 100 ? 'bg-red-500' :
                          budget.percentageUsed >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium">{Math.round(budget.percentageUsed)}%</p>
                    <p className="text-xs text-gray-500">{formatCurrency(Number(budget.spentAmount))} / {formatCurrency(Number(budget.amount))}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <Link to="/transactions" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {summary.recentTransactions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {summary.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    tx.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {tx.type === 'INCOME' ? '↑' : '↓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                    <p className="text-xs text-gray-500">{tx.categoryName || 'Uncategorized'} • {tx.transactionDate}</p>
                  </div>
                  <span className={`text-sm font-semibold flex-shrink-0 ${
                    tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
