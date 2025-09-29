const fs = require('fs-extra');
const path = require('path');

async function copyStaticFiles() {
  console.log('📁 Static dosyalar kopyalanıyor...');
  
  const source = path.join(__dirname, '../.next/static');
  const dest = path.join(__dirname, '../.next/standalone/.next/static');
  
  try {
    await fs.ensureDir(path.dirname(dest));
    await fs.copy(source, dest, { overwrite: true });
    console.log('✅ Static dosyalar kopyalandı!');
    console.log(`   Kaynak: ${source}`);
    console.log(`   Hedef: ${dest}`);
  } catch (error) {
    console.error('❌ Static dosya kopyalama hatası:', error);
    process.exit(1);
  }
  
  // Public klasörünü de kopyala
  const publicSource = path.join(__dirname, '../public');
  const publicDest = path.join(__dirname, '../.next/standalone/public');
  
  try {
    await fs.ensureDir(publicDest);
    await fs.copy(publicSource, publicDest, { overwrite: true });
    console.log('✅ Public dosyalar kopyalandı!');
    console.log(`   Kaynak: ${publicSource}`);
    console.log(`   Hedef: ${publicDest}`);
  } catch (error) {
    console.error('❌ Public dosya kopyalama hatası:', error);
    process.exit(1);
  }
}

copyStaticFiles().then(() => {
  console.log('\n✨ Tüm static dosyalar başarıyla kopyalandı!');
}).catch((error) => {
  console.error('\n❌ HATA:', error);
  process.exit(1);
});