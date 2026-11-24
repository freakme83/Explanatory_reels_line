/**
 * HARF SINIRI ÖLÇÜMÜ (tam çözünürlük)
 *
 * Her tipografi rolü için, filmde geçen metinleri + zorlayıcı bir karakter setini gerçek
 * tarayıcıda gerçek yazı tipiyle çizer, mürekkebin (piksellerin) satır kutusunun dışına
 * ne kadar taştığını ölçer.
 *
 *   npm run glyphs -- <film>  → ölçer, src/system/glyph-metrics.json dosyasını yazar
 *                               ve filmdeki her metnin genişliğini satır ölçüsüyle karşılaştırır.
 *
 * Maske bileşeni (Line) bu ölçümlerden beslenir; tahmini pay kullanılmaz.
 */
import {createRequire} from 'node:module';
import {writeFileSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {type, emphasis, measure} from '../src/system/tokens';

const require = createRequire(import.meta.url);
const loadPlaywright = () => {
  for (const id of [process.env.KT_PLAYWRIGHT, 'playwright', 'playwright-core', '/opt/node-tools/node_modules/playwright']) {
    if (!id) continue;
    try {
      return require(id);
    } catch {
      /* sıradakini dene */
    }
  }
  throw new Error('Playwright bulunamadı: KT_PLAYWRIGHT ile yolunu verin ya da `npm i -D playwright-core` kurun.');
};
const {chromium} = loadPlaywright();
const {PNG} = require('pngjs');

const root = resolve(__dirname, '..');
const fontsCss = [
  ['KT Fraunces', 'fraunces-latin-full-normal.woff2', 'normal', '100 900'],
  ['KT Fraunces', 'fraunces-latin-ext-full-normal.woff2', 'normal', '100 900'],
  ['KT Fraunces', 'fraunces-latin-full-italic.woff2', 'italic', '100 900'],
  ['KT Fraunces', 'fraunces-latin-ext-full-italic.woff2', 'italic', '100 900'],
  ['KT Schibsted', 'schibsted-grotesk-latin-wght-normal.woff2', 'normal', '400 900'],
  ['KT Schibsted', 'schibsted-grotesk-latin-ext-wght-normal.woff2', 'normal', '400 900'],
]
  .map(([fam, file, style, w]) => {
    const b64 = readFileSync(resolve(root, 'public/fonts', file)).toString('base64');
    return `@font-face{font-family:"${fam}";src:url(data:font/woff2;base64,${b64}) format("woff2");font-style:${style};font-weight:${w};}`;
  })
  .join('\n');

const STRESS = ['ÇĞİÖŞÜ çğıöşü', 'gjpqy fİf', '%15 −%15 1,6× 196°C', 'Ąj'];
const _css = (o: Record<string, unknown>) =>
  Object.entries(o)
    .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${typeof v === 'number' && k !== 'fontWeight' && k !== 'lineHeight' ? v + 'px' : v}`)
    .join(';');

(async () => {
  const film = process.argv[2];
  if (!film) throw new Error('Kullanım: npm run glyphs -- <film>  (film script.ts dosyası allText dışa aktarır)');
  const {allText} = (await import(`../src/films/${film}/script.ts`)) as {allText: {role: string; text: string}[]};
  const browser = await chromium.launch(process.env.KT_BROWSER ? {executablePath: process.env.KT_BROWSER} : {});
  const page = await browser.newPage({viewport: {width: 2400, height: 1200}, deviceScaleFactor: 1});
  await page.setContent(`<html><head><style>${fontsCss} body{margin:0;background:#fff}</style></head><body></body></html>`);

  const roles = Object.keys(type) as (keyof typeof type)[];
  const metrics: Record<string, {top: number; bottom: number; left: number; right: number}> = {};
  const widths: {role: string; text: string; width: number; ok: boolean}[] = [];

  for (const role of roles) {
    const st = type[role] as Record<string, unknown>;
    const samples = [...STRESS, ...allText.filter((t) => t.role === role).map((t) => t.text)];
    let worst = {top: 0, bottom: 0, left: 0, right: 0};
    for (const variant of ['roman', 'italic'] as const) {
      for (const s of samples) {
        const style = variant === 'italic' ? {...st, ...emphasis} : st;
        await page.evaluate(
          ([text, st, em]) => {
            document.body.innerHTML = '<div id="pad" style="position:absolute;left:0;top:0;padding:300px;background:#fff"></div>';
            const box = document.createElement('div');
            box.id = 'box';
            Object.assign(box.style, st, {color: '#000', whiteSpace: 'nowrap', display: 'inline-block'});
            for (const part of (text as string).split(/(\*.+?\*)/g)) {
              if (!part) continue;
              const span = document.createElement('span');
              if (part.startsWith('*') && part.endsWith('*')) {
                Object.assign(span.style, em);
                span.textContent = part.slice(1, -1);
              } else span.textContent = part;
              box.appendChild(span);
            }
            document.getElementById('pad')!.appendChild(box);
          },
          [s, Object.fromEntries(Object.entries(style).map(([k, v]) => [k, typeof v === 'number' && k === 'fontSize' ? v + 'px' : String(v)])), emphasis] as const,
        );
        await page.evaluate(() => document.fonts.ready);
        const box = await page.evaluate(() => {
          const r = document.getElementById('box')!.getBoundingClientRect();
          return {x: r.x, y: r.y, w: r.width, h: r.height};
        });
        const shot: Buffer = await page.screenshot({clip: {x: 0, y: 0, width: Math.ceil(box.x + box.w + 300), height: Math.ceil(box.y + box.h + 300)}});
        const png = PNG.sync.read(shot);
        let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
        for (let y = 0; y < png.height; y++)
          for (let x = 0; x < png.width; x++) {
            const i = (y * png.width + x) * 4;
            if (png.data[i] < 200) {
              if (x < x0) x0 = x;
              if (x > x1) x1 = x;
              if (y < y0) y0 = y;
              if (y > y1) y1 = y;
            }
          }
        const fs = (st.fontSize as number);
        const o = {
          top: Math.max(0, box.y - y0) / fs,
          bottom: Math.max(0, y1 + 1 - (box.y + box.h)) / fs,
          left: Math.max(0, box.x - x0) / fs,
          right: Math.max(0, x1 + 1 - (box.x + box.w)) / fs,
        };
        worst = {top: Math.max(worst.top, o.top), bottom: Math.max(worst.bottom, o.bottom), left: Math.max(worst.left, o.left), right: Math.max(worst.right, o.right)};
        if (variant === 'roman' && !STRESS.includes(s)) {
          const inkW = x1 + 1 - x0;
          widths.push({role, text: s, width: Math.round(inkW), ok: inkW <= measure});
        }
      }
    }
    metrics[role] = Object.fromEntries(Object.entries(worst).map(([k, v]) => [k, Math.round(v * 1000) / 1000])) as typeof worst;
  }
  await browser.close();

  writeFileSync(resolve(root, 'src/system/glyph-metrics.json'), JSON.stringify(metrics, null, 2) + '\n');
  console.log('Satır kutusu dışına taşma (em):');
  for (const [r, m] of Object.entries(metrics)) console.log(`  ${r.padEnd(10)} üst ${m.top}  alt ${m.bottom}  sol ${m.left}  sağ ${m.right}`);
  console.log(`\nFilm metinleri (mürekkep genişliği / satır ölçüsü ${measure}px):`);
  let bad = 0;
  for (const w of widths) {
    if (!w.ok) bad++;
    console.log(`  ${w.ok ? '✓' : '✗'} ${w.role.padEnd(10)} ${String(w.width).padStart(4)}px  ${w.text}`);
  }
  if (bad) {
    console.log(`\n✗ ${bad} satır ölçüye sığmıyor.`);
    process.exit(1);
  }
})();
