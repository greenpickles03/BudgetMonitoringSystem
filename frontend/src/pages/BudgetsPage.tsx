import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { budgetService } from '../services/budgetService';
import { categoryService } from '../services/categoryService';
import type { Budget, BudgetRequest, Category } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const PERIOD_OPTIONS = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM'] as const;

const BudgetFormModal: React.FC<{
  budget?: Budget | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}> = ({ budget, categories, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<BudgetRequest>({
    defaultValues: budget ? {
      name: budget.name,
      description: budget.description,
      amount: budget.amount,
      categoryId: budget.categoryId,
      startDate: budget.startDate,
      endDate: budget.endDate,
      period: budget.period,
    } : {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
      period: 'MONTHLY',
    },
  });

  const onSubmit = async (data: BudgetRequest) => {
    setLoading(true);
    setError('');
    try {
      const payload = { ...data, categoryId: data.categoryId || undefined };
      if (budget) {
        await budgetService.update(budget.id, payload);
      } else {
        await budgetService.create(payload);
      }
      onSaved();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{budget ? 'Edit Budget' : 'New Budget'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Monthly Groceries"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional description"
            />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Period *</label>
              <select
                {...register('period', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PERIOD_OPTIONS.map(p => (
                  <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                ))}
              </select>
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
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                {...register('startDate', { required: 'Start date is required' })}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input
                {...register('endDate', { required: 'End date is required' })}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
            </div>
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
              {budget ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

  const loadData = async () => {
    setLoading(true);
    try {
      const [budgetsData, categoriesData] = await Promise.all([
        budgetService.getAll(activeFilter),
        categoryService.getAll(),
      ]);
      setBudgets(budgetsData);
      setCategories(categoriesData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [activeFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await budgetService.delete(deleteId);
    setDeleteId(null);
    loadData();
  };

  const handleEdit = (budget: Budget) => {
    setEditBudget(budget);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditBudget(null);
  };

  const handleSaved = () => {
    handleCloseModal();
    loadData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter(undefined)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeFilter === undefined ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeFilter === true ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            Active
          </button>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          + New Budget
        </button>
      </div>

      {loading ? <LoadingSpinner size="lg" className="mt-20" /> : (
        <>
          {budgets.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <p className="text-5xl mb-4">💰</p>
              <p className="text-gray-500 text-lg">No budgets yet. Create your first budget!</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Budget
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {budgets.map((budget) => {
                const pct = Math.min(budget.percentageUsed, 100);
                const barColor = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-green-500';
                return (
                  <div key={budget.id} className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{budget.name}</h3>
                        {budget.categoryName && <span className="text-xs text-gray-500">{budget.categoryName}</span>}
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{budget.period}</span>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Spent: {formatCurrency(Number(budget.spentAmount))}</span>
                        <span>{Math.round(pct)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Budget: {formatCurrency(Number(budget.amount))}</span>
                        <span>Left: {formatCurrency(Number(budget.remainingAmount))}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 mb-3">{budget.startDate} → {budget.endDate}</div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="flex-1 text-sm border border-gray-300 text-gray-600 py-1.5 rounded-lg hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(budget.id)}
                        className="flex-1 text-sm border border-red-200 text-red-600 py-1.5 rounded-lg hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {showModal && (
        <BudgetFormModal
          budget={editBudget}
          categories={categories}
          onClose={handleCloseModal}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Budget"
        message="Are you sure you want to delete this budget? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Delete"
      />
    </div>
  );
};

export default BudgetsPage;
