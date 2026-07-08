import { raporSatirlariniHazirla } from './rapor-disa-aktar';
import { KrediBasvuru } from './kredi-basvuru';

describe('raporSatirlariniHazirla', () => {
  it('başvuruları export edilebilir düz satırlara çevirir', () => {
    const basvurular: KrediBasvuru[] = [
      {
        id: 1,
        kullaniciId: 1,
        krediUrunuId: 1,
        talepEdilenTutar: 15000,
        talepEdilenVade: 12,
        faizOrani: 0.025,
        kkdf: 0.15,
        bsmv: 0.05,
        basvuruTarihi: '2026-01-01T10:00:00',
        durum: 'Onaylandı',
        riskSkoru: 0.05,
        kararTarihi: '2026-01-02T10:00:00',
        kullanici: { ad: 'Ali', soyad: 'Demir', tcKimlik: '12345678901', telNo: '5551234567' },
        krediUrunu: { ad: 'İhtiyaç Kredisi' },
      },
    ];

    const satirlar = raporSatirlariniHazirla(basvurular);

    expect(satirlar).toEqual([
      {
        'Başvuru Tarihi': expect.any(String),
        'Ad Soyad': 'Ali Demir',
        'TC Kimlik': '12345678901',
        Telefon: '5551234567',
        Durum: 'Onaylandı',
        'Kredi Türü': 'İhtiyaç Kredisi',
        'Kredi Tutarı': 15000,
        'Risk Skoru': 0.05,
      },
    ]);
  });
});
