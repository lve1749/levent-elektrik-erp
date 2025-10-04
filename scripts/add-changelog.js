#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
};

async function main() {
  console.log('🚀 Yeni Changelog Girişi Oluşturucu\n');

  // Versiyon numarası
  const version = await question('Versiyon numarası (örn: 1.0.8): ');
  
  // Başlık
  const title = await question('Güncelleme başlığı: ');
  
  // Açıklama
  const description = await question('Açıklama (isteğe bağlı, boş bırakabilirsiniz): ');
  
  // Tarih
  const dateInput = await question('Tarih (YYYY-MM-DD formatında, boş bırakırsanız bugün): ');
  const date = dateInput || new Date().toISOString().split('T')[0];
  
  // Kategoriler
  const categories = [];
  let addMore = true;
  
  while (addMore) {
    console.log('\n📋 Kategori Ekle');
    console.log('Tip seçenekleri: features, improvements, fixes, api, breaking');
    
    const type = await question('Kategori tipi: ');
    const categoryTitle = await question('Kategori başlığı: ');
    
    const items = [];
    console.log('Öğeleri girin (boş satır girdiğinizde kategori tamamlanır):');
    
    let itemInput = await question('  • ');
    while (itemInput) {
      items.push(itemInput);
      itemInput = await question('  • ');
    }
    
    if (items.length > 0) {
      categories.push({
        type,
        title: categoryTitle,
        count: items.length,
        items
      });
    }
    
    const continueAdding = await question('\nBaşka kategori eklemek ister misiniz? (e/h): ');
    addMore = continueAdding.toLowerCase() === 'e';
  }
  
  // Görsel yolu (isteğe bağlı)
  const image = await question('\nGörsel yolu (isteğe bağlı, örn: /changelog/images/2025/v1.0.8/feature.png): ');
  
  // ID oluştur
  const indexPath = path.join(__dirname, '..', 'public', 'changelog', 'index.json');
  let nextId = '1';
  
  if (fs.existsSync(indexPath)) {
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    const existingVersions = index.versions || [];
    nextId = String(existingVersions.length + 1);
  }
  
  // Changelog entry oluştur
  const changelogEntry = {
    id: nextId,
    version,
    title,
    ...(description && { description }),
    date,
    ...(image && { image }),
    ...(categories.length > 0 && { categories })
  };
  
  // Dosyayı kaydet
  const versionFilePath = path.join(__dirname, '..', 'public', 'changelog', 'versions', `${version}.json`);
  
  // Klasör yoksa oluştur
  const versionsDir = path.dirname(versionFilePath);
  if (!fs.existsSync(versionsDir)) {
    fs.mkdirSync(versionsDir, { recursive: true });
  }
  
  fs.writeFileSync(versionFilePath, JSON.stringify(changelogEntry, null, 2));
  console.log(`\n✅ ${version}.json dosyası oluşturuldu!`);
  
  // Index dosyasını güncelle
  if (fs.existsSync(indexPath)) {
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    
    // Yeni versiyonu başa ekle
    if (!index.versions.includes(version)) {
      index.versions.unshift(version);
      index.latest = version;
      index.lastUpdated = date;
      
      fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
      console.log('✅ index.json güncellendi!');
    }
  } else {
    // Index dosyası yoksa oluştur
    const newIndex = {
      versions: [version],
      latest: version,
      lastUpdated: date
    };
    
    fs.writeFileSync(indexPath, JSON.stringify(newIndex, null, 2));
    console.log('✅ index.json oluşturuldu!');
  }
  
  console.log('\n🎉 Changelog başarıyla eklendi!');
  console.log('📝 Oluşturulan dosya:', versionFilePath);
  
  rl.close();
}

main().catch((error) => {
  console.error('Hata:', error);
  rl.close();
  process.exit(1);
});