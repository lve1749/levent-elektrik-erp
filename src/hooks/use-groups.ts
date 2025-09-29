import { useState, useEffect } from 'react'
import { GrupBilgisi } from '@/types'

export function useGroups() {
  const [groups, setGroups] = useState<GrupBilgisi[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/grup-listesi')
        const result = await response.json()
        
        if (result.success) {
          setGroups(result.data)
        } else {
          setError(result.error || 'Grup listesi yüklenemedi')
        }
      } catch (err) {
        setError('Bağlantı hatası')
        console.error('Grup listesi hatası:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [])

  return { groups, loading, error }
}