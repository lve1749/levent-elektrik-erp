import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { 
      feedbackType, 
      priority, 
      subject, 
      message, 
      affectedPage,
      attachments 
    } = body

    // E-posta içeriğini hazırla
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">
          Yeni Geri Bildirim
        </h2>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Tür:</strong> ${getFeedbackTypeLabel(feedbackType)}</p>
          <p><strong>Öncelik:</strong> ${getPriorityLabel(priority)}</p>
          <p><strong>İlgili Sayfa:</strong> ${getPageLabel(affectedPage)}</p>
        </div>
        
        <div style="background-color: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h3 style="color: #333; margin-top: 0;">Konu: ${subject}</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>
        
        ${attachments && attachments.length > 0 ? `
        <div style="background-color: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin-top: 20px;">
          <h3 style="color: #333; margin-top: 0;">Eklenen Dosyalar (${attachments.length} adet)</h3>
          <p style="color: #666; font-size: 14px;">Dosyalar e-postanın ekinde bulunmaktadır.</p>
          <ul style="list-style: none; padding: 0;">
            ${attachments.map((file: any) => `
              <li style="padding: 5px 0; color: #555;">
                📎 ${file.name}
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}
        
        <div style="margin-top: 20px; padding: 10px; background-color: #f8f8f8; border-radius: 4px; text-align: center; color: #666; font-size: 12px;">
          <p>Bu e-posta Levent Elektrik geri bildirim formundan gönderilmiştir.</p>
          <p>Tarih: ${new Date().toLocaleString('tr-TR')}</p>
        </div>
      </div>
    `

    // Dosya eklerini hazırla
    const emailAttachments = attachments?.map((file: any) => ({
      filename: file.name,
      content: file.content,
      encoding: 'base64'
    })) || []

    // E-postayı gönder
    const { data, error } = await resend.emails.send({
      from: 'Geri Bildirim <feedback@onlinelevent.com>', // feedback adresi
      to: [process.env.EMAIL_TO!],
      subject: `[Geri Bildirim] ${subject}`,
      html: emailHtml,
      attachments: emailAttachments
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'E-posta gönderilemedi' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Geri bildirim başarıyla gönderildi',
      id: data?.id 
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Yardımcı fonksiyonlar
function getFeedbackTypeLabel(type: string): string {
  const types: Record<string, string> = {
    'bug': 'Hata',
    'feature': 'Özellik',
    'improvement': 'İyileştirme',
    'other': 'Diğer'
  }
  return types[type] || type
}

function getPriorityLabel(priority: string): string {
  const priorities: Record<string, string> = {
    'low': 'Düşük',
    'medium': 'Orta',
    'high': 'Yüksek',
    'critical': 'Kritik'
  }
  return priorities[priority] || priority
}

function getPageLabel(page: string): string {
  const pages: Record<string, string> = {
    'stock-analysis': 'Stok Analizi',
    'orders': 'Siparişler',
    'lists': 'Listeler',
    'folders': 'Klasörler',
    'archive': 'Arşiv',
    'general': 'Genel',
    'other': 'Diğer'
  }
  return pages[page] || 'Belirtilmedi'
}