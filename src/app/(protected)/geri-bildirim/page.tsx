'use client'

import { useState } from 'react'
import Header from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Send, 
  Bug, 
  Lightbulb, 
  MessageSquare, 
  Zap,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  X,
  Clock,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import FileUploadCompact from '@/components/file-upload/compact-upload'

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other'
type Priority = 'low' | 'medium' | 'high' | 'critical'

export default function GeriBildirimPage() {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('improvement')
  const [priority, setPriority] = useState<Priority>('medium')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [affectedPage, setAffectedPage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [clearFilesTrigger, setClearFilesTrigger] = useState(0)

  const feedbackTypes = [
    { value: 'bug', label: 'Hata', icon: Bug },
    { value: 'feature', label: 'Özellik', icon: Lightbulb },
    { value: 'improvement', label: 'İyileştirme', icon: Zap },
    { value: 'other', label: 'Diğer', icon: MessageSquare }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Düşük', color: 'bg-gray-500' },
    { value: 'medium', label: 'Orta', color: 'bg-yellow-500' },
    { value: 'high', label: 'Yüksek', color: 'bg-orange-500' },
    { value: 'critical', label: 'Kritik', color: 'bg-red-500' }
  ]

  const affectedPages = [
    { value: 'stock-analysis', label: 'Stok Analizi' },
    { value: 'orders', label: 'Siparişler' },
    { value: 'lists', label: 'Listeler' },
    { value: 'folders', label: 'Klasörler' },
    { value: 'archive', label: 'Arşiv' },
    { value: 'general', label: 'Genel' },
    { value: 'other', label: 'Diğer' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject.trim() || !message.trim()) {
      toast.error('Lütfen zorunlu alanları doldurun')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Dosyaları base64'e çevir
      const fileAttachments = await Promise.all(
        uploadedFiles.map(async (fileItem) => {
          if (fileItem.file instanceof File) {
            return new Promise((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => {
                const base64 = reader.result?.toString().split(',')[1] || ''
                resolve({
                  name: fileItem.file.name,
                  content: base64,
                  type: fileItem.file.type
                })
              }
              reader.readAsDataURL(fileItem.file)
            })
          }
          return null
        })
      )

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackType,
          priority,
          subject,
          message,
          affectedPage,
          attachments: fileAttachments.filter(Boolean)
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Geri bildiriminiz başarıyla gönderildi', {
          description: 'E-posta olarak iletildi. En kısa sürede değerlendirilecektir.'
        })
        
        // Formu temizle
        setSubject('')
        setMessage('')
        setAffectedPage('')
        setFeedbackType('improvement')
        setPriority('medium')
        setUploadedFiles([])
        setClearFilesTrigger(prev => prev + 1) // Dosya yükleme alanını temizle
      } else {
        toast.error('Gönderim başarısız', {
          description: data.error || 'Bir hata oluştu, lütfen tekrar deneyin.'
        })
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Bağlantı hatası', {
        description: 'Sunucuya bağlanılamadı, lütfen tekrar deneyin.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClear = () => {
    setSubject('')
    setMessage('')
    setAffectedPage('')
    setFeedbackType('improvement')
    setPriority('medium')
    setUploadedFiles([])
    setClearFilesTrigger(prev => prev + 1) // Dosya yükleme alanını temizle
  }

  return (
      <div className="h-screen flex flex-col bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] overflow-hidden">
        <Header 
          currentPage="Geri Bildirim"
        />
        
        <main className="flex-1 p-4 overflow-hidden">
          <div className="h-full flex justify-center">
            {/* Geri Bildirim Formu - Responsive Genişlik */}
            <div className="bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] rounded-lg border border-[oklch(0.92_0.00_0_/_0.5)] dark:border-[oklch(0.27_0.00_0_/_0.5)] p-6 h-full overflow-y-auto w-full md:w-3/4 lg:w-2/3 xl:w-1/2">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Başlık */}
                <div>
                  <h2 className="text-base font-inter font-semibold text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] mb-1">
                    Geri Bildirim Gönder
                  </h2>
                  <p className="text-[13px] text-[oklch(0.50_0.00_0)] dark:text-[oklch(0.60_0.00_0)]">
                    Hata bildirimleri, özellik istekleri veya iyileştirme önerilerinizi paylaşın.
                  </p>
                </div>

                {/* Geri Bildirim Türü */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
                    Geri Bildirim Türü
                  </Label>
                  <RadioGroup value={feedbackType} onValueChange={(value) => setFeedbackType(value as FeedbackType)}>
                    <div className="grid grid-cols-2 gap-2">
                      {feedbackTypes.map(type => {
                        const Icon = type.icon
                        const isSelected = feedbackType === type.value
                        return (
                          <div key={type.value}>
                            <RadioGroupItem value={type.value} id={type.value} className="peer sr-only" />
                            <Label
                              htmlFor={type.value}
                              className={cn(
                                "flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-all",
                                "border-[oklch(0.92_0.00_0)] dark:border-[oklch(0.27_0.00_0)]",
                                isSelected 
                                  ? "bg-[oklch(0.93_0.03_256)] border-[oklch(0.55_0.22_263)] dark:bg-[oklch(0.28_0.09_268)] dark:border-[oklch(0.62_0.19_260)]"
                                  : "bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] hover:bg-[oklch(0.97_0.01_255)] dark:hover:bg-[oklch(0.17_0.00_0)]"
                              )}
                            >
                              <Icon className={cn(
                                "h-4 w-4",
                                isSelected 
                                  ? "text-[oklch(0.49_0.22_264)] dark:text-[oklch(0.62_0.19_260)]"
                                  : "text-[oklch(0.44_0.00_0)] dark:text-[oklch(0.72_0.00_0)]"
                              )} strokeWidth={1.5} />
                              <span className={cn(
                                "text-[13px] font-medium",
                                isSelected
                                  ? "text-[oklch(0.49_0.22_264)] dark:text-[oklch(0.62_0.19_260)]"
                                  : "text-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)]"
                              )}>
                                {type.label}
                              </span>
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  </RadioGroup>
                </div>

                {/* Öncelik ve Sayfa Seçimi */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
                      Öncelik
                    </Label>
                    <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                      <SelectTrigger className="h-[34px] rounded-lg bg-[oklch(0.99_0.00_0)] border-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg bg-[oklch(0.99_0.00_0)] border-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
                        {priorityOptions.map(option => (
                          <SelectItem key={option.value} value={option.value} className="text-[13px]">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", option.color)} />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
                      İlgili Sayfa
                    </Label>
                    <Select value={affectedPage} onValueChange={setAffectedPage}>
                      <SelectTrigger className="h-[34px] rounded-lg bg-[oklch(0.99_0.00_0)] border-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] text-[13px]">
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg bg-[oklch(0.99_0.00_0)] border-[oklch(0.92_0.00_0)] dark:bg-[oklch(0.20_0.00_0)] dark:border-[oklch(0.27_0.00_0)]">
                        {affectedPages.map(page => (
                          <SelectItem key={page.value} value={page.value} className="text-[13px]">
                            {page.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Konu */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
                    Konu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Geri bildiriminizin konusunu yazın..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-[38px] rounded-lg bg-[oklch(0.99_0.00_0)] hover:bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:placeholder:text-[oklch(0.92_0.00_0)/50%] dark:hover:bg-[oklch(0.16_0.00_0)] text-[13px] placeholder:text-[13px]"
                    required
                  />
                </div>

                {/* Mesaj */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
                    Açıklama <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder={`${feedbackType === 'bug' ? 'Hatayı detaylı bir şekilde açıklayın...' : 
                      feedbackType === 'feature' ? 'İstediğiniz özelliği açıklayın...' :
                      feedbackType === 'improvement' ? 'Neyi iyileştirebileceğimizi açıklayın...' :
                      'Geri bildiriminizi yazın...'}`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[130px] rounded-lg bg-[oklch(0.99_0.00_0)] hover:bg-[oklch(0.97_0.00_0)] dark:bg-[oklch(0.14_0.00_0)] dark:border-[oklch(0.27_0.00_0)] dark:text-[oklch(0.92_0.00_0)] dark:placeholder:text-[oklch(0.92_0.00_0)/50%] dark:hover:bg-[oklch(0.16_0.00_0)] text-[13px] placeholder:text-[13px] resize-none"
                    required
                  />
                </div>

                {/* Dosya Yükleme */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium text-[oklch(0.40_0.00_0)] dark:text-[oklch(0.72_0.00_0)]">
                    Ekran Görüntüsü / Dosya
                  </Label>
                  <FileUploadCompact
                    maxFiles={3}
                    maxSize={5 * 1024 * 1024} // 5MB
                    accept="image/*,.pdf,.doc,.docx"
                    multiple={true}
                    className="w-full"
                    onFilesChange={(files) => setUploadedFiles(files)}
                    clearTrigger={clearFilesTrigger}
                  />
                </div>

                {/* Butonlar */}
                <div className="flex justify-between items-center pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClear}
                    className="h-[38px] px-4 text-[13px] rounded-lg hover:bg-[oklch(0.92_0.00_0)] dark:hover:bg-[oklch(0.27_0.00_0)]"
                  >
                    <X className="h-3.5 w-3.5 mr-2" />
                    Temizle
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting || !subject.trim() || !message.trim()}
                    className={cn(
                      "h-[38px] px-6 text-[13px] font-medium rounded-lg",
                      "bg-[oklch(0.55_0.22_263)] hover:bg-[oklch(0.50_0.22_263)]",
                      "text-white dark:text-white",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-3.5 w-3.5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5 mr-2" />
                        Gönder
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
  )
}