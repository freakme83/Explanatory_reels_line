/**
 * ÇEKİRDEK v3 — organik, ölçekten bağımsız kahraman
 *
 * v3'teki temel değişiklik: AYRINTI DÜZEYİ (LOD) ÖLÇEKTEN TÜRETİLİR.
 * İç yapı hiçbir zaman opaklıkla açılıp kapanmaz. Her hücre ve damla her zaman çizilir;
 * ekrandaki boyutu küçüldükçe rengi komşusuyla optik olarak birleşir:
 *   - hücre duvarı rengi, hücre ekranda küçüldükçe dolgu rengine yaklaşır,
 *   - su damlası rengi, damla küçüldükçe hücre rengine karışır.
 * Böylece mikro yapı, uzaklaştıkça çekirdeğin makro DOKUSUNA dönüşür; yaklaştıkça
 * aynı doku hücrelere ayrışır. Görünürlük eşiği yok; geçiş ölçeğin kendisidir.
 *
 * Ek durumlar:
 *   morph   → 0: düz bir disk (fincandaki kahve yüzeyi), 1: çekirdek
 *   texture → malzeme: 0 sıvı (doku yok), 1 katı çekirdek
 */
import React from 'react';
import {brush, color, misregister} from '../../../system/tokens';
import {clamp01, lerp, mix, roastColor, smoothstep} from '../../../system/motion';
import {blob, rand, smoothClosed, smoothOpen, type P} from '../../../system/organic';

export const VIEW = {w: 200, h: 280, cx: 100, cy: 140} as const;
export const ASPECT = VIEW.h / VIEW.w;
/** Fincandaki kahve diskinin yarıçapı (birim). */
export const DISK_R = 95;

/* ---------------- Dış hat ---------------- */

export const outlineR = (a: number) => {
  const base = 1 / Math.sqrt((Math.cos(a) / 88) ** 2 + (Math.sin(a) / 128) ** 2);
  const m = 1 + 0.035 * Math.sin(a + 0.7) + 0.022 * Math.sin(2 * a + 2.1) + 0.013 * Math.sin(3 * a + 0.4) + 0.007 * Math.sin(5 * a + 1.9);
  return base * m;
};
const diskR = (a: number) => DISK_R * (1 + 0.006 * Math.sin(3 * a + 0.5) + 0.004 * Math.sin(5 * a + 2.2));

const N_OUT = 64;
const outlinePts = (morph: number): P[] =>
  Array.from({length: N_OUT}, (_, i) => {
    const a = (i / N_OUT) * Math.PI * 2;
    const r = lerp(diskR(a), outlineR(a), morph);
    return [VIEW.cx + Math.cos(a) * r, VIEW.cy + Math.sin(a) * r];
  });
const OUT_PTS_BEAN = outlinePts(1);
export const OUTLINE = smoothClosed(OUT_PTS_BEAN);

const brushRing = (pts: P[], unitPerPx: number, weight: number) => {
  const inner: P[] = pts.map(([x, y], i) => {
    const a = (i / N_OUT) * Math.PI * 2;
    const t = 0.5 + 0.5 * Math.sin(a * 2 + 0.9) * Math.cos(a * 0.5 + 0.3);
    const w = (brush.min + (brush.max - brush.min) * t) * weight * unitPerPx;
    const dx = x - VIEW.cx;
    const dy = y - VIEW.cy;
    const L = Math.hypot(dx, dy);
    return [x - (dx / L) * w, y - (dy / L) * w];
  });
  return `${smoothClosed(pts)} ${smoothClosed(inner.reverse())}`;
};

/* ---------------- Orta yarık ---------------- */

type Seg = [P, P, P, P];
const CREASE: Seg[] = [
  [[105, 34], [80, 84], [126, 120], [101, 147]],
  [[101, 147], [76, 175], [121, 208], [95, 248]],
];
const bez = (s: Seg, t: number): P => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * s[0][k] + 3 * u * u * t * s[1][k] + 3 * u * t * t * s[2][k] + t * t * t * s[3][k]) as P;
};
const bezD = (s: Seg, t: number): P => {
  const u = 1 - t;
  return [0, 1].map((k) => 3 * u * u * (s[1][k] - s[0][k]) + 6 * u * t * (s[2][k] - s[1][k]) + 3 * t * t * (s[3][k] - s[2][k])) as P;
};
export const creaseAt = (t: number) => {
  const seg = t < 0.5 ? CREASE[0] : CREASE[1];
  const lt = t < 0.5 ? t * 2 : (t - 0.5) * 2;
  const p = bez(seg, lt);
  const d = bezD(seg, lt);
  const L = Math.hypot(d[0], d[1]) || 1;
  return {p, n: [-d[1] / L, d[0] / L] as P};
};

/** Yarık: merkezden iki uca doğru `grow` oranında uzar; `open` ile açılır. */
const creaseLens = (baseUnits: number, open: number, grow: number) => {
  const N = 48;
  const L: P[] = [];
  const R: P[] = [];
  const t0 = 0.5 - grow / 2;
  for (let i = 0; i <= N; i++) {
    const t = t0 + (i / N) * grow;
    const {p, n} = creaseAt(t);
    const local = grow > 0 ? (t - t0) / grow : 0;
    const taper = Math.pow(Math.sin(Math.PI * local), 0.6);
    const wob = 1 + 0.18 * Math.sin(t * 17 + 1.3);
    const w = baseUnits * taper * wob + open * 10 * Math.pow(Math.sin(Math.PI * t), 0.7);
    L.push([p[0] + n[0] * w, p[1] + n[1] * w]);
    R.push([p[0] - n[0] * w, p[1] - n[1] * w]);
  }
  return `${smoothOpen(L)} L ${smoothOpen(R.reverse()).slice(2)} Z`;
};

/* ---------------- Hücreler ---------------- */

const CELL = 9;
const CELL_D = CELL * 1.6; // hücre çapı (birim)
const DROP_D = 4.6; // damla çapı (birim)
type Cell = {x: number; y: number; d: number; shape: string; drop: string; bubbles: P[]; seed: number};
const CELLS: Cell[] = (() => {
  const out: Cell[] = [];
  const w = Math.sqrt(3) * CELL;
  const h = 1.5 * CELL;
  for (let row = 0; row * h < VIEW.h + h; row++) {
    for (let col = -1; col * w < VIEW.w + w; col++) {
      const s = `c${row}-${col}`;
      const x = col * w + (row % 2 ? w / 2 : 0) + (rand(`${s}x`) - 0.5) * 3.2;
      const y = row * h + 2 + (rand(`${s}y`) - 0.5) * 3.2;
      const a = Math.atan2(y - VIEW.cy, x - VIEW.cx);
      if (Math.hypot(x - VIEW.cx, y - VIEW.cy) > outlineR(a) + 4) continue;
      const ox = (rand(`${s}dx`) - 0.5) * 2.2;
      const oy = (rand(`${s}dy`) - 0.5) * 2.2;
      out.push({
        x,
        y,
        d: Math.hypot(x - VIEW.cx, (y - VIEW.cy) * 0.7),
        shape: smoothClosed(blob(0, 0, CELL * 0.8, s, 0.13, 9)),
        drop: smoothClosed(blob(ox, oy, DROP_D / 2, `${s}w`, 0.2, 7)),
        bubbles: [0, 1, 2].map((k) => [(rand(`${s}b${k}x`) - 0.5) * 7, (rand(`${s}b${k}y`) - 0.5) * 7] as P),
        seed: rand(`${s}seed`),
      });
    }
  }
  const max = Math.max(...out.map((c) => c.d));
  return out.map((c) => ({...c, d: c.d / max}));
})();

/* ---------------- Bileşen ---------------- */

export type BeanState = {
  temp: number;
  /** Dolgu rengini sıcaklık yerine doğrudan ver (ör. fincandaki kahve). */
  fillColor?: string;
  morph?: number;
  texture?: number;
  /** Yarığın görünür uzunluğu (0–1). */
  crease?: number;
  water?: number;
  vapor?: number;
  pressure?: number;
  crack?: number;
  crackAge?: number;
};

export const Bean: React.FC<
  BeanState & {
    width: number;
    frame: number;
    id: string;
    ghost?: {tone: string; draw: number};
  }
> = ({width, frame, id, temp, fillColor, morph = 1, texture = 1, crease = 1, water = 0, vapor = 0, pressure = 0, crack = 0, crackAge = -1, ghost}) => {
  const height = width * ASPECT;
  const px = width / VIEW.w;
  const u = 1 / px;
  const weight = Math.min(1.9, Math.max(0.55, Math.sqrt(width / 520)));
  const pts = morph >= 0.999 ? OUT_PTS_BEAN : outlinePts(morph);
  const outline = morph >= 0.999 ? OUTLINE : smoothClosed(pts);

  if (ghost) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} style={{overflow: 'visible', display: 'block'}}>
        <path d={outline} fill="none" stroke={ghost.tone} strokeWidth={7 * weight * u} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ghost.draw} strokeLinecap="round" />
      </svg>
    );
  }

  const fill = fillColor ?? roastColor(temp);

  // Ayrıntı düzeyi: hücrenin ve damlanın EKRANDAKİ boyutundan.
  const cellPx = CELL_D * px;
  const dropPx = DROP_D * px;
  const detail = smoothstep(10, 150, cellPx);
  const wallMix = 0.42 * texture * (0.2 + 0.8 * detail);
  const wall = mix(fill, color.ink, wallMix);
  const dropMix = texture * (0.18 + 0.82 * smoothstep(3, 28, dropPx));
  const cellScale = 1 - 0.06 * (1 - detail); // uzakta duvarlar incelir, doku birleşir

  const k = Math.min(1.5, Math.max(0.35, width / 600));
  const ox = misregister.x * k * u;
  const oy = misregister.y * k * u;
  const released = clamp01(crackAge >= 0 ? crackAge / 20 : 0);
  const fine = Math.max(1.3, Math.min(4, px * 0.32)) * u;
  const showCells = texture > 0.001;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} style={{overflow: 'visible', display: 'block'}}>
      <defs>
        <clipPath id={`${id}-o`}>
          <path d={outline} />
        </clipPath>
        <clipPath id={`${id}-f`}>
          <path d={outline} transform={`translate(${ox} ${oy})`} />
        </clipPath>
      </defs>

      {/* Dolgu (kayık baskı); hücreler varken taban rengi = duvar rengi */}
      <path d={outline} fill={showCells ? wall : fill} transform={`translate(${ox} ${oy})`} />

      {showCells ? (
        <g clipPath={`url(#${id}-f)`}>
          <g clipPath={`url(#${id}-o)`}>
            {CELLS.map((c, i) => {
              const swell = cellScale * (1 + 0.16 * pressure + 0.035 * pressure * Math.sin(frame * 0.55 + c.seed * 11));
              const jx = Math.sin(frame * 0.8 + c.seed * 40) * pressure * 0.5;
              const jy = Math.cos(frame * 0.7 + c.seed * 23) * pressure * 0.5;
              const w = clamp01((water * 1.5 - c.d) / 0.5);
              const v = clamp01(vapor * 1.4 - c.seed * 0.4);
              const dropColor = mix(fill, color.water, dropMix * w * (1 - released * 0.85));
              return (
                <g key={i} transform={`translate(${c.x + jx} ${c.y + jy}) scale(${swell})`}>
                  <path d={c.shape} fill={fill} />
                  {w > 0 ? (
                    <>
                      <path d={c.drop} fill={dropColor} transform={`scale(${(0.4 + 0.6 * w) * (1 - v * 0.8)})`} />
                      {v > 0.02
                        ? c.bubbles.map((b, j) => {
                            const bv = clamp01(v * 1.3 - j * 0.15);
                            return (
                              <circle
                                key={j}
                                cx={b[0] * (0.6 + 0.4 * bv)}
                                cy={b[1] * (0.6 + 0.4 * bv) - bv * 1.2}
                                r={0.5 + bv * (1.6 + j * 0.35)}
                                fill="none"
                                stroke={mix(fill, color.water, dropMix * bv * (1 - released * 0.85))}
                                strokeWidth={fine}
                              />
                            );
                          })
                        : null}
                    </>
                  ) : null}
                </g>
              );
            })}
          </g>
        </g>
      ) : null}

      <path d={brushRing(pts, u, weight)} fill={color.ink} fillRule="evenodd" />
      {crease > 0.001 ? <path d={creaseLens(2.6 * weight * u * 1.6, crack, crease)} fill={crack > 0.01 ? color.crease : color.ink} /> : null}

      {crack > 0.05
        ? [
            {t: 0.24, s: 1, L: 24, b: 0.5},
            {t: 0.46, s: -1, L: 28, b: -0.4},
            {t: 0.68, s: 1, L: 22, b: 0.3},
            {t: 0.84, s: -1, L: 16, b: 0.6},
          ].map((fz, i) => {
            const p = clamp01((crack - 0.15 - i * 0.12) / 0.4);
            if (p <= 0) return null;
            const {p: c, n} = creaseAt(fz.t);
            const off = crack * 10 * Math.pow(Math.sin(Math.PI * fz.t), 0.7);
            const sx = c[0] + n[0] * off * fz.s;
            const sy = c[1] + n[1] * off * fz.s;
            const dx = n[0] * fz.s + n[1] * fz.b;
            const dy = n[1] * fz.s - n[0] * fz.b;
            const L = fz.L * p;
            const q: P[] = [
              [sx, sy],
              [sx + dx * L * 0.35 + n[1] * 2.5, sy + dy * L * 0.35 - n[0] * 2.5],
              [sx + dx * L * 0.7 - n[1] * 1.5, sy + dy * L * 0.7 + n[0] * 1.5],
              [sx + dx * L, sy + dy * L],
            ];
            return <path key={i} d={smoothOpen(q)} fill="none" stroke={color.crease} strokeWidth={4 * weight * u} strokeLinecap="round" />;
          })
        : null}

      {/* Kaçan buhar: düz halkalar, kıvrımlı duman değil */}
      {crackAge >= 0 && crackAge < 44
        ? [0.12, 0.25, 0.38, 0.5, 0.62, 0.74, 0.88].map((t, i) => {
            const age = crackAge - i * 1.5;
            if (age < 0) return null;
            const q = clamp01(age / 38);
            const e = 1 - Math.pow(1 - q, 3);
            const side = i % 2 ? 1 : -1;
            const {p, n} = creaseAt(t);
            const d = 12 + e * 70;
            return (
              <circle
                key={i}
                cx={p[0] + n[0] * d * side}
                cy={p[1] + n[1] * d * side - e * 12}
                r={3 + e * 12}
                fill="none"
                stroke={color.water}
                strokeWidth={3 * weight * u}
                opacity={Math.pow(1 - q, 1.3)}
              />
            );
          })
        : null}
    </svg>
  );
};

/* ---------------- Kamera ---------------- */

export type Cam = {width: number; focus: P; at: P; rotate?: number};

export const BeanCam: React.FC<{cam: Cam; children: React.ReactNode; style?: React.CSSProperties}> = ({cam, children, style}) => {
  const px = cam.width / VIEW.w;
  return (
    <div
      style={{
        position: 'absolute',
        left: cam.at[0] - cam.focus[0] * px,
        top: cam.at[1] - cam.focus[1] * px,
        width: cam.width,
        height: cam.width * ASPECT,
        transformOrigin: `${cam.focus[0] * px}px ${cam.focus[1] * px}px`,
        transform: `rotate(${cam.rotate ?? 0}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
