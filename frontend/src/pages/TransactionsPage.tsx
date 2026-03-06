import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { budgetService } from '../services/budgetService';
import type { Transaction, TransactionRequest, Category, Budget } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const TransactionFormModal: React.FC<{
  transaction?: Transaction | null;
  categories: Category[];
  budgets: Budget[];
  onClose: () => void;
  onSaved: () => void;
}> = ({ transaction, categories, budgets, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<TransactionRequest>({
    defaultValues: transaction ? {
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.categoryId,
      budgetId: transaction.budgetId,
      transactionDate: transaction.transactionDate,
      notes: transaction.notes,
    } : {
      type: 'EXPENSE',
      transactionDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: TransactionRequest) => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...data,
        categoryId: data.categoryId || undefined,
        budgetId: data.budgetId || undefined,
      };
      if (transaction) {
        await transactionService.update(transaction.id, payload);
      } else {
        await transactionService.create(payload);
      }
      onSaved();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{transaction ? 'Edit Transaction' : 'New Transaction'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <div className="flex gap-2">
              {(['INCOME', 'EXPENSE'] as const).map(type => (
                <label key={type} className="flex-1 cursor-pointer">
                  <input {...register('type')} type="radio" value={type} className="sr-only" />
                  <div className={`text-center py-2 border-2 rounded-lg text-sm font-medium transition-colors ${
                    type === 'INCOME' ? 'border-green-300 text-green-700 has-[:checked]:bg-green-50 has-[:checked]:border-green-500' :
                    'border-red-300 text-red-700 has-[:checked]:bg-red-50 has-[:checked]:border-red-500'
                  }`}>
                    {type === 'INCOME' ? '📈 Income' : '📉 Expense'}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <input
              {...register('description', { required: 'Description is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Grocery shopping"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
              <input
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be positive' }
                })}
                type="number"
                step="0.01"
                min="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                {...register('transactionDate', { required: 'Date is required' })}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.transactionDate && <p className="text-red-500 text-xs mt-1">{errors.transactionDate.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              {...register('categoryId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name} ({cat.type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (optional)</label>
            <select
              {...register('budgetId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No budget</option>
              {budgets.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional notes"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:bg-blue-400"
            >
              {loading && <LoadingSpinner size="sm" />}
              {transaction ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const [txData, catData, budgetData] = await Promise.all([
        transactionService.getAll(typeFilter !== 'ALL' ? { type: typeFilter } : undefined),
        categoryService.getAll(),
        budgetService.getAll(),
      ]);
      setTransactions(txData);
      setCategories(catData);
      setBudgets(budgetData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [typeFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await transactionService.delete(deleteId);
    setDeleteId(null);
    loadData();
  };

  const handleEdit = (tx: Transaction) => {
    setEditTx(tx);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditTx(null);
  };

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Income</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Expenses</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
        </div>
        <div className={`rounded-xl p-4 ${totalIncome - totalExpense >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
          <p className="text-xs text-gray-500">Net</p>
          <p className={`text-xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {formatCurrency(totalIncome - totalExpense)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${typeFilter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Add Transaction
        </button>
      </div>

      {loading ? <LoadingSpinner size="lg" className="mt-20" /> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">💳</p>
              <p className="text-gray-500">No transactions yet</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Transaction
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{tx.transactionDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          tx.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {tx.type === 'INCOME' ? '↑' : '↓'}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{tx.description}</span>
                      </div>
                      {tx.notes && <p className="text-xs text-gray-400 ml-8">{tx.notes}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{tx.categoryName || '—'}</td>
                    <td className={`px-4 py-3 text-sm font-semibold text-right ${
                      tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(tx)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(tx.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showModal && (
        <TransactionFormModal
          transaction={editTx}
          categories={categories}
          budgets={budgets}
          onClose={handleCloseModal}
          onSaved={() => { handleCloseModal(); loadData(); }}
        />
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Delete"
      />
    </div>
  );
};

export default TransactionsPage;
