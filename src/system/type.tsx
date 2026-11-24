/**
 * SİSTEM — metin
 *
 * Maske, gerçek harf sınırlarından hesaplanır (glyph-metrics.json, `npm run glyphs` ile ölçülür):
 * - Maske yalnızca ALT kenardan keser. Üst, sol ve sağ açıktır; italik taşmaları,
 *   Türkçe aksanlar (İ, Ş, Ç, Ğ) ve serif çıkıntıları hiçbir zaman kırpılmaz.
 * - Alt kenar, ölçülen en derin alt uzantının (ç, ş, ğ, g, j, p, y) altına yerleşir.
 * - Metin, tamamen gizli olduğu ölçülmüş bir mesafeden yükselir.
 * - Çıkışta aynı kenarın altına geri iner.
 *
 * Satır içi vurgu: "*kelime*" → italik. Her metin bileşeni zorunlu `out` alır.
 */
import React from 'react';
import type {CSSProperties, ReactNode} from 'react';
import {useCurrentFrame} from 'remotion';
import {color, emphasis, type, type Role} from './tokens';
import {ease, prog} from './motion';
import {textMotion} from './timing';
import metrics from './glyph-metrics.json';

const SAFETY = 0.04; // em

/**
 * Maske geometrisi, rol bazında. Kırpma kenarı PİKSEL olarak hesaplanır: em kullanılsaydı
 * kırpan kapsayıcının kendi (küçük) yazı boyutuna göre çözülürdü.
 */
export const maskFor = (role: Role) => {
  const m = (metrics as Record<string, {top: number; bottom: number; left: number; right: number}>)[role];
  const st = type[role] as {lineHeight: number; fontSize: number};
  const bottomPx = (m.bottom + SAFETY) * st.fontSize;
  const big = 2 * st.fontSize;
  return {
    clip: `inset(-${big}px -${big}px -${bottomPx.toFixed(1)}px -${big}px)`,
    /** Bu kadar (em) aşağıdan başlayan metin, maskenin altında tamamen gizlidir. */
    hidden: st.lineHeight + m.top + m.bottom + SAFETY * 2,
  };
};

/** "*vurgu*" işaretli metni düz + italik parçalara böler. */
export const Rich: React.FC<{text: string}> = ({text}) => (
  <>
    {text.split(/(\*.+?\*)/g).map((part, i) =>
      part.startsWith('*') && part.endsWith('*') ? (
        <span key={i} style={emphasis}>
          {part.slice(1, -1)}
        </span>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    )}
  </>
);

/** Dizgi satırı: alt maskenin altından yükselir, çıkışta aynı maskeye iner. */
export const Line: React.FC<{
  in: number;
  out: number;
  role?: Role;
  style?: CSSProperties;
  children: ReactNode;
  duration?: number;
}> = ({in: start, out, role = 'statement', style, children, duration = textMotion.set}) => {
  const f = useCurrentFrame();
  const pin = prog(f, start, duration, ease.set);
  const pout = prog(f, out, textMotion.exit, ease.exit);
  if (pin === 0 || pout === 1) return null;
  const {clip, hidden} = maskFor(role);
  const y = ((1 - pin) + pout) * hidden;
  return (
    <div style={{clipPath: clip}}>
      <div style={{...type[role], color: color.ink, transform: `translateY(${y}em)`, whiteSpace: 'nowrap', ...style}}>{children}</div>
    </div>
  );
};

/** Çok satırlı metin; her satır `*vurgu*` içerebilir. */
export const Lines: React.FC<{
  in: number;
  out: number;
  lines: ReadonlyArray<string>;
  role?: Role;
  align?: 'left' | 'center' | 'right';
  style?: CSSProperties;
}> = ({in: start, out, lines, role = 'statement', align = 'left', style}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}}>
    {lines.map((l, i) => (
      <Line key={i} in={start + i * textMotion.step} out={out + i * 2} role={role} style={style}>
        <Rich text={l} />
      </Line>
    ))}
  </div>
);

/** Küçük yardımcı metin (birim): opaklık + yükselme; kırpma yok. */
export const Fade: React.FC<{in: number; out: number; style?: CSSProperties; children: ReactNode}> = ({in: start, out, style, children}) => {
  const f = useCurrentFrame();
  const pin = prog(f, start, 12);
  const pout = prog(f, out, 10, ease.exit);
  if (pin === 0 || pout === 1) return null;
  return <div style={{opacity: pin * (1 - pout), transform: `translateY(${(1 - pin) * 12 + pout * 8}px)`, ...style}}>{children}</div>;
};

/** Sabit genişlikli rakamlar: sayarken metin titremesin. */
export const Digits: React.FC<{value: string; width?: number}> = ({value, width = 0.62}) => (
  <>
    {value.split('').map((ch, i) =>
      /[0-9]/.test(ch) ? (
        <span key={i} style={{display: 'inline-block', width: `${width}em`, textAlign: 'center'}}>
          {ch}
        </span>
      ) : (
        <span key={i}>{ch}</span>
      ),
    )}
  </>
);
