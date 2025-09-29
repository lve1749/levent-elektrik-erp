import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Mikro API yapılandırması
const MIKRO_API_URL = 'http://192.168.2.5:8084/Api/APIMethods/APILogin'
const API_KEY = 'MUHRbobEsjsijAFpBVPTJsAMdajTos6o5D/A8C5EWXe2fQhj2Qa8KBz0HjFXT8xKVB2LVD5wSGuQdfPBkt5E6bFSZ/3kEU6PuAv0FjszdfI='
const FIRMA_KODU = 'LEVENT2025'
const CALISMA_YILI = '2025'

// Şifre hashleme fonksiyonu (MD5)
// Format: YYYY-MM-DD + boşluk + şifre
function hashPassword(password: string): string {
  // Bugünün tarihini al (YYYY-MM-DD formatında)
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`
  
  // Tarih + boşluk + şifre formatında birleştir
  const combinedString = `${dateStr} ${password}`
  
  console.log('Password hash input:', combinedString)
  
  // MD5 hash oluştur
  return crypto.createHash('md5').update(combinedString).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    console.log('Login attempt for user:', username)

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      )
    }

    // Şifreyi MD5 ile hashle
    const hashedPassword = hashPassword(password)
    console.log('Hashed password:', hashedPassword)

    // Mikro API'ye gönderilecek veri
    const mikroPayload = {
      FirmaKodu: FIRMA_KODU,
      CalismaYili: CALISMA_YILI,
      ApiKey: API_KEY,
      KullaniciKodu: username,
      Sifre: hashedPassword,
      FirmaNo: 0,
      SubeNo: 0
    }

    console.log('Sending to Mikro API:', MIKRO_API_URL)
    console.log('Payload:', JSON.stringify(mikroPayload, null, 2))

    try {
      // Mikro API'ye istek gönder
      const mikroResponse = await fetch(MIKRO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mikroPayload)
      })

      console.log('Mikro API Response Status:', mikroResponse.status)
      
      const responseText = await mikroResponse.text()
      console.log('Mikro API Response Text:', responseText)
      
      let mikroData
      try {
        mikroData = JSON.parse(responseText)
      } catch (e) {
        console.error('Failed to parse Mikro response:', e)
        // Eğer parse edilemezse, response text'i direkt kullan
        mikroData = { success: false, message: responseText }
      }

      console.log('Mikro API Response Data:', mikroData)

      // Başarılı login kontrolü - Mikro API'nin döndürdüğü yapıya göre güncelle
      if (mikroResponse.ok || mikroData.Result === true || mikroData.Success === true || mikroData.Basarili === true) {
      // Başarılı giriş
      // Session token oluştur
      const sessionToken = crypto.randomBytes(32).toString('hex')
      
      // Kullanıcı adını belirle
      const userNames: Record<string, string> = {
        '2': 'Murat',
        '3': 'Serkan',
        '4': 'Seda',
        '5': 'Bayram',
        '6': 'Hasan',
        '7': 'Cansu',
        '8': 'Uğur',
        '9': 'Savaş',
        '10': 'Hayati',
        '11': 'Şakir',
        '12': 'Ata',
        '13': 'Tunay',
        '14': 'Ayşe',
        '16': 'Yasemin',
        '17': 'Depo',
        '18': 'İsmail',
        '19': 'Necmettin',
        '20': 'Süleyman',
        '21': 'İsmail',
        '22': 'Bülent',
        '23': 'Merve',
        '24': 'Gülsüm',
        '26': 'Ayşenur',
        '27': 'Ömer Can',
        '28': 'Muhammed',
        '29': 'Berke',
        '30': 'Volkan',
        '99': 'Admin',
      }
      const displayName = userNames[username] || username
      
      console.log('Login successful for user:', username, '-> Display name:', displayName)
      
      // Response oluştur ve cookie set et
      const response = NextResponse.json({
        success: true,
        message: 'Giriş başarılı',
        user: {
          username: displayName,
          firma: FIRMA_KODU,
          yil: CALISMA_YILI
        }
      })

      // HttpOnly cookie olarak session token'ı kaydet
      response.cookies.set('session-token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 gün
        path: '/'
      })

      // Kullanıcı bilgilerini de cookie'ye kaydet (client tarafında okunabilir)
      response.cookies.set('user-info', JSON.stringify({
        username: displayName,
        firma: FIRMA_KODU,
        yil: CALISMA_YILI
      }), {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 gün
        path: '/'
      })

      return response
    } else {
      // Başarısız giriş
      console.error('Login failed:', mikroData)
      return NextResponse.json(
        { 
          success: false, 
          message: mikroData.Message || mikroData.Mesaj || mikroData.ErrorMessage || mikroData.message || 'Kullanıcı adı veya şifre hatalı',
          details: mikroData
        },
        { status: 401 }
      )
    }
    } catch (fetchError) {
      console.error('Mikro API fetch error:', fetchError)
      // Network hatası veya CORS problemi olabilir
      // Geliştirme ortamında bypass için geçici çözüm
      if (process.env.NODE_ENV === 'development') {
        // Geliştirme modunda, belirli kullanıcılar için bypass
        if (username === '29' || username === 'admin') {
          const sessionToken = crypto.randomBytes(32).toString('hex')
          
          // Kullanıcı adını belirle
          const userNames: Record<string, string> = {
            '2': 'Murat',
            '3': 'Serkan',
            '4': 'Seda',
            '5': 'Bayram',
            '6': 'Hasan',
            '7': 'Cansu',
            '8': 'Uğur',
            '9': 'Savaş',
            '10': 'Hayati',
            '11': 'Şakir',
            '12': 'Ata',
            '13': 'Tunay',
            '14': 'Ayşe',
            '16': 'Yasemin',
            '17': 'Depo',
            '18': 'İsmail',
            '19': 'Necmettin',
            '20': 'Süleyman',
            '21': 'İsmail',
            '22': 'Bülent',
            '23': 'Merve',
            '24': 'Gülsüm',
            '26': 'Ayşenur',
            '27': 'Ömer Can',
            '28': 'Muhammed',
            '29': 'Berke',
            '30': 'Volkan',
            '99': 'Admin',
          }
          const displayName = userNames[username] || username
          
          console.log('Development bypass - Login for user:', username, '-> Display name:', displayName)
          
          const response = NextResponse.json({
            success: true,
            message: 'Giriş başarılı (Development Mode)',
            user: {
              username: displayName,
              firma: FIRMA_KODU,
              yil: CALISMA_YILI
            }
          })

          response.cookies.set('session-token', sessionToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
          })

          response.cookies.set('user-info', JSON.stringify({
            username: displayName,
            firma: FIRMA_KODU,
            yil: CALISMA_YILI
          }), {
            secure: false,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
          })

          return response
        }
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Mikro API bağlantısı kurulamadı. Network veya CORS hatası olabilir.',
          error: fetchError.message
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Giriş işlemi sırasında bir hata oluştu',
        error: error.message
      },
      { status: 500 }
    )
  }
}