/**
 *   npm run audit -- <film>          → işaret listesini (src/films/<film>/script.ts) ilkelere göre denetler
 *   npm run why -- <film> <kare>     → o karede ekranda ne var, neden (ve o an konuşulan dış ses)
 * script.ts şunları dışa aktarır: cues, voice, spec; dış ses gerçek kayıtsa voiceIsRecording = true.
 */
import {forbidden, rules, validate, why} from '../src/system/principles';
import {syllables} from '../src/system/timing';

const [film, frameArg] = process.argv.slice(2);
if (!film) throw new Error('Kullanım: npm run audit -- <film>  |  npm run why -- <film> <kare>');
(async () => {
  const m = await import(`../src/films/${film}/script.ts`);
  const {cues, voice = [], spec} = m;
  if (frameArg !== undefined) {
    const f = Number(frameArg);
    console.log(`\n${film} · kare ${f} (${(f / 30).toFixed(2)} sn):\n`);
    for (const c of why(cues, f)) console.log(`  • ${c.id} [${c.kind}, ${c.state}]${c.text ? ` "${c.text}"` : ''}\n    → ${c.purpose}`);
    const v = voice.find((x: {in: number; out: number}) => f >= x.in && f < x.out);
    if (v) console.log(`\n  Dış ses: "${v.text}"`);
    return;
  }
  const recorded = Boolean(m.voiceIsRecording);
  const errs = validate(cues, recorded ? [] : voice, spec);
  if (recorded) {
    const vs = [...voice].sort((a, b) => a.in - b.in);
    vs.forEach((v, i) => i > 0 && v.in < vs[i - 1].out && errs.push(`[ses:${v.id}] önceki satırla çakışıyor.`));
    console.log('Dış ses hızı (kayıttan, bilgi): ' + vs.map((v) => `${v.id} ${(syllables(v.text) / ((v.out - v.in) / 30)).toFixed(1)}`).join(' · '));
  }
  console.log(`${film}: ${spec.totalFrames} kare (${(spec.totalFrames / 30).toFixed(1)} sn), ${cues.length} işaret, ${voice.length} dış ses satırı.`);
  console.log(`Kurallar: ≤${rules.maxWords} kelime, ≤${rules.maxItalicWords} italik kelime/metin, aynı anda 1 metin ve 1 fikir, okuma süresi animasyondan sonra, final ≥2,5 sn. Yasak unsurlar: ${forbidden.length}.`);
  if (errs.length) {
    console.log(`\n✗ ${errs.length} ihlal:`);
    errs.forEach((e) => console.log('  - ' + e));
    process.exit(1);
  }
  console.log('\n✓ İlkelere uygun.');
})();
