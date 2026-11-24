/**
 * SİSTEM — belirteçler
 *
 * Notlar:
 * - İtalik artık bir satır stili değil, satır içi kısa bir VURGU'dur (`emphasis`).
 *   Cümleler, sayılar ve öğretici ifadeler düz (roman) dizilir.
 * - Seramik rengi (fincan) ve koyu kavurma uçları eklendi.
 * - Künye, folyo, ayraç, bölüm etiketi, kalıcı gösterge için belirteç YOKTUR.
 */
export const canvas = {width: 1080, height: 1920, fps: 30} as const;
export const center = {x: canvas.width / 2, y: canvas.height / 2} as const;

/** Reels arayüzünün kapattığı bölgeler; anlam taşıyan metin buraya giremez. */
export const safe = {top: 250, bottom: 400, side: 96, rightLower: 150} as const;
export const margin = 96;
/** Metnin kullanabileceği en geniş satır (px). */
export const measure = canvas.width - margin * 2;

/* ---------------- Renk ---------------- */

export const color = {
  paper: '#F4EFE6',
  cream: '#ECE2CF',
  sand: '#E9D6BA',
  blue: '#D5E0E6',
  ceramic: '#FBF8F2',
  ink: '#1D1916',
  inkSoft: '#655C52',
  accent: '#BF4329', // film başına bir kez
  water: '#4F7A93',
  crease: '#2A170D',
} as const;

/** Veri rengi: çekirdek sıcaklığı (°C) → çekirdek rengi. 225+ koyu kavurma. */
export const roastScale: ReadonlyArray<readonly [number, string]> = [
  [25, '#A3A87C'],
  [110, '#B1B07B'],
  [140, '#CDB86C'],
  [155, '#D8B45E'],
  [170, '#C68C4D'],
  [185, '#A46C3B'],
  [196, '#865532'],
  [210, '#5F3C25'],
  [225, '#43291A'],
  [235, '#2F1D13'],
];

/* ---------------- Tipografi ----------------
 * Düz form varsayılandır. İtalik yalnızca `emphasis` ile, metin başına en çok bir kelimede.
 */
export const font = {
  serif: '"KT Fraunces", Georgia, serif',
  sans: '"KT Schibsted", "Helvetica Neue", Arial, sans-serif',
} as const;

const fr = (opsz: number, soft: number, wonk: 0 | 1) => `"opsz" ${opsz}, "SOFT" ${soft}, "WONK" ${wonk}`;

export const type = {
  /** Anlatım cümlesi. */
  statement: {
    fontFamily: font.serif,
    fontSize: 104,
    fontWeight: 380,
    lineHeight: 1.04,
    letterSpacing: '-0.025em',
    fontVariationSettings: fr(144, 20, 0),
  },
  /** Tek kelimelik bilgi (ör. tat eğilimi). */
  word: {
    fontFamily: font.serif,
    fontSize: 92,
    fontWeight: 380,
    lineHeight: 1.04,
    letterSpacing: '-0.02em',
    fontVariationSettings: fr(144, 20, 0),
  },
  /** Tek bir sayı = tek bir bilgi. Düz form. */
  figure: {
    fontFamily: font.serif,
    fontSize: 236,
    fontWeight: 320,
    lineHeight: 1,
    letterSpacing: '-0.035em',
    fontVariationSettings: fr(144, 30, 0),
  },
  /** Olayın sesi: filmde en fazla bir kez; tek italik büyük an. */
  shout: {
    fontFamily: font.serif,
    fontStyle: 'italic' as const,
    fontSize: 320,
    fontWeight: 520,
    lineHeight: 1,
    letterSpacing: '-0.04em',
    fontVariationSettings: fr(144, 100, 1),
  },
  /** Bir sayının neyi ölçtüğü — tek kelime. */
  unit: {
    fontFamily: font.sans,
    fontSize: 42,
    fontWeight: 520,
    lineHeight: 1.2,
    letterSpacing: '0',
  },
} as const;

/** Satır içi vurgu: italik, biraz daha yumuşak. Cümle başına en çok bir kelime. */
export const emphasis = {
  fontStyle: 'italic' as const,
  fontWeight: 360,
  fontVariationSettings: fr(144, 60, 1),
} as const;

export type Role = keyof typeof type;

/* ---------------- İllüstrasyon ---------------- */

export const misregister = {x: 9, y: 7} as const;
export const brush = {min: 3, max: 7.5} as const;
