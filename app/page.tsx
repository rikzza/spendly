'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Category = {
  id: string
  name: string
  color: string
}

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

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    if (data) setCategories(data)
  }

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*, categories(id, name, color)')
      .order('date', { ascending: false })
    console.log('expenses data:', data)
    console.log('expenses error:', error)
    if (data) setExpenses(data as Expense[])
  }

  useEffect(() => {
    fetchCategories()
    fetchExpenses()
  }, [])

  const handleAddExpense = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('expenses').insert({
      amount: parseFloat(amount),
      category_id: categoryId,
      date,
      note,
      user_id: user.id,
    })

    setAmount('')
    setCategoryId('')
    setDate('')
    setNote('')
    setLoading(false)
    fetchExpenses()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Spendly</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px' }}>
          Log Out
        </button>
      </div>

      <h2>Add Expense</h2>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
      />
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
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
        style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
      />
      <input
        type="text"
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
      />
      <button onClick={handleAddExpense} disabled={loading} style={{ padding: '8px 16px' }}>
        Add Expense
      </button>

      <h2 style={{ marginTop: '30px' }}>Your Expenses</h2>
      {expenses.length === 0 && <p>No expenses yet — add your first one above.</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Date</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Category</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Note</th>
            <th style={{ textAlign: 'right', borderBottom: '1px solid #ccc' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id}>
              <td style={{ padding: '6px 0' }}>{exp.date}</td>
              <td style={{ padding: '6px 0' }}>{exp.categories?.name}</td>
              <td style={{ padding: '6px 0' }}>{exp.note}</td>
              <td style={{ padding: '6px 0', textAlign: 'right' }}>${exp.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}