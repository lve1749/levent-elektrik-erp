// Excel Export Utility Functions
// Bu dosya, basit ve gelişmiş Excel export işlemleri için yardımcı fonksiyonlar içerir

import XLSX from 'xlsx-js-style'
import { saveAs } from 'file-saver'

// Basit Excel Export (xlsx-js-style ile)
export const simpleExportToExcel = (data: any[], filename: string, sheetName: string = 'Data') => {
  // Data'yı worksheet'e çevir
  const ws = XLSX.utils.json_to_sheet(data)
  
  // Basit stil ekle (header için)
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  
  // Header stilini uygula
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + "1"
    if (!ws[address]) continue
    
    ws[address].s = {
      fill: { 
        fgColor: { rgb: "FF4472C4" },
        patternType: "solid"
      },
      font: { 
        bold: true, 
        color: { rgb: "FFFFFFFF" },
        sz: 11
      },
      alignment: { 
        horizontal: "center",
        vertical: "center"
      },
      border: {
        top: { style: "thin", color: { rgb: "FFD3D3D3" } },
        bottom: { style: "thin", color: { rgb: "FFD3D3D3" } },
        left: { style: "thin", color: { rgb: "FFD3D3D3" } },
        right: { style: "thin", color: { rgb: "FFD3D3D3" } }
      }
    }
  }
  
  // Data satırlarına border ekle
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + (R + 1).toString()
      if (!ws[address]) continue
      
      if (!ws[address].s) ws[address].s = {}
      
      ws[address].s.border = {
        top: { style: "thin", color: { rgb: "FFE0E0E0" } },
        bottom: { style: "thin", color: { rgb: "FFE0E0E0" } },
        left: { style: "thin", color: { rgb: "FFE0E0E0" } },
        right: { style: "thin", color: { rgb: "FFE0E0E0" } }
      }
      
      // Zebra stripe pattern
      if (R % 2 === 0) {
        ws[address].s.fill = {
          fgColor: { rgb: "FFF8F8F8" },
          patternType: "solid"
        }
      }
    }
  }
  
  // Kolon genişliklerini otomatik ayarla
  const colWidths = []
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxWidth = 10
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const address = XLSX.utils.encode_col(C) + (R + 1).toString()
      if (ws[address] && ws[address].v) {
        const cellValue = ws[address].v.toString()
        maxWidth = Math.max(maxWidth, cellValue.length * 1.2)
      }
    }
    
    colWidths.push({ wch: Math.min(maxWidth, 50) })
  }
  ws['!cols'] = colWidths
  
  // Workbook oluştur
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  
  // Dosyayı indir
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

// CSV Export
export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return
  
  // Headers
  const headers = Object.keys(data[0])
  let csvContent = headers.join(',') + '\n'
  
  // Data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header]
      // CSV için özel karakterleri handle et
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value || ''
    })
    csvContent += values.join(',') + '\n'
  })
  
  // BOM ekle (Excel'de Türkçe karakterler için)
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, `${filename}.csv`)
}

// Multi-sheet Excel Export
export const multiSheetExportToExcel = (
  sheets: Array<{ name: string; data: any[] }>,
  filename: string
) => {
  const wb = XLSX.utils.book_new()
  
  sheets.forEach(sheet => {
    if (sheet.data.length === 0) return
    
    const ws = XLSX.utils.json_to_sheet(sheet.data)
    
    // Her sheet için basit stil uygula
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    
    // Header stili
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1"
      if (!ws[address]) continue
      
      ws[address].s = {
        fill: { 
          fgColor: { rgb: "FF0070C0" },
          patternType: "solid"
        },
        font: { 
          bold: true, 
          color: { rgb: "FFFFFFFF" }
        },
        alignment: { 
          horizontal: "center"
        }
      }
    }
    
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.substring(0, 31)) // Excel sheet ismi max 31 karakter
  })
  
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

// Excel'den veri okuma (import)
export const importFromExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        
        // İlk sheet'i al
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // JSON'a çevir
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Dosya okuma hatası'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

// Format helpers
export const formatExcelDate = (serialDate: number): Date => {
  // Excel serial date'i JavaScript Date'e çevir
  const utcDays = Math.floor(serialDate - 25569)
  const utcValue = utcDays * 86400
  const dateInfo = new Date(utcValue * 1000)
  
  return new Date(dateInfo.getFullYear(), dateInfo.getMonth(), dateInfo.getDate())
}

export const toExcelDate = (date: Date): number => {
  // JavaScript Date'i Excel serial date'e çevir
  const epoch = new Date(1899, 11, 31)
  const msPerDay = 86400000
  
  return Math.floor((date.getTime() - epoch.getTime()) / msPerDay) + 1
}