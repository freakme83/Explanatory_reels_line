/**
 * npm run srt -- <film>  →  out/<film>/<film>.srt
 *
 * Ayrı altyazı dosyası (videoya gömülmez). Kaynak: filmin script.ts'teki `voice` satırları (gerçek kayıttan,
 * film karesi cinsinden). Uzun cümleler en çok 2 satır × 42 karaktere bölünür; satır, kelime ortasından kesilmez.
 */
import {mkdirSync, writeFileSync} from 'node:fs';

const film = process.argv[2];
if (!film) throw new Error('Kullanım: npm run srt -- <film>');
const FPS = 30;
const MAX = 42;

const ts = (frame: number) => {
  const ms = Math.round((frame / FPS) * 1000);
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

/** Metni ≤MAX karakterlik satırlara böler (dengeli iki satır tercih edilir). */
const wrap = (text: string): string[] => {
  if (text.length <= MAX) return [text];
  const words = text.split(' ');
  let best: string[] = [text];
  let score = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    if (a.length > MAX || b.length > MAX) continue;
    const s = Math.abs(a.length - b.length);
    if (s < score) {
      score = s;
      best = [a, b];
    }
  }
  return best;
};

(async () => {
  const {voice} = await import(`../src/films/${film}/script.ts`);
  const lines = [...voice].sort((a: {in: number}, b: {in: number}) => a.in - b.in);
  const out = lines.map((v: {in: number; out: number; text: string}, i: number) => {
    const next = lines[i + 1];
    // okumaya biraz pay: bir sonraki satıra kadar en çok 0,6 sn daha ekranda kalır
    const end = Math.min(v.out + 18, next ? next.in - 1 : v.out + 18);
    return `${i + 1}\n${ts(v.in)} --> ${ts(end)}\n${wrap(v.text).join('\n')}\n`;
  });
  mkdirSync(`out/${film}`, {recursive: true});
  writeFileSync(`out/${film}/${film}.srt`, out.join('\n'));
  console.log(`→ out/${film}/${film}.srt (${out.length} altyazı)`);
})();
