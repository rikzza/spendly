'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Category = { id: string; name: string; color: string }
type Expense = {
  id: string
  amount: number
  note: string
  date: string
  category_id: string
  categories: Category
}

export default function Home() {
  const router = useRouter()
  const supabase = createClient()

  const [categories, setCategories] = useState<Category[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [searchText, setSearchText] = useState('')

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    if (data) setCategories(data)
  }

  const fetchExpenses = async () => {
    let query = supabase
      .from('expenses')
      .select('*, categories(id, name, color)')
      .order('date', { ascending: false })

    if (filterCategory) query = query.eq('category_id', filterCategory)
    if (filterStartDate) query = query.gte('date', filterStartDate)
    if (filterEndDate) query = query.lte('date', filterEndDate)
    if (searchText) query = query.ilike('note', `%${searchText}%`)

    const { data } = await query
    if (data) setExpenses(data as Expense[])
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [filterCategory, filterStartDate, filterEndDate, searchText])

  const resetForm = () => {
    setAmount('')
    setCategoryId('')
    setDate('')
    setNote('')
    setEditingId(null)
  }

  const handleAddExpense = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingId) {
      await supabase
        .from('expenses')
        .update({ amount: parseFloat(amount), category_id: categoryId, date, note })
        .eq('id', editingId)
    } else {
      await supabase.from('expenses').insert({
        amount: parseFloat(amount),
        category_id: categoryId,
        date,
        note,
        user_id: user.id,
      })
    }

    resetForm()
    setLoading(false)
    fetchExpenses()
  }

  const handleEditClick = (exp: Expense) => {
    setEditingId(exp.id)
    setAmount(exp.amount.toString())
    setCategoryId(exp.category_id)
    setDate(exp.date)
    setNote(exp.note)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this expense?')) return
    await supabase.from('expenses').delete().eq('id', id)
    fetchExpenses()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const inputClass =
    'w-full mb-3 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Spendly</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/categories')}
              className="px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors"
            >
              Categories
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={inputClass}
          />
          <div className="flex gap-3">
            <button
              onClick={handleAddExpense}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {editingId ? 'Save Changes' : 'Add Expense'}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Expenses</h2>

          <div className="flex flex-wrap gap-3 mb-5">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {(filterCategory || filterStartDate || filterEndDate || searchText) && (
              <button
                onClick={() => {
                  setFilterCategory('')
                  setFilterStartDate('')
                  setFilterEndDate('')
                  setSearchText('')
                }}
                className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700"
              >
                Clear filters
              </button>
            )}
          </div>

          {expenses.length === 0 && (
            <p className="text-gray-400 text-sm">No expenses yet — add your first one above.</p>
          )}
          {expenses.length > 0 && (
            <div className="divide-y divide-gray-100">
              {expenses.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: exp.categories?.color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {exp.categories?.name || 'Uncategorized'}
                        {exp.note && <span className="text-gray-400 font-normal"> · {exp.note}</span>}
                      </p>
                      <p className="text-xs text-gray-400">{exp.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">${exp.amount}</span>
                    <button
                      onClick={() => handleEditClick(exp)}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}