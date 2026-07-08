export interface PmtGirdi {
  anapara: number;
  vade: number;
  faizOrani: number;
  kkdf: number;
  bsmv: number;
}

export interface PmtSonuc {
  aylikTaksit: number;
  toplamGeriOdeme: number;
  toplamFaizTutari: number;
}

export function pmtHesapla(girdi: PmtGirdi): PmtSonuc {
  const { anapara, vade, faizOrani, kkdf, bsmv } = girdi;

  const efektifOran = faizOrani * (1 + bsmv + kkdf);
  const carpan = Math.pow(1 + efektifOran, vade);
  const aylikTaksit = (anapara * (efektifOran * carpan)) / (carpan - 1);
  const toplamGeriOdeme = aylikTaksit * vade;
  const toplamFaizTutari = toplamGeriOdeme - anapara;

  return {
    aylikTaksit: Math.round(aylikTaksit * 100) / 100,
    toplamGeriOdeme: Math.round(toplamGeriOdeme * 100) / 100,
    toplamFaizTutari: Math.round(toplamFaizTutari * 100) / 100,
  };
}
