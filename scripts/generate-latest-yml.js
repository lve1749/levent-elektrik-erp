const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { execSync } = require('child_process');

const packageJson = require('../package.json');
const version = packageJson.version;
const msiName = `Levent Elektrik ${version}.msi`;
const msiPath = path.join(__dirname, '../dist', msiName);

// MSI var mı kontrol et
if (!fs.existsSync(msiPath)) {
  console.error('MSI dosyası bulunamadı:', msiPath);
  process.exit(1);
}

// Hash hesapla
const fileBuffer = fs.readFileSync(msiPath);
const hashSum = crypto.createHash('sha512');
hashSum.update(fileBuffer);
const sha512 = hashSum.digest('hex');

// Dosya boyutu
const size = fs.statSync(msiPath).size;

// latest.yml içeriği (doğru YAML formatında)
const yamlContent = `version: ${version}
files:
  - url: Levent-Elektrik-${version}.msi
    sha512: ${sha512}
    size: ${size}
path: Levent-Elektrik-${version}.msi
sha512: ${sha512}
releaseDate: '${new Date().toISOString()}'`;

// dist klasörüne yaz
const yamlPath = path.join(__dirname, '../dist/latest.yml');
fs.writeFileSync(yamlPath, yamlContent, 'utf8');
console.log('latest.yml oluşturuldu!');

// GitHub CLI ile yükle
try {
  // Repository'yi belirt
  const repo = 'lve1749/levent-elektrik-releases';
  
  // Release var mı kontrol et
  try {
    execSync(`gh release view v${version} --repo ${repo}`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(`Release v${version} mevcut.`);
  } catch (e) {
    console.log(`Release v${version} bulunamadı, oluşturuluyor...`);
    // Release yoksa oluştur
    execSync(`gh release create v${version} --repo ${repo} --title "Version ${version}" --notes "Release ${version}"`, {
      stdio: 'inherit'
    });
  }
  
  // latest.yml'i yükle
  execSync(`gh release upload v${version} "${yamlPath}" --repo ${repo} --clobber`, { 
    stdio: 'inherit'
  });
  
  console.log('✅ latest.yml GitHub\'a otomatik yüklendi!');
} catch (error) {
  console.log('⚠️ GitHub CLI hatası:', error.message);
  console.log('Manuel yükleme gerekebilir.');
}