import { pmtHesapla } from './pmt-hesaplama';

describe('pmtHesapla', () => {
  it('backend ile aynı Fransız amortisman formülünü kullanarak taksit hesaplar', () => {
    // Backend testinde (KrediHesaplamaController) doğrulanan referans değerler:
    // 15000 TL, 12 ay, %2.5 aylık faiz, %15 kkdf, %5 bsmv → aylık taksit 1506.93
    const sonuc = pmtHesapla({
      anapara: 15000,
      vade: 12,
      faizOrani: 0.025,
      kkdf: 0.15,
      bsmv: 0.05,
    });

    expect(sonuc.aylikTaksit).toBeCloseTo(1506.93, 1);
    expect(sonuc.toplamGeriOdeme).toBeCloseTo(sonuc.aylikTaksit * 12, 1);
    expect(sonuc.toplamFaizTutari).toBeCloseTo(sonuc.toplamGeriOdeme - 15000, 1);
  });

  it('vade arttıkça aylık taksit azalır', () => {
    const kisaVade = pmtHesapla({ anapara: 10000, vade: 6, faizOrani: 0.02, kkdf: 0.15, bsmv: 0.05 });
    const uzunVade = pmtHesapla({ anapara: 10000, vade: 24, faizOrani: 0.02, kkdf: 0.15, bsmv: 0.05 });

    expect(uzunVade.aylikTaksit).toBeLessThan(kisaVade.aylikTaksit);
  });
});
