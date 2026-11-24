/**
 * Yazı tipleri yerel dosyalardan yüklenir (ağ yok, deterministik).
 * Render, tüm yüzler hazır olana kadar bekletilir.
 * Lisans: iki aile de SIL Open Font License (public/fonts/LICENSE-*).
 */
import {continueRender, delayRender, staticFile} from 'remotion';

const LATIN =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LATIN_EXT =
  'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';

type Face = {family: string; file: string; weight: string; style: string; range: string};

const faces: Face[] = [
  {family: 'KT Fraunces', file: 'fraunces-latin-full-normal.woff2', weight: '100 900', style: 'normal', range: LATIN},
  {family: 'KT Fraunces', file: 'fraunces-latin-ext-full-normal.woff2', weight: '100 900', style: 'normal', range: LATIN_EXT},
  {family: 'KT Fraunces', file: 'fraunces-latin-full-italic.woff2', weight: '100 900', style: 'italic', range: LATIN},
  {family: 'KT Fraunces', file: 'fraunces-latin-ext-full-italic.woff2', weight: '100 900', style: 'italic', range: LATIN_EXT},
  {family: 'KT Schibsted', file: 'schibsted-grotesk-latin-wght-normal.woff2', weight: '400 900', style: 'normal', range: LATIN},
  {family: 'KT Schibsted', file: 'schibsted-grotesk-latin-ext-wght-normal.woff2', weight: '400 900', style: 'normal', range: LATIN_EXT},
];

let started = false;

export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('yazı tipleri yükleniyor');
  Promise.all(
    faces.map(async (f) => {
      const face = new FontFace(f.family, `url(${staticFile(`fonts/${f.file}`)}) format('woff2')`, {
        weight: f.weight,
        style: f.style,
        unicodeRange: f.range,
      });
      await face.load();
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(face);
    }),
  )
    .then(() => document.fonts.ready)
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
