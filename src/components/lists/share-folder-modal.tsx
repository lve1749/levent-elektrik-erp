'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { 
  Link, 
  Mail, 
  Users, 
  Download,
  Copy,
  QrCode,
  Lock,
  Eye,
  Edit3,
  Shield,
  Clock,
  Send,
  FileDown,
  MessageCircle,
  X,
  UserPlus,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Folder } from '@/types/lists'
import QRCode from 'qrcode'

interface ShareFolderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folder: Folder | null
}

export default function ShareFolderModal({
  open,
  onOpenChange,
  folder
}: ShareFolderModalProps) {
  const [activeTab, setActiveTab] = useState('link')
  const [shareLink, setShareLink] = useState('')
  const [linkPermission, setLinkPermission] = useState<'view' | 'edit'>('view')
  const [linkExpiry, setLinkExpiry] = useState('7')
  const [emails, setEmails] = useState('')
  const [emailPermission, setEmailPermission] = useState<'view' | 'edit' | 'admin'>('view')
  const [emailMessage, setEmailMessage] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [userPermission, setUserPermission] = useState<'view' | 'edit' | 'admin'>('view')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Link oluştur
  const generateShareLink = async () => {
    setIsGenerating(true)
    try {
      // Simüle edilmiş link oluşturma
      const baseUrl = window.location.origin
      const token = btoa(`${folder?.id}-${linkPermission}-${Date.now()}`)
      const link = `${baseUrl}/shared/${token}`
      setShareLink(link)
      
      // QR kod oluştur
      const qrDataUrl = await QRCode.toDataURL(link, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1a1a1a',
          light: '#ffffff'
        }
      })
      setQrCodeUrl(qrDataUrl)
      
      toast.success('Paylaşım linki oluşturuldu')
    } catch (error) {
      toast.error('Link oluşturulamadı')
    } finally {
      setIsGenerating(false)
    }
  }

  // Linki kopyala
  const copyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink)
      toast.success('Link kopyalandı')
    }
  }

  // E-posta ile paylaş
  const shareViaEmail = () => {
    const emailList = emails.split(',').map(e => e.trim()).filter(e => e)
    if (emailList.length === 0) {
      toast.error('En az bir e-posta adresi girin')
      return
    }
    
    // Simüle edilmiş e-posta gönderimi
    toast.success(`${emailList.length} kişiye davet gönderildi`)
    setEmails('')
    setEmailMessage('')
  }

  // WhatsApp ile paylaş
  const shareViaWhatsApp = () => {
    if (!shareLink) {
      toast.error('Önce bir paylaşım linki oluşturun')
      return
    }
    
    const message = `${folder?.name} klasörü sizinle paylaşıldı:\n${shareLink}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  // PDF olarak indir
  const downloadAsPDF = () => {
    toast.info('PDF indirme özelliği yakında eklenecek')
  }

  // Excel olarak indir
  const downloadAsExcel = () => {
    toast.info('Excel indirme özelliği yakında eklenecek')
  }

  // Örnek kullanıcılar
  const availableUsers = [
    { id: '1', name: 'Ahmet Yılmaz', email: 'ahmet@sirket.com', department: 'Satın Alma' },
    { id: '2', name: 'Ayşe Demir', email: 'ayse@sirket.com', department: 'Muhasebe' },
    { id: '3', name: 'Mehmet Kaya', email: 'mehmet@sirket.com', department: 'Yönetim' },
    { id: '4', name: 'Fatma Çelik', email: 'fatma@sirket.com', department: 'Satın Alma' }
  ]

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const shareWithUsers = () => {
    if (selectedUsers.length === 0) {
      toast.error('En az bir kullanıcı seçin')
      return
    }
    
    toast.success(`${selectedUsers.length} kullanıcıya erişim verildi`)
    setSelectedUsers([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[oklch(0.99_0.00_0)] dark:bg-[oklch(0.20_0.00_0)]">
        <DialogHeader>
          <DialogTitle>Klasörü Paylaş</DialogTitle>
          <DialogDescription>
            {folder?.name} klasörünü paylaşın veya dışa aktarın
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Link
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-posta
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Kullanıcılar
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Dışa Aktar
            </TabsTrigger>
          </TabsList>

          {/* Link ile Paylaşma */}
          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-4">
              {/* İzin Seviyesi */}
              <div>
                <Label>İzin Seviyesi</Label>
                <RadioGroup value={linkPermission} onValueChange={(v) => setLinkPermission(v as 'view' | 'edit')} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="view" id="view" />
                    <Label htmlFor="view" className="flex items-center gap-2 cursor-pointer">
                      <Eye className="h-4 w-4" />
                      Sadece Görüntüleme
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="edit" id="edit" />
                    <Label htmlFor="edit" className="flex items-center gap-2 cursor-pointer">
                      <Edit3 className="h-4 w-4" />
                      Düzenleme İzni
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Link Süresi */}
              <div>
                <Label htmlFor="expiry">Link Geçerlilik Süresi</Label>
                <Select value={linkExpiry} onValueChange={setLinkExpiry}>
                  <SelectTrigger id="expiry" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Gün</SelectItem>
                    <SelectItem value="7">7 Gün</SelectItem>
                    <SelectItem value="30">30 Gün</SelectItem>
                    <SelectItem value="0">Süresiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Link Oluştur Butonu */}
              {!shareLink && (
                <Button 
                  onClick={generateShareLink} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  <Link className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Oluşturuluyor...' : 'Paylaşım Linki Oluştur'}
                </Button>
              )}

              {/* Oluşturulan Link */}
              {shareLink && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input 
                      value={shareLink} 
                      readOnly 
                      className="flex-1"
                    />
                    <Button onClick={copyLink} size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* QR Kod */}
                  {qrCodeUrl && (
                    <div className="flex justify-center p-4 bg-white rounded-lg border">
                      <img src={qrCodeUrl} alt="QR Code" />
                    </div>
                  )}

                  {/* Paylaşım Seçenekleri */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={shareViaWhatsApp}
                      className="flex-1"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShareLink('')}
                      className="flex-1"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Yeni Link
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* E-posta ile Paylaşma */}
          <TabsContent value="email" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="emails">E-posta Adresleri</Label>
              <Input
                id="emails"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="ornek@email.com, diger@email.com"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Virgül ile ayırarak birden fazla adres girebilirsiniz</p>
            </div>

            <div>
              <Label>İzin Seviyesi</Label>
              <RadioGroup value={emailPermission} onValueChange={(v) => setEmailPermission(v as 'view' | 'edit' | 'admin')} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="view" id="email-view" />
                  <Label htmlFor="email-view" className="flex items-center gap-2 cursor-pointer">
                    <Eye className="h-4 w-4" />
                    Görüntüleyici
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="edit" id="email-edit" />
                  <Label htmlFor="email-edit" className="flex items-center gap-2 cursor-pointer">
                    <Edit3 className="h-4 w-4" />
                    Editör
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="email-admin" />
                  <Label htmlFor="email-admin" className="flex items-center gap-2 cursor-pointer">
                    <Shield className="h-4 w-4" />
                    Yönetici
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="message">Mesaj (İsteğe Bağlı)</Label>
              <Textarea
                id="message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Davet mesajınızı yazın..."
                className="mt-1"
                rows={3}
              />
            </div>

            <Button onClick={shareViaEmail} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Davet Gönder
            </Button>
          </TabsContent>

          {/* Kullanıcılarla Paylaşma */}
          <TabsContent value="users" className="space-y-4 mt-4">
            <div>
              <Label>İzin Seviyesi</Label>
              <RadioGroup value={userPermission} onValueChange={(v) => setUserPermission(v as 'view' | 'edit' | 'admin')} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="view" id="user-view" />
                  <Label htmlFor="user-view" className="flex items-center gap-2 cursor-pointer">
                    <Eye className="h-4 w-4" />
                    Görüntüleyici
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="edit" id="user-edit" />
                  <Label htmlFor="user-edit" className="flex items-center gap-2 cursor-pointer">
                    <Edit3 className="h-4 w-4" />
                    Editör
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="user-admin" />
                  <Label htmlFor="user-admin" className="flex items-center gap-2 cursor-pointer">
                    <Shield className="h-4 w-4" />
                    Yönetici
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Kullanıcı Seç</Label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                {availableUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => toggleUserSelection(user.id)}
                    className={cn(
                      "flex items-center justify-between p-2 rounded cursor-pointer transition-colors",
                      selectedUsers.includes(user.id) 
                        ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800" 
                        : "hover:bg-gray-50 dark:hover:bg-zinc-800"
                    )}
                  >
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email} • {user.department}</p>
                    </div>
                    {selectedUsers.includes(user.id) && (
                      <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={shareWithUsers} 
              className="w-full"
              disabled={selectedUsers.length === 0}
            >
              <Users className="h-4 w-4 mr-2" />
              {selectedUsers.length > 0 ? `${selectedUsers.length} Kullanıcıya Erişim Ver` : 'Kullanıcı Seçin'}
            </Button>
          </TabsContent>

          {/* Dışa Aktarma */}
          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={downloadAsPDF} className="h-24 flex-col gap-2">
                <FileDown className="h-6 w-6" />
                <span>PDF İndir</span>
              </Button>
              <Button variant="outline" onClick={downloadAsExcel} className="h-24 flex-col gap-2">
                <FileDown className="h-6 w-6" />
                <span>Excel İndir</span>
              </Button>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Not:</strong> Dışa aktarma işlemi klasördeki tüm listeleri ve ürünleri içerecektir.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}