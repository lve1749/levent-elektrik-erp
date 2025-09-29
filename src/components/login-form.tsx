'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, Users, User } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import LegalModal from "@/components/legal/LegalModal"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [legalModalOpen, setLegalModalOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!username.trim() || !password.trim()) {
      setError('Lütfen tüm alanları doldurun')
      return
    }
    
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Giriş başarılı')
        // Önce ana sayfaya yönlendir
        await router.push('/')
        // Sonra sayfayı tamamen yenile ki AuthContext güncellensin
        window.location.href = '/'
      } else {
        setError(data.message || 'Kullanıcı adı veya şifre hatalı')
      }
    } catch (error) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectUser = (userId: string) => {
    setUsername(userId)
    setPassword('') // Şifre alanı boş kalacak, kullanıcı kendisi girecek
    setDialogOpen(false)
    toast.info('Kullanıcı ID dolduruldu. Lütfen şifrenizi girin.')
  }

  const users = [
    { id: '2', name: 'Murat' },
    { id: '3', name: 'Serkan' },
    { id: '4', name: 'Seda' },
    { id: '5', name: 'Bayram' },
    { id: '6', name: 'Hasan' },
    { id: '7', name: 'Cansu' },
    { id: '8', name: 'Uğur' },
    { id: '9', name: 'Savaş' },
    { id: '10', name: 'Hayati' },
    { id: '11', name: 'Şakir' },
    { id: '12', name: 'Ata' },
    { id: '13', name: 'Tunay' },
    { id: '14', name: 'Ayşe' },
    { id: '16', name: 'Yasemin' },
    { id: '17', name: 'Depo' },
    { id: '18', name: 'İsmail' },
    { id: '19', name: 'Necmettin' },
    { id: '20', name: 'Süleyman' },
    { id: '21', name: 'İsmail' },
    { id: '22', name: 'Bülent' },
    { id: '23', name: 'Merve' },
    { id: '24', name: 'Gülsüm' },
    { id: '26', name: 'Ayşenur' },
    { id: '27', name: 'Ömer Can' },
    { id: '28', name: 'Muhammed' },
    { id: '29', name: 'Berke' },
    { id: '30', name: 'Volkan' },
    { id: '99', name: 'Admin' },
  ]

  return (
    <form 
      className={cn("flex flex-col gap-6", className)} 
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col items-start gap-2 text-left">
        <h1 className="text-2xl font-bold">Hoş Geldiniz</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Kurumsal Yönetim Paneline Giriş Yapın
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-3">
          <Label htmlFor="username">Kullanıcı Kodu</Label>
          <Input 
            id="username" 
            type="text" 
            placeholder="Kullanıcı kodunuzu girin" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            className="h-10 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.20_0.00_0)]"
            required 
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Şifre</Label>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="h-10 pr-10 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.20_0.00_0)]"
              required 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full h-10 bg-[#ff7d03] hover:bg-[#e56f02] text-white rounded-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Giriş yapılıyor...
            </>
          ) : (
            'Giriş Yap'
          )}
        </Button>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              type="button"
              variant="outline" 
              className="w-full h-10 bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] hover:bg-[oklch(0.94_0.00_0)] dark:hover:bg-[oklch(0.22_0.00_0)] rounded-full"
              disabled={isLoading}
            >
              <Users className="mr-2 h-4 w-4" />
              Kullanıcı Bilgileri
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)]">
            <DialogHeader>
              <DialogTitle>Kullanıcı Bilgileri</DialogTitle>
              <DialogDescription>
                Giriş yapmak için aşağıdaki kullanıcılardan birini seçebilirsiniz.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid gap-2 py-4">
                {users.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] hover:bg-[oklch(0.95_0.00_0)] dark:hover:bg-[oklch(0.22_0.00_0)] transition-colors cursor-pointer group"
                  onClick={() => handleSelectUser(user.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] flex items-center justify-center">
                      <User className="w-5 h-5 text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)]">Kullanıcı ID:</span>
                        <span className="text-xs font-mono font-medium">{user.id}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    type="button"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#ff7d03] hover:bg-[#e56f02] text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectUser(user.id)
                    }}
                  >
                    Seç
                  </Button>
                </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
        
        <button
          type="button"
          onClick={() => setLegalModalOpen(true)}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          Yasal Metinler ve Hükümler
        </button>
      </div>
      
      {/* Legal Modal */}
      <LegalModal 
        isOpen={legalModalOpen} 
        onClose={() => setLegalModalOpen(false)}
        defaultTab="gizlilik"
      />
    </form>
  )
}