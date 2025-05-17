'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseConnectionTest() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading')

  useEffect(() => {
    async function testConnection() {
      try {
        // Simple connection test
        const { error } = await supabase.auth.getSession()
        if (error) throw error
        setStatus('connected')
      } catch (error) {
        console.error('Supabase connection error:', error)
        setStatus('error')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="mt-4 p-4 rounded-lg border">
      <h2 className="text-lg font-semibold mb-2">Supabase Connection Status:</h2>
      <div className="flex items-center gap-2">
        {status === 'loading' && (
          <>
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            <span>Testing connection...</span>
          </>
        )}
        {status === 'connected' && (
          <>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Connected to Supabase!</span>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Connection error - check console</span>
          </>
        )}
      </div>
    </div>
  )
} 