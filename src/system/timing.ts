/**
 * SİSTEM — zamanlama (saf, Remotion'dan bağımsız)
 *
 * İki süre birbirinden ayrıdır:
 *   1. ANİMASYON süresi: metnin dizilmesi (giriş) — `landed` karesinde biter.
 *   2. OKUMA süresi: metin TAMAMEN göründükten sonra sabit kaldığı süre.
 * Okuma süresi, animasyon bittikten sonra başlar; kelime sayısına göre hesaplanır.
 */
export const FPS = 30;

export const textMotion = {
  /** Bir satırın dizilme süresi. */
  set: 22,
  /** Tek kelimelik bilgi için daha kısa dizilme. */
  setWord: 14,
  /** Satırlar arası gecikme. */
  step: 6,
  /** Çıkış süresi. */
  exit: 14,
} as const;

/** Okuma süresi (kare): 0,8 sn + kelime başına 0,2 sn; en az 1 sn. */
export const readHold = (words: number) => Math.max(30, Math.round(FPS * (0.8 + 0.2 * words)));
/** Filmin son cümlesi tamamen göründükten sonra en az 2,5 sn kalır. */
export const FINAL_HOLD = 75;

export const countWords = (s: string) => s.replace(/\*/g, '').trim().split(/\s+/).filter(Boolean).length;
export const countItalicWords = (s: string) => (s.match(/\*(.+?)\*/g) ?? []).reduce((n, m) => n + countWords(m), 0);

/** Türkçede her hece tam bir sesli harf içerir: hece sayısı = sesli harf sayısı. */
export const syllables = (s: string) => (s.match(/[aeıioöuüâîûAEIİOÖUÜÂÎÛ]/g) ?? []).length;

/** Sakin, editoryal bir anlatım hızı üst sınırı (hece/sn). */
export const MAX_SYLLABLES_PER_SECOND = 5.6;

/** Metin işareti için giriş, oturma ve çıkış karelerini hesaplar. */
export const textSpan = (start: number, lines: ReadonlyArray<string>, opts?: {final?: boolean; word?: boolean; extraHold?: number}) => {
  const set = opts?.word ? textMotion.setWord : textMotion.set;
  const landed = start + (lines.length - 1) * textMotion.step + set;
  const words = countWords(lines.join(' '));
  const hold = Math.max(readHold(words), opts?.final ? FINAL_HOLD : 0) + (opts?.extraHold ?? 0);
  return {in: start, landed, out: landed + hold};
};
