'use client'

import { PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

type Category = { id: string; name: string; color: string }
type Expense = {
  id: string
  amount: number
  note: string
  date: string
  category_id: string
  categories: Category
}

export default function ExpenseCharts({ expenses }: { expenses: Expense[] }) {
  // Aggregate: total spent per category
  const categoryTotals = expenses.reduce((acc, exp) => {
    const name = exp.categories?.name || 'Uncategorized'
    const color = exp.categories?.color || '#9ca3af'
    if (!acc[name]) acc[name] = { name, value: 0, color }
    acc[name].value += Number(exp.amount)
    return acc
  }, {} as Record<string, { name: string; value: number; color: string }>)

  const pieData = Object.values(categoryTotals)

  // Aggregate: total spent per month
  const monthTotals = expenses.reduce((acc, exp) => {
    const month = exp.date.slice(0, 7) // "2026-07-23" -> "2026-07"
    if (!acc[month]) acc[month] = { month, total: 0 }
    acc[month].total += Number(exp.amount)
    return acc
  }, {} as Record<string, { month: string; total: number }>)

  const lineData = Object.values(monthTotals).sort((a, b) => a.month.localeCompare(b.month))

  if (expenses.length === 0) return null

  return (
    <div className="grid sm:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Spend by Category</h2>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80}>
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Spend Over Time</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
            <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}