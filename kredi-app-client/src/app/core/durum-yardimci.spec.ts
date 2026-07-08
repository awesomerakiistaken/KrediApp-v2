import { durumSinifi } from './durum-yardimci';

describe('durumSinifi', () => {
  it('Bekleme için "bekleme" sınıfını döner', () => {
    expect(durumSinifi('Bekleme')).toBe('bekleme');
  });

  it('Onaylandı için "onaylandi" sınıfını döner', () => {
    expect(durumSinifi('Onaylandı')).toBe('onaylandi');
  });

  it('Reddedildi için "reddedildi" sınıfını döner', () => {
    expect(durumSinifi('Reddedildi')).toBe('reddedildi');
  });
});
