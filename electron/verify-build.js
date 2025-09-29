const fs = require('fs');
const path = require('path');

console.log('📋 Build Verification Script');
console.log('============================\n');

// Production build için kontrol edilecek dosyalar
const checkList = [
  { path: '.next/standalone/server.js', required: true, desc: 'Standalone server' },
  { path: '.next/static', required: true, desc: 'Static files' },
  { path: 'public', required: true, desc: 'Public assets' },
  { path: 'prisma/schema.prisma', required: true, desc: 'Prisma schema' },
  { path: 'node_modules/.prisma', required: false, desc: 'Prisma client' },
  { path: '.env.local', required: false, desc: 'Environment variables (local)' },
  { path: '.env', required: false, desc: 'Environment variables' },
  { path: 'electron/main.js', required: true, desc: 'Electron main process' },
];

let allRequiredPresent = true;

console.log('Checking files...\n');

checkList.forEach(item => {
  const exists = fs.existsSync(item.path);
  const status = exists ? '✅' : (item.required ? '❌' : '⚠️');
  console.log(`${status} ${item.desc}: ${item.path}`);
  
  if (item.required && !exists) {
    allRequiredPresent = false;
    console.log(`   └─ HATA: Bu dosya gerekli!\n`);
  }
});

console.log('\n============================');

// Standalone server.js içeriğini kontrol et
if (fs.existsSync('.next/standalone/server.js')) {
  const serverContent = fs.readFileSync('.next/standalone/server.js', 'utf8');
  console.log('\n📄 server.js Analizi:');
  
  // PORT ve HOSTNAME kullanımını kontrol et
  if (serverContent.includes('process.env.PORT')) {
    console.log('✅ PORT environment variable kullanılıyor');
  } else {
    console.log('⚠️ PORT environment variable kullanılmıyor');
  }
  
  if (serverContent.includes('process.env.HOSTNAME')) {
    console.log('✅ HOSTNAME environment variable kullanılıyor');
  } else {
    console.log('⚠️ HOSTNAME environment variable kullanılmıyor');
  }
}

// next.config.js kontrolü
if (fs.existsSync('next.config.js')) {
  const configContent = fs.readFileSync('next.config.js', 'utf8');
  console.log('\n📄 next.config.js Analizi:');
  
  if (configContent.includes("output: 'standalone'") || configContent.includes('output: "standalone"')) {
    console.log('✅ Standalone output mode aktif');
  } else {
    console.log('❌ HATA: Standalone output mode aktif değil!');
    allRequiredPresent = false;
  }
}

// package.json kontrolü
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('\n📄 package.json Analizi:');
  
  if (packageJson.build && packageJson.build.extraResources) {
    console.log('✅ extraResources tanımlı');
    
    // İç içe .next klasörü kontrolü
    const hasNestedNext = packageJson.build.extraResources.some(resource => 
      resource.to && resource.to.includes('.next/standalone/.next')
    );
    
    if (hasNestedNext) {
      console.log('❌ HATA: İç içe .next klasörü tespit edildi!');
      allRequiredPresent = false;
    } else {
      console.log('✅ İç içe .next klasörü yok');
    }
  }
}

console.log('\n============================');
if (allRequiredPresent) {
  console.log('\n✅ Build hazır görünüyor!');
  console.log('\n📌 Sonraki adımlar:');
  console.log('1. npm run build:prod');
  console.log('2. dist/ klasöründeki .exe dosyasını çalıştır');
} else {
  console.log('\n❌ Build için bazı dosyalar eksik veya hatalı!');
  console.log('\n📌 Çözüm önerileri:');
  console.log('1. npm run build (Next.js build)');
  console.log('2. next.config.js dosyasında output: "standalone" olmalı');
  console.log('3. package.json extraResources yollarını kontrol et');
}

process.exit(allRequiredPresent ? 0 : 1);