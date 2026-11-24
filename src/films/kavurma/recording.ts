/**
 * V5 — DIŞ SES KAYDI: ölçülen zamanlar ve film üzerindeki yerleşim
 *
 * Kaynak: audio/dis_ses_kayit_v4.mp3 (ElevenLabs, 37,25 sn, 44,1 kHz mono).
 *
 * Ölçüm yöntemi (model indirilemeyen ortamda hafif zorunlu hizalama):
 *  1. FFmpeg silencedetect (−34 dB, ≥0,12 sn) ile konuşma blokları ve duraklamalar.
 *  2. 300–3000 Hz bant enerjisinin tepe noktaları = hece çekirdekleri (Türkçede her hecede tek sesli harf).
 *  3. Blokların hece sayıları metnin hece sayılarıyla eşleştirildi; kelime başlangıçları ilgili hece
 *     çekirdeğinden alındı (± ~40 ms).
 *
 * Kayıt, yalnızca doğal duraklamaların ortasından bölünür (KLİPLER). Hız, ton, nefes ve sessizlikler
 * korunur; zaman germe (time-stretch) yok. Klipler arasına gerekli yerlerde sessizlik eklenir.
 */

/** Kayıttaki zamanlar (saniye). */
export const REC = {
  file: 'audio/dis_ses_kayit_v4.mp3',
  duration: 37.25,
  sentences: {
    s01: {start: 0.14, end: 6.12, text: 'Kahvenin o cezbedici kokusu ve tadı nasıl ortaya çıkıyor, hiç düşündün mü? İşte cevabı.'},
    s02: {start: 6.64, end: 8.92, text: 'Her şey yeşil bir çekirdekle başlar.'},
    s03: {start: 9.36, end: 11.66, text: 'İçinde, her hücrede biraz su var.'},
    s04: {start: 12.11, end: 16.0, text: 'Isıyla birlikte rengi değişir, yüzlerce aroma bileşiği oluşur.'},
    s05: {start: 16.43, end: 18.96, text: 'Isınan su buhara döner ve basınç artar.'},
    s06: {start: 19.38, end: 21.25, text: 'Yüz doksan altı derece civarında…'},
    s07: {start: 21.89, end: 25.29, text: 'Çekirdek büyür. Hacmi yüzde altmış kadar artabilir.'},
    s08: {start: 25.6, end: 29.04, text: 'Ama su ve gaz kaybıyla yüzde on beşe yakın hafifler.'},
    s09: {start: 29.44, end: 32.56, text: 'Kavurma profili, fincandaki tadı doğrudan etkiler.'},
    s10: {start: 34.16, end: 37.06, text: 'Fincandaki tat, bu dönüşümün hafızasıdır.'},
  },
  /** Görsel olaylara bağlanan kelimeler (kelimenin başladığı an, aksi belirtilmedikçe). */
  words: {
    mu: 4.61, // "hiç düşündün mü?" bitişi
    iste: 5.27,
    yesil: 7.45,
    icinde: 9.36,
    hucrede: 10.48,
    isiyla: 12.14,
    rengi: 13.01,
    aroma: 14.78,
    isinan: 16.45,
    buhara: 17.19,
    basinc: 18.2,
    yuz: 19.45,
    alti: 19.95,
    civarindaEnd: 21.25,
    buyur: 22.54,
    yuzdeAltmis: 23.77,
    ama: 25.64,
    yuzdeOnBes: 27.45,
    hafifler: 28.64,
    etkilerEnd: 32.56,
    fincandaki: 34.25,
  },
} as const;

/**
 * Klipler: kayıttan [rec0, rec1) aralığı, filmde `at` karesinden başlar.
 * Kesimler duraklamaların ortasındadır; `at` değerleri anahtar kelimeyi görsel olaya oturtur.
 */
export const CLIPS = [
  {id: 'A', rec: [0.0, 11.88], at: 0, why: 'Açılıştan hücrelere kesintisiz: "İşte cevabı" → fincan çekirdeğe döner, "yeşil" → çekirdek yeşile döner.'},
  {id: 'B', rec: [11.88, 16.22], at: 412, why: '"Isıyla" mikro→makro dönüş biterken; renk değişimi "rengi değişir" ile.'},
  {id: 'C', rec: [16.22, 19.17], at: 601, why: '"buhara döner" damlalar kabarcığa dönerken; "basınç artar" hücreler şişerken.'},
  {id: 'D', rec: [19.17, 21.57], at: 700, why: '"Yüz doksan altı" dev çekirdek ve 196°C göstergesiyle; ardından ~0,9 sn beklenti.'},
  {id: 'E', rec: [21.57, 25.45], at: 891, why: '"büyür" çekirdeğin büyümesiyle; "yüzde altmış" +%60 ile.'},
  {id: 'F', rec: [25.45, 29.24], at: 1010, why: '"yüzde on beşe" −%15 ile; "hafifler" terazinin eğilmesiyle.'},
  {id: 'G', rec: [29.24, 33.1], at: 1150, why: 'Tat bölümüne giriş; ardından ~5 sn dış sessiz izleme.'},
  {id: 'H', rec: [33.1, 37.25], at: 1388, why: '"Fincandaki tat" çekirdek fincana dönüp kapanış metni belirirken.'},
] as const;

/** Kayıttaki bir zamanı (sn) filmdeki kareye çevirir. */
export const recToFilm = (t: number) => {
  const c = CLIPS.find((k) => t >= k.rec[0] && t < k.rec[1]) ?? CLIPS[CLIPS.length - 1];
  return Math.round(c.at + (t - c.rec[0]) * 30);
};
