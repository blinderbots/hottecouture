'use client'

import { useState, useEffect } from 'react'

export default function BoardBasicPage() {
  const [message, setMessage] = useState('Initializing...')

  useEffect(() => {
    console.log('useEffect running...')
    setMessage('useEffect executed!')
    
    // Test API call
    fetch('/api/test-supabase-simple')
      .then(res => res.json())
      .then(data => {
        console.log('API response:', data)
        setMessage(`API response: ${data.success ? 'Success' : 'Failed'}`)
      })
      .catch(err => {
        console.error('API error:', err)
        setMessage(`API error: ${err.message}`)
      })
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Basic Board</h1>
      <div className="p-4 bg-blue-100 text-blue-800 rounded">
        <strong>Status:</strong> {message}
      </div>
    </div>
  )
}
