export function durumSinifi(durum: string): string {
  switch (durum) {
    case 'Onaylandı':
      return 'onaylandi';
    case 'Reddedildi':
      return 'reddedildi';
    default:
      return 'bekleme';
  }
}
