/**
 * SİSTEM — ilkeler, kod olarak
 *
 * Temel ilke: Ekrandaki her unsur o anda anlatılan bilgiye doğrudan hizmet eder
 * ve görevini bitirince ekrandan ayrılır.
 *
 * Ayrıca:
 * - Okuma süresi animasyondan ayrı denetlenir (metin tamamen göründükten sonra sayılır).
 * - Final cümlesi tamamen göründükten sonra en az 2,5 sn kalır.
 * - İtalik metin başına en çok bir kelime; sayı ve birimlerde italik yok.
 * - Dış ses (voice) satırları işaret listesinde yer alır; hızları hece/sn ile denetlenir.
 *
 * Saf veri; Remotion'a bağlı değil.
 */
import {FINAL_HOLD, MAX_SYLLABLES_PER_SECOND, countItalicWords, countWords, readHold, syllables} from './timing';

export type CueKind = 'subject' | 'statement' | 'word' | 'figure' | 'shout' | 'illustration' | 'data' | 'transition';

export type Cue = {
  id: string;
  kind: CueKind;
  idea: string;
  in: number;
  landed: number;
  out: number;
  purpose: string;
  /** Ekrandaki metin; *yıldız* = italik vurgu. */
  text?: string;
  accent?: boolean;
  /** Filmin son cümlesi: tamamen göründükten sonra en az 2,5 sn. Çıkışı film sonu olabilir. */
  final?: boolean;
};

/** Dış ses satırı. Ekran metni bunun kısaltılmış hâli olabilir. */
export type Voice = {id: string; in: number; out: number; text: string};

export type FilmSpec = {totalFrames: number; minSeconds: number; maxSeconds: number; fps?: number};

export const rules = {
  maxWords: 6,
  maxItalicWords: 1,
  maxTextAtOnce: 1,
  maxIdeasAtOnce: 1,
  minDigest: 30,
  maxLifetimeRatio: 0.25,
  maxAccentUses: 1,
  maxShouts: 1,
  maxSyllablesPerSecond: MAX_SYLLABLES_PER_SECOND,
} as const;

export const forbidden = [
  'Üst künye / yayın adı (masthead)',
  'Bölüm ibaresi, kategori etiketi',
  'Yatay ayırıcı çizgiler',
  'Bölüm başlıkları, Roma rakamları',
  'Sayfa numarası',
  'Kalıcı alt bilgi şeridi',
  'Sürekli görünen süre/sıcaklık göstergeleri',
  'Dekoratif etiket, rozet, yayın künyesi',
  'Gradyan, parlama (glow), kart kutuları',
  'Kıvrımlı dekoratif kahve buharı / duman',
  'Süzülme, nefes alma gibi amaçsız döngü hareketleri',
] as const;

const TEXT_KINDS: CueKind[] = ['statement', 'word', 'figure', 'shout'];
export const alive = (c: Cue, f: number) => f >= c.in && f < c.out;

export const validate = (cues: ReadonlyArray<Cue>, voice: ReadonlyArray<Voice>, spec: FilmSpec): string[] => {
  const fps = spec.fps ?? 30;
  const total = spec.totalFrames;
  const errs: string[] = [];
  const secs = total / fps;
  if (secs < spec.minSeconds || secs > spec.maxSeconds) errs.push(`Süre ${secs.toFixed(1)} sn; ${spec.minSeconds}–${spec.maxSeconds} sn olmalı.`);

  const ids = new Set<string>();
  for (const c of cues) {
    if (ids.has(c.id)) errs.push(`[${c.id}] kimlik tekrarı.`);
    ids.add(c.id);
    if (!c.purpose || c.purpose.length < 12) errs.push(`[${c.id}] amacı yazılmamış.`);
    if (!(c.in <= c.landed && c.landed <= c.out)) errs.push(`[${c.id}] giriş ≤ oturma ≤ çıkış sırası bozuk.`);
    if (c.out > total) errs.push(`[${c.id}] film bitiminden sonra çıkıyor.`);
    if (c.kind !== 'transition' && c.out - c.landed < rules.minDigest) errs.push(`[${c.id}] sindirme ${c.out - c.landed} kare (< ${rules.minDigest}).`);
    if (c.kind !== 'subject' && !c.final && (c.out - c.in) / total > rules.maxLifetimeRatio)
      errs.push(`[${c.id}] filmin %${Math.round(((c.out - c.in) / total) * 100)}'i boyunca ekranda: kalıcı katman sayılır.`);
    if (c.text && TEXT_KINDS.includes(c.kind)) {
      const w = countWords(c.text);
      if (w > rules.maxWords) errs.push(`[${c.id}] ${w} kelime (> ${rules.maxWords}).`);
      const hold = c.out - c.landed;
      const need = c.final ? Math.max(FINAL_HOLD, readHold(w)) : readHold(w);
      if (hold < need) errs.push(`[${c.id}] tamamen göründükten sonra ${hold} kare kalıyor; okuma için ${need} gerekli.`);
      const it = countItalicWords(c.text);
      if (c.kind !== 'shout' && it > rules.maxItalicWords) errs.push(`[${c.id}] ${it} italik kelime (> ${rules.maxItalicWords}).`);
      if (c.kind === 'figure' && it > 0) errs.push(`[${c.id}] sayılar italik dizilmez.`);
    }
  }
  const finals = cues.filter((c) => c.final);
  if (finals.length !== 1) errs.push(`Tam olarak bir final cümlesi olmalı (${finals.length}).`);
  const lastText = [...cues].filter((c) => TEXT_KINDS.includes(c.kind)).sort((a, b) => b.landed - a.landed)[0];
  if (lastText && total - lastText.landed < FINAL_HOLD) errs.push(`Film, son metin tamamen göründükten ${total - lastText.landed} kare sonra bitiyor (< ${FINAL_HOLD}).`);

  if (cues.filter((c) => c.accent).length > rules.maxAccentUses) errs.push('Vurgu rengi birden fazla kullanılmış.');
  if (cues.filter((c) => c.kind === 'shout').length > rules.maxShouts) errs.push('Birden fazla vuruş metni var.');

  for (let f = 0; f < total; f++) {
    const on = cues.filter((c) => alive(c, f));
    const texts = on.filter((c) => TEXT_KINDS.includes(c.kind));
    if (texts.length > rules.maxTextAtOnce) {
      errs.push(`Kare ${f}: aynı anda ${texts.length} metin (${texts.map((t) => t.id).join(', ')}).`);
      f += 15;
      continue;
    }
    const ideas = new Set(on.filter((c) => c.kind !== 'subject' && c.kind !== 'transition').map((c) => c.idea));
    if (ideas.size > rules.maxIdeasAtOnce) {
      errs.push(`Kare ${f}: aynı anda ${ideas.size} fikir (${[...ideas].join(', ')}).`);
      f += 15;
    }
  }

  const vs = [...voice].sort((a, b) => a.in - b.in);
  vs.forEach((v, i) => {
    const s = syllables(v.text);
    const rate = s / ((v.out - v.in) / fps);
    if (rate > rules.maxSyllablesPerSecond) errs.push(`[ses:${v.id}] ${s} hece / ${((v.out - v.in) / fps).toFixed(1)} sn = ${rate.toFixed(1)} hece/sn (> ${rules.maxSyllablesPerSecond}).`);
    if (v.out > total) errs.push(`[ses:${v.id}] film bitiminden sonra bitiyor.`);
    if (i > 0 && v.in < vs[i - 1].out) errs.push(`[ses:${v.id}] önceki satırla çakışıyor.`);
  });
  return errs;
};

export const why = (cues: ReadonlyArray<Cue>, frame: number) =>
  cues
    .filter((c) => frame >= c.in && frame < c.out + (c.kind === 'transition' ? 0 : 14))
    .map((c) => ({id: c.id, kind: c.kind, state: frame < c.landed ? 'giriyor' : frame < c.out ? 'yerinde' : 'çıkıyor', purpose: c.purpose, text: c.text}));
