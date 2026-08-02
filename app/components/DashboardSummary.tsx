'use client'

type Category = { id: string; name: string; color: string }
type Expense = {
  id: string
  amount: number
  note: string
  date: string
  category_id: string
  categories: Category
}

export default function DashboardSummary({ expenses }: { expenses: Expense[] }) {
  const now = new Date()
  const currentMonth = now.toISOString().slice(0, 7) // "2026-08"

  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonth = lastMonthDate.toISOString().slice(0, 7)

  const thisMonthTotal = expenses
    .filter((exp) => exp.date.slice(0, 7) === currentMonth)
    .reduce((sum, exp) => sum + Number(exp.amount), 0)

  const lastMonthTotal = expenses
    .filter((exp) => exp.date.slice(0, 7) === lastMonth)
    .reduce((sum, exp) => sum + Number(exp.amount), 0)

  const percentChange =
    lastMonthTotal === 0
      ? null
      : ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100

  const categoryTotals = expenses.reduce((acc, exp) => {
    const name = exp.categories?.name || 'Uncategorized'
    acc[name] = (acc[name] || 0) + Number(exp.amount)
    return acc
  }, {} as Record<string, number>)

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

  if (expenses.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p className="text-sm text-gray-500 mb-1">This Month</p>
        <p className="text-2xl font-semibold text-gray-900">${thisMonthTotal.toFixed(2)}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p className="text-sm text-gray-500 mb-1">vs Last Month</p>
        {percentChange === null ? (
          <p className="text-2xl font-semibold text-gray-400">—</p>
        ) : (
          <p className={`text-2xl font-semibold ${percentChange >= 0 ? 'text-red-500' : 'text-green-600'}`}>
            {percentChange >= 0 ? '+' : ''}
            {percentChange.toFixed(0)}%
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p className="text-sm text-gray-500 mb-1">Top Category</p>
        <p className="text-2xl font-semibold text-gray-900">
          {topCategory ? topCategory[0] : '—'}
        </p>
      </div>
    </div>
  )
}