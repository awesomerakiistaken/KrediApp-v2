import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { KrediBasvuru } from './kredi-basvuru';

export interface RaporSatiri {
  'Başvuru Tarihi': string;
  'Ad Soyad': string;
  'TC Kimlik': string;
  Telefon: string;
  Durum: string;
  'Kredi Türü': string;
  'Kredi Tutarı': number;
  'Risk Skoru': number | null;
}

export function raporSatirlariniHazirla(basvurular: KrediBasvuru[]): RaporSatiri[] {
  return basvurular.map((b) => ({
    'Başvuru Tarihi': new Date(b.basvuruTarihi).toLocaleString('tr-TR'),
    'Ad Soyad': `${b.kullanici?.ad ?? ''} ${b.kullanici?.soyad ?? ''}`.trim(),
    'TC Kimlik': b.kullanici?.tcKimlik ?? '',
    Telefon: b.kullanici?.telNo ?? '',
    Durum: b.durum,
    'Kredi Türü': b.krediUrunu?.ad ?? '',
    'Kredi Tutarı': b.talepEdilenTutar,
    'Risk Skoru': b.riskSkoru,
  }));
}

export function raporuPdfOlarakIndir(basvurular: KrediBasvuru[], dosyaAdi = 'basvuru-raporu.pdf'): void {
  const satirlar = raporSatirlariniHazirla(basvurular);
  const dogum = new jsPDF();

  autoTable(dogum, {
    head: [Object.keys(satirlar[0] ?? {})],
    body: satirlar.map((s) => Object.values(s)),
  });

  dogum.save(dosyaAdi);
}

export function raporuExcelOlarakIndir(basvurular: KrediBasvuru[], dosyaAdi = 'basvuru-raporu.xlsx'): void {
  const satirlar = raporSatirlariniHazirla(basvurular);
  const calismaSayfasi = XLSX.utils.json_to_sheet(satirlar);
  const kitap = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(kitap, calismaSayfasi, 'Başvurular');
  XLSX.writeFile(kitap, dosyaAdi);
}
