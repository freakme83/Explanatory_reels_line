/** npm run events -- <film>  →  out/<film>/events.json  (kaynak: src/films/<film>/ses.ts) */
import {mkdirSync, writeFileSync} from 'node:fs';

const film = process.argv[2];
if (!film) throw new Error('Kullanım: npm run events -- <film>');
(async () => {
  const ev = (await import(`../src/films/${film}/ses.ts`)).default;
  mkdirSync(`out/${film}`, {recursive: true});
  writeFileSync(`out/${film}/events.json`, JSON.stringify(ev, null, 2) + '\n');
  console.log(`→ out/${film}/events.json (${ev.sfx.length} efekt, ${ev.totalFrames} kare)`);
})();
