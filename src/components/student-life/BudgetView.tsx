import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BudgetItem } from '../../types';
import { INITIAL_BUDGET_ITEMS } from '../../lib/studentLifeData';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Tag,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export const BudgetView: React.FC = () => {
  const { showToast } = useApp();

  const [items, setItems] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem('uniquest_budget_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_BUDGET_ITEMS;
      }
    }
    return INITIAL_BUDGET_ITEMS;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<BudgetItem['category']>('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    localStorage.setItem('uniquest_budget_items', JSON.stringify(items));
  }, [items]);

  // Aggregate stats
  const totalIncome = items
    .filter((i) => i.type === 'income')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalExpense = items
    .filter((i) => i.type === 'expense')
    .reduce((sum, i) => sum + i.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const burnRatePct = totalIncome === 0 ? 100 : Math.round((totalExpense / totalIncome) * 100);

  const filteredItems = items.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newItem: BudgetItem = {
      id: `b-${Date.now()}`,
      title: title.trim(),
      amount: parsedAmount,
      type,
      category,
      date,
      notes: notes.trim() || undefined,
    };

    setItems((prev) => [newItem, ...prev]);
    setIsAddModalOpen(false);
    setTitle('');
    setAmount('');
    setNotes('');
    showToast('success', `Logged ${type === 'income' ? 'income' : 'expense'}: $${parsedAmount}`);
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    showToast('info', 'Transaction removed.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Student Budget & Expense Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track student stipends, rent, course materials, grocery budgets, and monthly net savings.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            Total Monthly Income
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums mt-1.5">
            ${totalIncome.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Stipends & allowances</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-red-600 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Total Expenses
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums mt-1.5">
            ${totalExpense.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Housing, food & supplies</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
            Net Surplus / Savings
          </div>
          <div
            className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums mt-1.5 ${
              netSavings >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {netSavings >= 0 ? `+$${netSavings.toLocaleString()}` : `-$${Math.abs(netSavings).toLocaleString()}`}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {netSavings >= 0 ? 'Surplus buffer maintained' : 'Operating in monthly deficit'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Monthly Burn Rate
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums mt-1.5">
            {burnRatePct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Of available monthly cashflow</div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Recent Transactions Ledger</h3>

          <div className="flex p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                  filterType === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900 block">{item.title}</span>
                    {item.notes && (
                      <span className="text-[11px] text-slate-400 block">{item.notes}</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${
                      item.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {item.type === 'income' ? '+' : '-'}${item.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-slate-900">Add Transaction</h2>
            <form onSubmit={handleAddTransaction} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-1.5 text-xs font-semibold rounded-xl border cursor-pointer ${
                      type === 'expense'
                        ? 'bg-red-50 text-red-700 border-red-300'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Expense (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-1.5 text-xs font-semibold rounded-xl border cursor-pointer ${
                      type === 'income'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Income (+)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title / Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Textbook or Groceries"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 45.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Food">Food & Groceries</option>
                    <option value="Housing">Housing & Rent</option>
                    <option value="Books & Tech">Books & Tech</option>
                    <option value="Transport">Transport</option>
                    <option value="Tuition">Tuition</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Allowance">Allowance</option>
                    <option value="Part-time">Part-time Job</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
