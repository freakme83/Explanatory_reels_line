/**
 * KOLA + V60 · İŞARET LİSTESİ
 *
 * Ekrana gelen her şey ve dış ses burada zamanı ve amacıyla bildirilir. Zaman çizelgesi gerçek dış ses
 * kaydından türetilir (recording.ts). Saf veri — Remotion'a bağlı değil.
 */
import type {Cue, FilmSpec, Voice} from '../../system/principles';
import {textSpan} from '../../system/timing';
import {REC, recToFilm} from './recording';

const at = (id: keyof typeof REC.words) => recToFilm(REC.words[id]);

/* ---------------- Ekran metni ---------------- */

export const copy = {
  sugar: {figure: '118 g', unit: 'şeker · 1 litre kolada'},
  shout: 'Kalır.',
  closing: ['Kimse *şikayetçi*', 'değil.'],
} as const;

/** Görüntülerin sahipleri (her klipte kendi hesabı; açılışta hepsi birlikte). */
export const credits = {
  c2: '@created2coffee',
  mm: '@maxmamedov.coffee',
  pp: '@pullandpourcoffee',
} as const;

/* ---------------- Zamanlama (kare, 30 fps) ---------------- */

/** Açılış: gerçek görüntü (ağır çekim) — klip sınırları. "trendimiz" → "Trying The Viral…" klibi. */
const open = {clips: [0, 45, 90, 113, 143, 177] as const};

const s3 = recToFilm(REC.sentences.s08.start) - 4;
const s4 = at('bu'); // "Bu kalabalıkta" — koltuklar belirir
const s5 = recToFilm(REC.sentences.s13.start) - 4;
const s6 = recToFilm(REC.sentences.s17.start) - 6;
const s7 = recToFilm(REC.sentences.s18.start) - 6;
const s8 = recToFilm(REC.sentences.s20.start) - 18;
const fin = recToFilm(REC.sentences.s22.start) - 6;

const sugarFig = {in: at('yaklasik'), landed: at('yaklasik') + 22, out: s4 - 2};
const closing = textSpan(at('kimse') - 4, copy.closing, {final: true});
const total = Math.max(closing.out, at('degilEnd') + 24);

export const B = {
  total,
  open,
  v60: {start: open.clips[5], draw: at('bilim'), wipe: at('bilim') + 16, foam: at('heyecanli'), dive: at('heyecanli') + 30, diveEnd: at('heyecanli') + 62},
  particle: {start: at('heyecanli') + 30, puruzlu: at('puruzlu'), ideal: at('ideal'), kavurmadan: at('kavurmadan'), exit: s3, seker: at('seker118'), end: s4},
  sugarFig,
  bus: {start: s4, end: s5},
  diff: {start: s5, kafTag: at('kolada'), slowFrom: at('soguk'), slowTo: at('yavas'), end: s6},
  compare: {start: s6, hot: at('sicak'), end: s7},
  refr: {start: s7, drop: at('olcelim') + 12, count: at('refraktometresi'), stop: at('sanior'), exit: at('tadina'), end: s8},
  taste: {start: s8, seker: at('seker'), bastirir: at('bastirir'), vanilya: at('vanilya'), kavrulmus: at('kavrulmus'), end: fin},
  final: {start: fin, clip2: fin + 77, inset: at('kimse') - 14, insetEnd: at('kimse') + 12, text: closing},
};

/** Sahne 4'ün "Kalır." karesi kayıttaki "Kalır." ile aynı kareye düşmeli (C klibi buna göre yerleşti). */
const ANSWER = 86;
if (Math.abs(B.bus.start + ANSWER - at('kalir')) > 1) throw new Error(`"Kalır." kayması: ${B.bus.start + ANSWER} ≠ ${at('kalir')}`);

/* ---------------- Dış ses: gerçek kayıttan ---------------- */

export const voice: Voice[] = Object.entries(REC.sentences).map(([id, s]) => ({id, in: recToFilm(s.start), out: recToFilm(s.end), text: s.text}));
export const voiceIsRecording = true;

/* ---------------- İşaret listesi ---------------- */

const j = (l: ReadonlyArray<string>) => l.join(' ');
const v = B.v60;
const p = B.particle;

export const cues: Cue[] = [
  {id: 'footage-open', kind: 'illustration', idea: 'açılış', in: 0, landed: 0, out: v.wipe,
    purpose: 'Gerçek görüntü: kolanın V60\'a döküldüğü viral videolar. İzleyici trendi tanır, köpürmeyi kendi gözüyle görür.'},
  {id: 'credits-open', kind: 'data', idea: 'açılış', in: 6, landed: 18, out: open.clips[5],
    purpose: 'Görüntülerin sahipleri: kullanılan videoların hesap adları.'},
  {id: 'photo-to-ink', kind: 'transition', idea: 'geçiş', in: v.draw, landed: v.wipe + 36, out: v.wipe + 36,
    purpose: '"Arkasındaki bilim": mürekkep çizgisi V60\'ı izler, fotoğraf kâğıda döner; gerçekten açıklamaya geçiş.'},
  {id: 'v60-foam', kind: 'illustration', idea: 'köpük', in: v.wipe, landed: v.foam, out: v.diveEnd,
    purpose: 'Çizilmiş V60: yatak köpürür, kabarcıklar patlar ("Kahve neden heyecanlı görünüyor?").'},
  {id: 'dive', kind: 'transition', idea: 'geçiş', in: v.dive, landed: v.diveEnd, out: v.diveEnd,
    purpose: 'Tek bir kabarcığın içine dalış: makrodan tek kahve parçacığına.'},
  {id: 'particle', kind: 'subject', idea: '*', in: p.start, landed: v.diveEnd, out: p.exit + 50,
    purpose: 'Kahraman: tek öğütülmüş kahve parçacığı; Kavurma\'daki petek hücreleri içinde.'},
  {id: 'nucleation', kind: 'data', idea: 'köpük', in: v.diveEnd, landed: p.puruzlu, out: p.exit,
    purpose: 'Koladaki çözünmüş gaz pürüzlü çukurlara toplanır, kabarcık olup kopar; "ideal" ile çukurların hepsi çalışır.'},
  {id: 'roast-gas', kind: 'data', idea: 'köpük', in: p.kavurmadan, landed: p.kavurmadan + 20, out: p.exit,
    purpose: 'İkinci kaynak: kavurmadan hücrelerde kalan gaz içeriden çıkar (serinin bağı).'},
  {id: 'crowd', kind: 'illustration', idea: 'şeker', in: p.exit, landed: p.exit + 50, out: s4,
    purpose: 'Parçacık çekilir, kola şeker molekülleriyle dolar: kalabalık hissi.'},
  {id: 'sugar-figure', kind: 'figure', idea: 'şeker', ...sugarFig, text: copy.sugar.figure,
    purpose: 'Şeker miktarı: kalabalığın sayısal karşılığı (birimiyle birlikte).'},
  {id: 'bus', kind: 'illustration', idea: 'otobüs', in: s4, landed: s4 + 58, out: s5,
    purpose: 'Dolu otobüs sezgisi: koltuklar dolar, kapı kahve aromasının yüzüne kapanır; "Kalır." ile koltuklar suya erir.'},
  {id: 'shout', kind: 'shout', idea: 'otobüs', in: s4 + ANSWER, landed: s4 + ANSWER + 12, out: s4 + 136, text: copy.shout, accent: true,
    purpose: 'Cevap: filmin tek vurgu anı.'},
  {id: 'diff', kind: 'illustration', idea: 'fark', in: s5, landed: s5 + 24, out: s6,
    purpose: 'Fark: kahveye özgü bileşikler bol akar; kafein seyrek, kolada zaten var. "Soğuk" ile her şey yavaşlar.'},
  {id: 'diff-tags', kind: 'data', idea: 'fark', in: s5, landed: s5 + 24, out: s6,
    purpose: 'Hangi tarafın kahve, hangisinin kola olduğunu ve koladaki kafeini adlandırır.'},
  {id: 'compare', kind: 'illustration', idea: 'hız', in: s6, landed: s6 + 18, out: s7,
    purpose: 'Sıcak su ile kola yan yana: aynı sürede sıcak suda çok daha fazla bileşik çıkar.'},
  {id: 'refractometer', kind: 'illustration', idea: 'ölçüm', in: s7, landed: s7 + 20, out: B.refr.end,
    purpose: 'Refraktometre damlayı okur; sayı kahve aralığını geçip şekerle birlikte saçma bir değere tırmanır.'},
  {id: 'taste-lines', kind: 'illustration', idea: 'tat', in: s8, landed: B.taste.bastirir, out: B.taste.vanilya + 10,
    purpose: 'Keskin acılık çizgisi, şekerin yumuşak dalgasıyla törpülenir.'},
  {id: 'taste-pair', kind: 'illustration', idea: 'tat', in: B.taste.vanilya, landed: B.taste.kavrulmus + 30, out: fin,
    purpose: 'Vanilya ve kavrulmuş kahve: iki aroma birbirine sarılır.'},
  {id: 'footage-final', kind: 'illustration', idea: 'kapanış', in: fin, landed: fin, out: total,
    purpose: 'Gerçek tadım görüntüsüne dönüş: yüzlerdeki ifade; son anda kâğıda basılmış bir fotoğrafa küçülür.'},
  {id: 'closing', kind: 'statement', idea: 'kapanış', ...closing, out: total, text: j(copy.closing), final: true,
    purpose: 'Sonuç: ölçülmesi zor ama içen memnun.'},
];

export const spec: FilmSpec = {totalFrames: total, minSeconds: 55, maxSeconds: 66};

/** Harf ölçümü için filmdeki her metin, rolüyle. */
export const allText: {role: 'statement' | 'word' | 'figure' | 'shout' | 'unit'; text: string}[] = [
  ...copy.closing.map((text) => ({role: 'statement' as const, text})),
  {role: 'figure', text: copy.sugar.figure},
  {role: 'shout', text: copy.shout},
  {role: 'unit', text: copy.sugar.unit},
];
