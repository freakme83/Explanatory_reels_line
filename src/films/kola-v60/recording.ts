/**
 * KOLA + V60 — DIŞ SES KAYDI: ölçülen zamanlar ve film üzerindeki yerleşim
 *
 * Kaynak: audio/vo/kola-v60.mp3 (ElevenLabs, kullanıcının kendi ses klonu; 60,9 sn, 44,1 kHz mono).
 * Kişisel ses klonuyla üretildiği için depoya girmez (.gitignore); yeniden üretmek için README'ye bakın.
 *
 * Zamanlar: kelime düzeyinde zaman damgaları (kelimeler.json, metne zorlamalı hizalama) ve FFmpeg silencedetect
 * duraklamalarıyla çapraz doğrulandı (her cümle sınırı bir duraklamaya düşüyor, ±40 ms).
 *
 * Kayıt yalnızca doğal duraklamaların ortasından bölünür (KLİPLER). Hız, ton ve nefes korunur; germe yok.
 */

/** Kayıttaki cümleler (saniye). */
export const REC = {
  file: 'audio/vo/kola-v60.mp3',
  duration: 60.92,
  sentences: {
    s01: {start: 0.16, end: 2.72, text: 'Sıcak su yerine kolayla kahve demlemek?'},
    s02: {start: 3.12, end: 4.96, text: 'Belli ki yeni bir trendimiz var.'},
    s03: {start: 5.2, end: 8.56, text: 'Arkasındaki bilim oldukça ilginç, belki de saçma.'},
    s04: {start: 9.04, end: 10.88, text: 'Kahve neden heyecanlı görünüyor?'},
    s05: {start: 11.36, end: 14.64, text: 'Kolanın gazı kabarcık olmak için pürüzlü bir yüzey arar.'},
    s06: {start: 15.04, end: 17.52, text: 'Öğütülmüş kahvenin yüzeyi bunun için ideal.'},
    s07: {start: 17.84, end: 20.08, text: 'Üstüne bir de kavurmadan kalan gaz var.'},
    s08: {start: 20.48, end: 24.16, text: 'Bir litre vanilyalı kolada yaklaşık 118 gram şeker var.'},
    s09: {start: 24.48, end: 26.72, text: 'Bu kalabalıkta kahveye yer kalır mı?'},
    s10: {start: 26.96, end: 27.36, text: 'Kalır.'},
    s11: {start: 27.68, end: 29.12, text: 'Suyun koltuk sayısı yok.'},
    s12: {start: 29.28, end: 31.36, text: 'Her maddenin çözünme sınırı farklı.'},
    s13: {start: 31.52, end: 33.92, text: 'Kahvedeki pek çok bileşik kolaya geçer.'},
    s14: {start: 34.08, end: 35.76, text: 'Kafeinin işi biraz farklı.'},
    s15: {start: 35.92, end: 37.52, text: 'Kolada zaten kafein var.'},
    s16: {start: 37.68, end: 41.44, text: 'Ama soğuk ve şekerli kolada moleküller daha yavaş hareket eder.'},
    s17: {start: 41.6, end: 45.04, text: 'Kahvenin sıcak suyla yapılan demleme kadar çözünmesi çok zor.'},
    s18: {start: 45.28, end: 49.04, text: 'Ölçelim desen, kahve refraktometresi şekeri de kahve sanıyor.'},
    s19: {start: 49.2, end: 50.6, text: 'En iyisi tadına bakmak.'},
    s20: {start: 50.8, end: 52.24, text: 'Şeker acılığı bastırır.'},
    s21: {start: 52.4, end: 55.64, text: 'Vanilya da kavrulmuş kahve aromalarıyla iyi anlaşabilir.'},
    s22: {start: 55.92, end: 57.4, text: 'Az demlenmiş olabilir.'},
    s23: {start: 57.6, end: 60.96, text: 'Yüzlerdeki ifadeye bakılırsa, kimse şikayetçi değil.'},
  },
  /** Görsel olaylara bağlanan kelimeler (kelimenin başladığı an). */
  words: {
    trendimiz: 3.92,
    bilim: 5.92,
    heyecanli: 9.84,
    kabarcik: 12.16,
    puruzlu: 13.36,
    ogutulmus: 15.04,
    ideal: 17.04,
    kavurmadan: 18.64,
    bir118: 20.48,
    yaklasik: 22.0,
    seker118: 23.52,
    bu: 24.48,
    mi: 26.4,
    miEnd: 26.72,
    kalir: 26.96,
    suyun: 27.68,
    her: 29.28,
    kahvedeki: 31.52,
    kafeinin: 34.08,
    kolada: 35.92,
    ama: 37.68,
    soguk: 38.0,
    yavas: 40.36,
    kahvenin: 41.6,
    sicak: 42.16,
    zor: 44.72,
    olcelim: 45.28,
    refraktometresi: 46.64,
    sekeri: 47.6,
    sanior: 48.52,
    tadina: 49.64,
    seker: 50.8,
    bastirir: 51.6,
    vanilya: 52.4,
    kavrulmus: 52.96,
    az: 55.92,
    yuzlerdeki: 57.6,
    kimse: 59.44,
    degilEnd: 60.96,
  },
} as const;

/**
 * Klipler: kayıttan [rec0, rec1) aralığı, filmde `at` karesinden başlar.
 * Kesimler duraklamaların ortasındadır; eklenen sessizlikler anlatı içindir.
 */
export const CLIPS = [
  {id: 'A', rec: [0.0, 11.05], at: 0, why: 'Gerçek görüntü + çizime geçiş; "heyecanlı" köpüren yatakla.'},
  {id: 'B', rec: [11.05, 26.85], at: 344, why: '+0,4 sn: kabarcığın içine dalış. "pürüzlü" çukurlarda kabarcık, "118" şeker kalabalığı, "kalır mı" kapı.'},
  {id: 'C', rec: [26.85, 55.75], at: 829, why: '+0,4 sn sessizlik: kapı kapanır, "Kalır." gelir (Sahne 4 cevap karesi).'},
  {id: 'D', rec: [55.75, 60.92], at: 1705, why: '+0,3 sn: gerçek tadım görüntüsüne dönüş.'},
] as const;

/** Kayıttaki bir zamanı (sn) filmdeki kareye çevirir. */
export const recToFilm = (t: number) => {
  const c = CLIPS.find((k) => t >= k.rec[0] && t < k.rec[1]) ?? CLIPS[CLIPS.length - 1];
  return Math.round(c.at + (t - c.rec[0]) * 30);
};
