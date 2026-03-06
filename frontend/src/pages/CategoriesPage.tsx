import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { categoryService } from '../services/categoryService';
import type { Category, CategoryRequest, CategoryType } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';

const ICON_OPTIONS = ['🛒', '🍔', '🚗', '🏠', '💊', '🎓', '✈️', '💰', '📈', '🎮', '👗', '⚡'];
const COLOR_OPTIONS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

const CategoryFormModal: React.FC<{
  category?: Category | null;
  onClose: () => void;
  onSaved: () => void;
}> = ({ category, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(category?.icon || '');
  const [selectedColor, setSelectedColor] = useState(category?.color || '#3b82f6');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CategoryRequest>({
    defaultValues: category ? {
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      type: category.type,
    } : { type: 'EXPENSE' },
  });

  const onSubmit = async (data: CategoryRequest) => {
    setLoading(true);
    setError('');
    try {
      const payload = { ...data, icon: selectedIcon, color: selectedColor };
      if (category) {
        await categoryService.update(category.id, payload);
      } else {
        await categoryService.create(payload);
      }
      onSaved();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{category ? 'Edit Category' : 'New Category'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Groceries"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              {...register('type', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => { setSelectedIcon(icon); setValue('icon', icon); }}
                  className={`w-10 h-10 text-xl rounded-lg border-2 transition-colors ${selectedIcon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => { setSelectedColor(color); setValue('color', color); }}
                  className={`w-8 h-8 rounded-full border-4 transition-all ${selectedColor === color ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
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
              {category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<CategoryType | undefined>(undefined);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll(typeFilter);
      setCategories(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, [typeFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await categoryService.delete(deleteId);
    setDeleteId(null);
    loadCategories();
  };

  const handleEdit = (cat: Category) => {
    setEditCategory(cat);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setTypeFilter(undefined)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${typeFilter === undefined ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            All
          </button>
          <button
            onClick={() => setTypeFilter('EXPENSE')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${typeFilter === 'EXPENSE' ? 'bg-red-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            Expense
          </button>
          <button
            onClick={() => setTypeFilter('INCOME')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${typeFilter === 'INCOME' ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            Income
          </button>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + New Category
        </button>
      </div>

      {loading ? <LoadingSpinner size="lg" className="mt-20" /> : (
        <>
          {categories.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <p className="text-5xl mb-4">🏷️</p>
              <p className="text-gray-500 text-lg">No categories yet</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: cat.color ? `${cat.color}20` : '#f3f4f6' }}
                  >
                    {cat.icon || (cat.type === 'INCOME' ? '📈' : '📉')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{cat.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      cat.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {cat.type}
                    </span>
                    {cat.description && <p className="text-xs text-gray-400 truncate mt-0.5">{cat.description}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(cat.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showModal && (
        <CategoryFormModal
          category={editCategory}
          onClose={() => { setShowModal(false); setEditCategory(null); }}
          onSaved={() => { setShowModal(false); setEditCategory(null); loadCategories(); }}
        />
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Category"
        message="Are you sure you want to delete this category? Transactions linked to this category will be affected."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Delete"
      />
    </div>
  );
};

export default CategoriesPage;
