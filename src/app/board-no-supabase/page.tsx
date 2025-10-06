'use client'

import { useState, useEffect } from 'react'

export default function BoardNoSupabasePage() {
  const [message, setMessage] = useState('Initializing...')

  useEffect(() => {
    console.log('useEffect running...')
    setMessage('useEffect executed successfully!')
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Board No Supabase</h1>
      <div className="p-4 bg-gray-100 rounded">
        <strong>Message:</strong> {message}
      </div>
    </div>
  )
}
