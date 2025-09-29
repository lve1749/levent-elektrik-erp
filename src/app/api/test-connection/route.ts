import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { buildConnectionString } from '@/lib/electron-db-config';
import type { DBConfig } from '@/types/electron';

export async function POST(request: NextRequest) {
  try {
    // Request body'den config al
    const config: DBConfig = await request.json();
    
    if (!config.server || !config.database) {
      return NextResponse.json(
        { success: false, error: 'Server ve database bilgileri gereklidir' },
        { status: 400 }
      );
    }

    // Connection string oluştur
    const connectionString = buildConnectionString(config);
    
    // Test için geçici Prisma client oluştur
    const testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: connectionString
        }
      }
    });

    try {
      // Basit bir sorgu ile bağlantıyı test et
      await testPrisma.$connect();
      await testPrisma.$queryRaw`SELECT 1 as test`;
      await testPrisma.$disconnect();
      
      return NextResponse.json({ 
        success: true, 
        message: 'Veritabanı bağlantısı başarılı!' 
      });
    } catch (dbError: any) {
      console.error('Database connection error:', dbError);
      
      let errorMessage = 'Veritabanına bağlanılamadı';
      
      // Hata mesajını detaylandır
      if (dbError.message) {
        if (dbError.message.includes('Login failed')) {
          errorMessage = 'Kullanıcı adı veya şifre hatalı';
        } else if (dbError.message.includes('Cannot open database')) {
          errorMessage = 'Veritabanı bulunamadı';
        } else if (dbError.message.includes('connect ECONNREFUSED')) {
          errorMessage = 'SQL Server\'a bağlanılamıyor. Server adresi ve port\'u kontrol edin';
        } else if (dbError.message.includes('connect ETIMEDOUT')) {
          errorMessage = 'Bağlantı zaman aşımına uğradı';
        } else {
          errorMessage = dbError.message;
        }
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    } finally {
      await testPrisma.$disconnect();
    }
  } catch (error: any) {
    console.error('Test connection error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Beklenmeyen bir hata oluştu' },
      { status: 500 }
    );
  }
}