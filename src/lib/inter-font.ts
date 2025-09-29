// Inter font için vfont formatı
// Bu dosya jsPDF'in anlayabileceği formatta font verisi içerir

export const InterRegularFont = {
  // Font verisi Base64 olarak eklenecek
  // Şimdilik varsayılan font kullanacağız
  fallback: true
}

// Alternatif çözüm: Türkçe karakterleri destekleyen 
// varsayılan bir font seti oluştur
export const turkishCharMap: Record<string, string> = {
  'ı': 'i',
  'İ': 'I', 
  'ğ': 'g',
  'Ğ': 'G',
  'ü': 'u',
  'Ü': 'U',
  'ş': 's',
  'Ş': 'S',
  'ö': 'o',
  'Ö': 'O',
  'ç': 'c',
  'Ç': 'C',
  // Diğer özel karakterler
  '–': '-',
  '—': '-',
  '"': '"',
  '\u2018': "'", // ' karakteri
  '\u2019': "'", // ' karakteri
  '…': '...',
  '•': '*',
  '€': 'EUR',
  '₺': 'TL'
}

export function convertTurkishChars(text: string): string {
  if (!text) return ''
  
  let result = text
  Object.entries(turkishCharMap).forEach(([turkish, latin]) => {
    result = result.replace(new RegExp(turkish, 'g'), latin)
  })
  
  return result
}