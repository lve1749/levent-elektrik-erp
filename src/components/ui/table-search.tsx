'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TableSearchProps {
  onSearch: (searchTerm: string) => void
  placeholder?: string
  className?: string
}

export default function TableSearch({ 
  onSearch, 
  placeholder = "Stok kodu veya ismi ile ara...",
  className 
}: TableSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Debounced search - kullanıcı yazmayı bıraktıktan 300ms sonra arama yap
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, onSearch])

  const handleClear = () => {
    setSearchTerm('')
    onSearch('')
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9 pr-9 h-9"
      />
      {searchTerm && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}