import { amortismanTablosuOlustur } from './amortisman-tablosu';

describe('amortismanTablosuOlustur', () => {
  it('vade sayısı kadar satır üretir', () => {
    const satirlar = amortismanTablosuOlustur({
      anapara: 15000,
      vade: 12,
      faizOrani: 0.025,
      kkdf: 0.15,
      bsmv: 0.05,
    });

    expect(satirlar).toHaveLength(12);
  });

  it('her satırda ay numarası artan sırada olur', () => {
    const satirlar = amortismanTablosuOlustur({
      anapara: 10000,
      vade: 3,
      faizOrani: 0.02,
      kkdf: 0.15,
      bsmv: 0.05,
    });

    expect(satirlar.map((s) => s.ay)).toEqual([1, 2, 3]);
  });

  it('son satırda kalan bakiye sıfıra yakın olur', () => {
    const satirlar = amortismanTablosuOlustur({
      anapara: 15000,
      vade: 12,
      faizOrani: 0.025,
      kkdf: 0.15,
      bsmv: 0.05,
    });

    expect(satirlar[satirlar.length - 1].kalan).toBeCloseTo(0, 1);
  });

  it('her ay taksit tutarı, anapara+ham faiz+bsmv+kkdf toplamına eşittir', () => {
    const satirlar = amortismanTablosuOlustur({
      anapara: 15000,
      vade: 12,
      faizOrani: 0.025,
      kkdf: 0.15,
      bsmv: 0.05,
    });

    for (const satir of satirlar) {
      expect(satir.taksit).toBeCloseTo(
        satir.anapara + satir.hamFaiz + satir.bsmv + satir.kkdf,
        1,
      );
    }
  });
});
