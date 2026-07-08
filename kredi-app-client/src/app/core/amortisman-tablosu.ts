import { PmtGirdi } from './pmt-hesaplama';

export interface AmortismanSatiri {
  ay: number;
  taksit: number;
  anapara: number;
  hamFaiz: number;
  bsmv: number;
  kkdf: number;
  efektifFaiz: number;
  kalan: number;
}

export function amortismanTablosuOlustur(girdi: PmtGirdi): AmortismanSatiri[] {
  const { anapara: baslangicAnapara, vade, faizOrani, kkdf, bsmv } = girdi;

  const efektifOran = faizOrani * (1 + bsmv + kkdf);
  const carpan = Math.pow(1 + efektifOran, vade);
  const taksit = (baslangicAnapara * (efektifOran * carpan)) / (carpan - 1);

  const satirlar: AmortismanSatiri[] = [];
  let kalan = baslangicAnapara;

  for (let ay = 1; ay <= vade; ay++) {
    const hamFaiz = kalan * faizOrani;
    const bsmvTutari = hamFaiz * bsmv;
    const kkdfTutari = hamFaiz * kkdf;
    const efektifFaiz = hamFaiz + bsmvTutari + kkdfTutari;
    const anaparaPayi = taksit - efektifFaiz;
    kalan = kalan - anaparaPayi;

    satirlar.push({
      ay,
      taksit: yuvarla(taksit),
      anapara: yuvarla(anaparaPayi),
      hamFaiz: yuvarla(hamFaiz),
      bsmv: yuvarla(bsmvTutari),
      kkdf: yuvarla(kkdfTutari),
      efektifFaiz: yuvarla(efektifFaiz),
      kalan: yuvarla(Math.max(kalan, 0)),
    });
  }

  return satirlar;
}

function yuvarla(deger: number): number {
  return Math.round(deger * 100) / 100;
}
