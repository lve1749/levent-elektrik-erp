export interface HareketDetay {
  stokKodu: string;
  stokIsmi: string;
  girisMiktari: number;
  cikisMiktari: number;
  hareketTarihi: Date | string;
  hareketTipi: string;
  stokEtkisi: string;
  evrakNo: string;
  cariKodu: string | null;
  aciklama: string | null;
  normalKati?: number;
  renkKodu: string;
  evrakTip: number;
  tip?: number;
  cins?: number;
  iadeFlag?: number;
  kalanMiktar?: number;
}

export interface OzetBilgi {
  netGirisMiktari: number;
  netCikisMiktari: number;
  kalanMiktar: number;
  toplamHareket: number;
  normalGirisSayisi: number;
  normalCikisSayisi: number;
  satisIadesiSayisi: number;
  alisIadesiSayisi: number;
  projeHareketi: number;
  degisim: number;
  sayim: number;
  ortNormalGiris?: number;
  ortNormalSatis?: number;
  standartSapma?: number;
  ortalamaSatis?: number;
  ustSinir?: number;
}