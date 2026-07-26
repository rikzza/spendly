'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Category = {
  id: string
  name: string
  color: string
}

export default function CategoriesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [loading, setLoading] = useState(false)

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    if (data) setCategories(data)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleAddCategory = async () => {
    if (!name.trim()) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('categories').insert({
      name,
      color,
      user_id: user.id,
    })

    setName('')
    setColor('#6366f1')
    setLoading(false)
    fetchCategories()
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Delete this category? Expenses using it will keep their data but lose the category link.'
    )
    if (!confirmed) return

    await supabase.from('categories').delete().eq('id', id)
    fetchCategories()
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Categories</h1>
        <button onClick={() => router.push('/')} style={{ padding: '8px 16px' }}>
          Back to Expenses
        </button>
      </div>

      <h2>Add Category</h2>
      <input
        type="text"
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
      />
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />
      <button onClick={handleAddCategory} disabled={loading} style={{ padding: '8px 16px' }}>
        Add Category
      </button>

      <h2 style={{ marginTop: '30px' }}>Your Categories</h2>
      {categories.length === 0 && <p>No categories yet — add one above.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {categories.map((cat) => (
          <li
            key={cat.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #eee',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: cat.color,
                }}
              />
              {cat.name}
            </span>
            <button onClick={() => handleDelete(cat.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}