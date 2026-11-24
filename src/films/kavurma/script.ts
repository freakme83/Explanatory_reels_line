/**
 * REFERANS FİLM — "Kavurma" · İŞARET LİSTESİ
 *
 * Ekrana gelen her şey ve dış ses, burada zamanı ve amacıyla bildirilir.
 * Metin işaretlerinin oturma ve çıkış kareleri `textSpan` ile hesaplanır:
 * animasyon süresi ile okuma süresi ayrıdır; okuma, metin tamamen göründükten sonra başlar.
 *
 * Saf veri — Remotion'a bağlı değil.
 */
import {monotone, solve, type Pt} from '../../system/data';
import type {Cue, FilmSpec, Voice} from '../../system/principles';
import {REC, recToFilm} from './recording';
import {textSpan} from '../../system/timing';

/* ---------------- Veri (yaklaşık; doğruluk notu: src/films/kavurma/README.md) ---------------- */

/** Temsili kavurma eğrisi: çekirdek sıcaklığı (°C) / dakika. */
const curve: ReadonlyArray<Pt> = [
  [0, 25], [1, 68], [2, 98], [3, 121], [4, 139], [5, 153], [6, 165],
  [7, 176], [8, 185], [9, 192], [10, 198], [11, 204], [12, 209],
];
export const tempAt = monotone(curve);
export const crackMinute = solve(tempAt, 196, 0, 12);

/** Kavurma öncesi = 1. Orta kavurma için literatürdeki aralıkların orta değerleri. */
export const change = {volume: 1.6, mass: 0.85};

/** Tat bölümü: kavurma derecesinin temsili çekirdek sıcaklıkları (renk için). */
export const tasteLevels = [
  {temp: 186, word: 'meyvemsi'},
  {temp: 207, word: 'karamelimsi'},
  {temp: 229, word: 'acımsı'},
] as const;
/** Fincandaki kahvenin rengi = koyu kavrulmuş çekirdek rengi. */
export const COFFEE_TEMP = 224;

/* ---------------- Ekran metni ---------------- */

export const copy = {
  question: ['Bu koku, bu tat', 'nereden geliyor?'],
  cells: ['Her hücrede', 'biraz su.'],
  vapor: ['Isınan su', '*buhara* döner.'],
  shout: 'Çat.',
  volume: {figure: '+%60', unit: 'hacim'},
  weight: {figure: '−%15', unit: 'ağırlık'},
  closing: ['Fincandaki tat,', 'bu dönüşümün', '*hafızasıdır*.'],
} as const;

/* ---------------- Zamanlama (kare, 30 fps) ----------------
 * V5: zaman çizelgesi GERÇEK SES KAYDINDAN türetilir (recording.ts).
 * Kayıttaki kelime zamanları → film karesi; görsel olaylar bu karelere oturtulur.
 */
const at = (id: keyof typeof REC.words) => recToFilm(REC.words[id]);

/** Isınma bölümü 9. dakikada (~192°C) biter; 196°C eşiği çatlamadan hemen önce, dış sesle birlikte gösterilir. */
export const HEAT_END_MINUTE = 9;

const question = {in: 0, landed: 0, out: at('mu') + 4};
const morph = at('iste') - 18;
const cellsText = textSpan(at('hucrede') - 2, copy.cells);
const heatStart = at('isiyla') + 4;
const vaporText = textSpan(at('isinan') + 4, copy.vapor);
const snapEnd = at('yuz');
const crackAt = at('civarindaEnd') + 28; // ~0,9 sn beklenti boşluğu
const preFigure = {in: snapEnd - 4, landed: at('alti') + 2, out: crackAt - 18};
const grow = at('buyur') - 2;
const volFig = at('yuzdeAltmis') - 3;
const tilt = at('hafifler') - 6;
const wFig = at('yuzdeOnBes') - 2;
const tasteMove = recToFilm(REC.sentences.s09.start) - 6;
const w1 = at('etkilerEnd') - 16;
const words = [w1, w1 + 58, w1 + 116].map((s) => textSpan(s, ['x'], {word: true}));
const closeMorph = words[2].out;
const closing = textSpan(at('fincandaki') - 2, copy.closing, {final: true});
const total = Math.max(closing.out, recToFilm(REC.sentences.s10.end) + 24);

export const B = {
  total,
  open: {pushEnd: morph, q: question, morph, morphEnd: morph + 40, rewindEnd: at('yesil') + 4},
  zoomIn1: {start: at('yesil') + 14, end: at('icinde') - 2},
  cells: {water: at('hucrede') - 6, text: cellsText},
  zoomOut1: {start: cellsText.out - 2, end: heatStart},
  heat: {figIn: heatStart - 4, start: heatStart, end: heatStart + 108, figOut: heatStart + 144, printsOut: heatStart + 138},
  zoomIn2: {start: heatStart + 148, end: at('isinan') + 2},
  vapor: {start: at('isinan') + 2, end: at('buhara') + 26, text: vaporText, pressureStart: at('buhara') + 6},
  snap: {start: snapEnd - 22, end: snapEnd},
  preFigure,
  crack: {at: crackAt, shoutOut: crackAt + 48},
  split: {at: crackAt + 54},
  volume: {ghost: crackAt + 86, roast: grow - 22, grow, figIn: volFig, figOut: volFig + 22 + 36},
  weight: {move: at('ama') - 4, beam: at('ama') + 2, tilt, figIn: wFig, figOut: wFig + 22 + 40, exit: Math.max(wFig + 66, tilt + 46)},
  taste: {move: tasteMove, moveEnd: tasteMove + 26, words},
  close: {morph: closeMorph, morphEnd: closeMorph + 40, text: closing},
};

/* ---------------- Dış ses: gerçek kayıttan ---------------- */

export const voice: Voice[] = Object.entries(REC.sentences).map(([id, s]) => ({
  id,
  in: recToFilm(s.start),
  out: recToFilm(s.end),
  text: s.text,
}));

/* ---------------- İşaret listesi ---------------- */

const j = (l: ReadonlyArray<string>) => l.join(' ');

export const cues: Cue[] = [
  {id: 'cup', kind: 'illustration', idea: 'açılış', in: 0, landed: 0, out: B.open.morphEnd,
    purpose: 'Buz mavisi zeminde büyük fincan: akışta dikkat çeker, izleyicinin bildiği deneyimden başlar.'},
  {id: 'question', kind: 'statement', idea: 'açılış', ...question, text: j(copy.question),
    purpose: 'Filmin sorusu: koku ve tadın kaynağını merak ettirir.'},
  {id: 'bean', kind: 'subject', idea: '*', in: B.open.morph, landed: B.open.morphEnd, out: B.split.at + 8,
    purpose: 'Kahraman: fincandaki kahve yüzeyi çekirdeğe dönüşür; renk, iç yapı ve ölçek anlatıyla değişir.'},
  {id: 'morph', kind: 'transition', idea: 'geçiş', in: B.open.morph, landed: B.open.morphEnd, out: B.open.morphEnd,
    purpose: 'Fincandaki kahve, kavrulmuş çekirdeğin şekline döner: tat nereden geliyorsa oraya.'},
  {id: 'rewind', kind: 'transition', idea: 'geçiş', in: B.open.morphEnd, landed: B.open.rewindEnd, out: B.open.rewindEnd,
    purpose: 'Zaman geri sarılır: kavrulmuş çekirdek küçülüp yeşile döner; hikâye başa döner.'},
  {id: 'zoom-in-1', kind: 'transition', idea: 'geçiş', in: B.zoomIn1.start, landed: B.zoomIn1.end, out: B.zoomIn1.end,
    purpose: 'Makrodan mikroya: yüzey dokusu hücrelere ayrışır.'},
  {id: 'water', kind: 'data', idea: 'hücre', in: B.cells.water, landed: B.cells.water + 40, out: cellsText.out,
    purpose: 'Her hücrede beliren mavi damla: çekirdeğin içinde su olduğunu gösterir.'},
  {id: 'cells-text', kind: 'statement', idea: 'hücre', ...cellsText, text: j(copy.cells),
    purpose: 'Görüntüdeki mavi damlaların ne olduğunu söyler.'},
  {id: 'zoom-out-1', kind: 'transition', idea: 'geçiş', in: B.zoomOut1.start, landed: B.zoomOut1.end, out: B.zoomOut1.end,
    purpose: 'Mikrodan makroya: hücreler küçülüp çekirdeğin dokusuna karışır; ısınma bütün çekirdekte izlenir.'},
  {id: 'temperature', kind: 'figure', idea: 'ısı', in: B.heat.figIn, landed: B.heat.end, out: B.heat.figOut, text: '192°C',
    purpose: 'Sıcaklık: rengin neden değiştiğini sayıyla söyler; eşiğe yaklaşır.'},
  {id: 'prints', kind: 'data', idea: 'ısı', in: B.heat.start, landed: B.heat.end, out: B.heat.printsOut,
    purpose: 'Her dakika bırakılan renk izi: dönüşümün zaman içindeki seyri.'},
  {id: 'zoom-in-2', kind: 'transition', idea: 'geçiş', in: B.zoomIn2.start, landed: B.zoomIn2.end, out: B.zoomIn2.end,
    purpose: 'Aynı hücrelere dönüş: ısınmış hâllerini ilk görüntüyle kıyaslatır.'},
  {id: 'vapor', kind: 'data', idea: 'buhar', in: B.vapor.start, landed: B.vapor.end, out: B.snap.start,
    purpose: 'Damlalar kabarcığa döner, hücreler şişer: buhar basıncının birikmesi.'},
  {id: 'vapor-text', kind: 'statement', idea: 'buhar', ...vaporText, text: j(copy.vapor),
    purpose: 'Kabarcıkların ne olduğunu söyler.'},
  {id: 'pre-crack-figure', kind: 'figure', idea: 'eşik', in: B.preFigure.in, landed: B.preFigure.landed, out: B.preFigure.out, text: '196°C',
    purpose: 'Dış ses "yüz doksan altı derece civarında" derken sıcaklık eşiğe ulaşır: çatlamanın habercisi.'},
  {id: 'snap', kind: 'transition', idea: 'geçiş', in: B.snap.start, landed: B.snap.end, out: B.snap.end,
    purpose: 'Ani geri çekiliş: basıncın bütün çekirdekte patlayacağı anı dev ölçekte göstermek için.'},
  {id: 'shout', kind: 'shout', idea: 'çatlama', in: B.crack.at, landed: B.crack.at + 12, out: B.crack.shoutOut, text: copy.shout, accent: true,
    purpose: 'Birinci çatlamanın sesi: filmin tek vurgu anı.'},
  {id: 'split', kind: 'transition', idea: 'geçiş', in: B.split.at, landed: B.split.at + 36, out: B.split.at + 36,
    purpose: 'Çatlak bütün kadraja yayılır ve sonucu açığa çıkarır.'},
  {id: 'volume-beans', kind: 'illustration', idea: 'hacim', in: B.volume.ghost, landed: B.volume.grow + 24, out: B.weight.move,
    purpose: 'Yeşil çekirdeğin dış hattı, kavrulmuş çekirdeğin üstünde: büyümeyi doğrudan gösterir.'},
  {id: 'volume-figure', kind: 'figure', idea: 'hacim', in: B.volume.figIn, landed: B.volume.figIn + 22, out: B.volume.figOut,
    text: `${copy.volume.figure} ${copy.volume.unit}`, purpose: 'Büyümenin yaklaşık miktarı.'},
  {id: 'balance', kind: 'illustration', idea: 'ağırlık', in: B.weight.move, landed: B.weight.tilt + 16, out: B.weight.exit,
    purpose: 'Terazi: büyüyen çekirdeğin yine de daha hafif olduğunu gösterir.'},
  {id: 'weight-figure', kind: 'figure', idea: 'ağırlık', in: B.weight.figIn, landed: B.weight.figIn + 22, out: B.weight.figOut,
    text: `${copy.weight.figure} ${copy.weight.unit}`, purpose: 'Hafiflemenin yaklaşık miktarı.'},
  {id: 'taste-bean', kind: 'illustration', idea: 'tat', in: B.taste.move, landed: B.taste.moveEnd, out: B.close.morph,
    purpose: 'Tek çekirdek açıktan koyuya kavrulur: kavurma derecesinin tadı nasıl yönlendirdiğini gösterir.'},
  ...tasteLevels.map(
    (l, i): Cue => ({id: `taste-${i + 1}`, kind: 'word', idea: 'tat', ...words[i], text: l.word,
      purpose: 'Bu kavurma derecesinde fincanda öne çıkma eğiliminde olan tat (genel eğilim).'}),
  ),
  {id: 'closing-cup', kind: 'illustration', idea: 'kapanış', in: B.close.morph, landed: B.close.morphEnd, out: closing.out,
    purpose: 'Çekirdek yeniden fincana, zemin buz mavisine döner: anlatı başladığı noktaya kapanır.'},
  {id: 'closing', kind: 'statement', idea: 'kapanış', ...closing, text: j(copy.closing), final: true,
    purpose: 'Bilgiyi fincana bağlar: izlenen dönüşümün neden önemli olduğu.'},
];

/** Kullanıcı onayı: doğal anlatım için 45 sn'yi birkaç saniye aşmak kabul edilebilir. */
/** Dış ses gerçek bir kayıt: hece/sn yalnızca bilgi olarak raporlanır, hata sayılmaz. */
export const voiceIsRecording = true;

export const spec: FilmSpec = {totalFrames: B.total, minSeconds: 44, maxSeconds: 52};

/** Harf ölçümü için filmdeki her metin, rolüyle. */
export const allText: {role: 'statement' | 'word' | 'figure' | 'shout' | 'unit'; text: string}[] = [
  ...[copy.question, copy.cells, copy.vapor, copy.closing].flat().map((text) => ({role: 'statement' as const, text})),
  ...tasteLevels.map((l) => ({role: 'word' as const, text: l.word})),
  ...['25°C', '196°C', '188°C', copy.volume.figure, copy.weight.figure].map((text) => ({role: 'figure' as const, text})),
  {role: 'shout', text: copy.shout},
  {role: 'unit', text: copy.volume.unit},
  {role: 'unit', text: copy.weight.unit},
];
