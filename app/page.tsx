'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()

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
      <p>You're logged in! This is where your expenses will go.</p>
    </div>
  )
}