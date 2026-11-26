/**
 * KOLA + V60 — sahneler (Sahne 4 ve 5 dışındakiler; onlar scenes.tsx'te).
 *
 * Her bileşen FİLM karesiyle çalışır: `from` = içinde bulunduğu <Sequence>'in başladığı kare,
 * F = yerel kare + from. Böylece bütün zamanlar script.ts'teki B'den doğrudan okunur.
 */
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {canvas, color, font, margin, misregister, type} from '../../system/tokens';
import {ease, lerp, lerpScale, mix, prog, settle, smoothstep} from '../../system/motion';
import {blob, rand, smoothClosed, smoothOpen, type P} from '../../system/organic';
import {Digits} from '../../system/type';
import {Aroma, Caffeine, Sugar, WaterField, palette, scatter, wiggle} from './molecules';
import {busCrowd} from './scenes';
import {B, credits} from './script';

const W = canvas.width;
const H = canvas.height;
const ext = (f: string) => staticFile(`external/kola-v60/${f}`);
const useF = (from: number) => useCurrentFrame() + from;

const Tag: React.FC<{x: number; y: number; children: React.ReactNode; opacity?: number; light?: boolean; size?: number}> = ({x, y, children, opacity = 1, light, size = 34}) =>
  opacity <= 0.001 ? null : (
    <div style={{position: 'absolute', left: x, top: y, ...type.unit, fontSize: size, color: light ? color.paper : color.ink, opacity, whiteSpace: 'nowrap'}}>{children}</div>
  );

/** Görüntü üzerindeki hesap adı: küçük, kâğıt rengi; okunurluk için yalnızca hafif bir gölge. */
const Credit: React.FC<{lines: string[]; opacity: number; size?: number; bottom?: number}> = ({lines, opacity, size = 32, bottom = 1520}) =>
  opacity <= 0.001 ? null : (
    <div style={{position: 'absolute', left: margin, top: bottom - lines.length * size * 1.25, opacity}}>
      {lines.map((l) => (
        <div key={l} style={{...type.unit, fontSize: size, lineHeight: 1.25, color: color.paper, textShadow: '0 1px 3px rgba(0,0,0,0.6)'}}>{l}</div>
      ))}
    </div>
  );

/* ================= Açılış · gerçek görüntü ================= */

const OPEN_FILES = ['op1', 'op2', 'op3', 'op4', 'op5'];

export const OpeningFootage: React.FC = () => {
  const f = useCurrentFrame();
  const c = B.open.clips;
  const cr = prog(f, 6, 12) * (1 - prog(f, c[5] - 10, 10));
  return (
    <AbsoluteFill style={{background: color.ink}}>
      {OPEN_FILES.map((n, i) => (
        <Sequence key={n} from={c[i]} durationInFrames={c[i + 1] - c[i]}>
          <OffthreadVideo src={ext(`${n}.mp4`)} muted style={{width: W, height: H}} />
        </Sequence>
      ))}
      {f >= c[5] ? <Img src={ext('op5_son.png')} style={{width: W, height: H}} /> : null}
      <Credit lines={[credits.c2, credits.mm, credits.pp]} opacity={cr} />
    </AbsoluteFill>
  );
};

/* ================= Sahne 1 · fotoğraftan çizime, köpüren V60 ================= */

/** Fotoğraftaki (op5 son kare) V60'ın çizgileri: mürekkep bunların üstünden geçer. */
const BED = {cx: 590, cy: 1262, rx: 468, ry: 186};
const V60 = {
  cone: smoothOpen([[18, 1050], [95, 1350], [215, 1620], [340, 1860]] as P[]) + ' ' + smoothOpen([[1078, 1004], [1030, 1300], [950, 1600], [880, 1860]] as P[]),
  coneFill: smoothClosed([[0, 1040], [240, 876], [700, 852], [1080, 852], [1078, 1004], [1030, 1300], [950, 1600], [880, 1870], [340, 1870], [215, 1620], [95, 1350]] as P[], 0.3),
  paper: smoothOpen([[0, 1040], [120, 958], [240, 876], [520, 860], [800, 852], [1080, 852]] as P[]),
  handle: smoothOpen([[60, 1290], [-10, 1300], [-40, 1420], [10, 1520], [150, 1500]] as P[]),
  base: 'M 250 1868 Q 610 1835 960 1868 L 1010 1920 L 200 1920 Z',
  neck: 'M 830 560 Q 860 470 1080 420 L 1080 700 Q 930 760 900 800 Q 860 820 840 760 Z',
  ring: 'M 842 640 Q 900 600 1080 560',
};
/** Kola akışı: şişe ağzından yatağa, hafif kıvrılarak. */
const streamPath = (F: number) => {
  const pts: P[] = Array.from({length: 9}, (_, i) => {
    const k = i / 8;
    return [lerp(868, 846, k) + Math.sin(k * 9 + F * 0.4) * 5 * k, lerp(790, 1200, k)];
  });
  const left = pts.map(([x, y], i) => [x - lerp(16, 10, i / 8), y] as P);
  const right = pts.map(([x, y], i) => [x + lerp(16, 10, i / 8), y] as P).reverse();
  return smoothClosed([...left, ...right], 0.4);
};
const DIVE: P = [470, 1228];

const Draw: React.FC<{d: string; p: number; w?: number; c?: string}> = ({d, p, w = 6, c = color.ink}) =>
  p <= 0 ? null : <path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;

export const SceneV60: React.FC<{from: number}> = ({from}) => {
  const F = useF(from);
  const v = B.v60;
  const ink = prog(F, v.draw, 30, ease.draw);
  const wipe = prog(F, v.wipe, 40, ease.move);
  const fills = prog(F, v.wipe + 10, 30);
  const excite = smoothstep(v.wipe + 20, v.foam, F);
  const dive = prog(F, v.dive, v.diveEnd - v.dive, ease.zoom);
  const s = lerpScale(1, 18, dive);
  const r = 1700 * wipe;
  // köpüren yatak: kabarcıklar doğar, büyür, patlar; heyecan arttıkça sayı ve hız artar
  const bubbles = Array.from({length: 70}, (_, i) => {
    const a = rand(`fa${i}`) * Math.PI * 2;
    const d = Math.sqrt(rand(`fd${i}`)) * 0.88;
    const x = BED.cx + Math.cos(a) * BED.rx * d;
    const y = BED.cy - 10 + Math.sin(a) * BED.ry * 0.8 * d;
    const per = 24 + rand(`fp${i}`) * 30;
    const u = ((F * (0.5 + excite * 1.1) + rand(`fo${i}`) * per) % per) / per;
    const on = i < 16 + excite * 54;
    return {x, y, u, rmax: 12 + rand(`fr${i}`) * 22, on};
  });
  const foamLift = excite * 40;

  return (
    <AbsoluteFill style={{background: color.paper, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: `${DIVE[0]}px ${DIVE[1]}px`}}>
        {wipe < 1 ? <Img src={ext('op5_son.png')} style={{width: W, height: H}} /> : null}
        <AbsoluteFill
          style={{
            background: color.paper,
            clipPath: `circle(${r.toFixed(1)}px at ${BED.cx}px ${BED.cy}px)`,
          }}
        />
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <g opacity={fills}>
            <path d={V60.coneFill} fill={color.ink} transform={`translate(${misregister.x} ${misregister.y})`} opacity={0.18} />
            <path d={V60.coneFill} fill={color.ceramic} />
            <path d={V60.base} fill={color.ceramic} stroke={color.ink} strokeWidth={5} />
            <ellipse cx={BED.cx} cy={BED.cy - foamLift * 0.4} rx={BED.rx} ry={BED.ry + foamLift * 0.3} fill={palette.particle} />
            <ellipse cx={BED.cx + 10} cy={BED.cy - 16 - foamLift * 0.6} rx={BED.rx * 0.9} ry={BED.ry * 0.72 + foamLift * 0.3} fill="#A9774F" />
            <path d={V60.neck} fill="#D9E2E3" stroke={color.ink} strokeWidth={4} opacity={0.95} />
            <path d={V60.ring} fill="none" stroke={color.ink} strokeWidth={3} />
            <path d={streamPath(F)} fill="#7A4524" stroke={color.ink} strokeWidth={3} />
          </g>
          {bubbles.map((b, i) =>
            b.on && fills > 0 ? (
              <g key={i} opacity={fills}>
                {b.u < 0.85 ? (
                  <circle cx={b.x} cy={b.y - foamLift * 0.5} r={b.rmax * smoothstep(0, 0.85, b.u)} fill="#D8B994" stroke={color.ink} strokeWidth={2.6} />
                ) : (
                  <circle cx={b.x} cy={b.y - foamLift * 0.5} r={b.rmax * (1 + (b.u - 0.85) * 4)} fill="none" stroke={color.ink} strokeWidth={2.4 * (1 - (b.u - 0.85) / 0.15)} />
                )}
              </g>
            ) : null,
          )}
          {/* dalışın hedefi: tek bir kabarcık */}
          {F >= v.dive - 20 ? <circle cx={DIVE[0]} cy={DIVE[1]} r={16 * smoothstep(v.dive - 20, v.dive, F)} fill="#DDEAF0" stroke={color.ink} strokeWidth={2.4} /> : null}
          <Draw d={V60.cone} p={ink} />
          <Draw d={V60.paper} p={ink} w={5} />
          <Draw d={V60.handle} p={prog(F, v.draw + 10, 24, ease.draw)} w={6} />
          <ellipse cx={BED.cx} cy={BED.cy - foamLift * 0.4} rx={BED.rx} ry={BED.ry + foamLift * 0.3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ink} fill="none" stroke={color.ink} strokeWidth={5} />

        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Dalış: Sahne 2, büyüyen kabarcığın içinden görünür. */
export const diveIris = (F: number) => {
  const v = B.v60;
  const d = prog(F, v.dive, v.diveEnd - v.dive, ease.zoom);
  const s = lerpScale(1, 18, d);
  const r = 16 * s * (1 + 7 * smoothstep(0.55, 1, d));
  return {r, at: DIVE, done: d >= 1};
};

/* ================= Sahne 2–3 · tek parçacık: kabarcıklar, sonra şeker kalabalığı ================= */

const PC: P = [540, 1080];
const PR = 390;
const N = 40;
const PITS = [2, 7, 11, 15, 25, 30, 35, 38];
const OUTLINE: P[] = Array.from({length: N}, (_, k) => {
  const a = (k / N) * Math.PI * 2 - Math.PI / 2;
  const pit = PITS.includes(k);
  // düşük frekanslı düzensizlik + yer yer dar, derin çukurlar (pürüz)
  const lump = 1 + Math.sin(a * 3 + 0.7) * 0.07 + Math.sin(a * 5 + 2.1) * 0.05 + (rand(`po${k}`) - 0.5) * 0.06;
  const rr = PR * lump * (pit ? 0.8 - rand(`pd${k}`) * 0.06 : 1);
  return [PC[0] + Math.cos(a) * rr, PC[1] + Math.sin(a) * rr * 0.92];
});
const PATH = smoothClosed(OUTLINE, 0.9);
const pitPoint = (k: number): P => {
  const [x, y] = OUTLINE[k];
  const a = Math.atan2(y - PC[1], x - PC[0]);
  return [x + Math.cos(a) * 8, y + Math.sin(a) * 8];
};
const surfacePoint = (a: number): P => {
  // dış hat üzerinde verilen açıdaki nokta (en yakın iki köşe arasında)
  const t = (((a + Math.PI / 2) / (Math.PI * 2)) % 1 + 1) % 1 * N;
  const k = Math.floor(t);
  const p0 = OUTLINE[k % N];
  const p1 = OUTLINE[(k + 1) % N];
  return [lerp(p0[0], p1[0], t - k), lerp(p0[1], p1[1], t - k)];
};
const CELLS2 = (() => {
  const out: {d: string; x: number; y: number}[] = [];
  const R = 46;
  const w = Math.sqrt(3) * R;
  const h = 1.5 * R;
  for (let row = 0; row * h < 760; row++)
    for (let col = 0; col * w < 760; col++) {
      const s = `c2${row}-${col}`;
      const x = PC[0] - 380 + col * w + (row % 2 ? w / 2 : 0) + (rand(s + 'x') - 0.5) * 12;
      const y = PC[1] - 380 + row * h + (rand(s + 'y') - 0.5) * 12;
      out.push({d: smoothClosed(blob(x, y, R * 0.8, s, 0.13, 9)), x, y});
    }
  return out;
})();

type Bub = {x: number; y: number; r: number; o: number};
/** Bir kaynaktan periyodik kabarcık: büyür, kopar, yükselerek kadrajdan çıkar. */
const bubblesFrom = (F: number, start: number, p: P, per: number, off: number, rmax: number, seed: string, out: Bub[]) => {
  if (F < start) return;
  const grow = per * 0.7;
  const n0 = Math.floor((F - start + off) / per);
  for (let n = Math.max(0, n0 - 3); n <= n0; n++) {
    const birth = start - off + n * per;
    const age = F - birth;
    if (age < 0) continue;
    const r = rmax * (0.8 + rand(`${seed}r${n}`) * 0.4) * smoothstep(0, grow, age);
    const rise = age > grow ? Math.pow(age - grow, 1.55) * 1.6 : 0;
    const y = p[1] - rise;
    if (y < -60) continue;
    out.push({x: p[0] + Math.sin(age * 0.18 + n) * Math.min(1, rise / 80) * 10, y, r, o: 1});
  }
};

export const SceneParticle: React.FC<{from: number}> = ({from}) => {
  const F = useF(from);
  const P2 = B.particle;
  const local4 = F - B.bus.start; // Sahne 4 ile aynı titreşim fazı: kesme görünmez
  const exit = prog(F, P2.exit, 50, ease.move);
  const activeAt = (k: number, i: number) =>
    i < 2 ? P2.start + 10 + i * 9 : i < 5 ? P2.puruzlu + (i - 2) * 7 : P2.ideal - 14 + (i - 5) * 6;
  const bubs: Bub[] = [];
  if (exit < 1)
    PITS.forEach((k, i) => bubblesFrom(F, activeAt(k, i), pitPoint(k), 44 + rand(`pp${k}`) * 26, rand(`pf${k}`) * 30, 30 + rand(`pr${k}`) * 16, `pit${k}`, bubs));
  // kavurmadan kalan gaz: hücrelerin içinde belirir, dışarı süzülür, yüzeyden kabarcık olarak çıkar
  const inner = Array.from({length: 12}, (_, i) => {
    const a = -Math.PI + rand(`ia${i}`) * Math.PI * 1.6 - 0.3 * Math.PI;
    const start = P2.kavurmadan - 6 + i * 4 + rand(`is${i}`) * 10;
    const per = 70 + rand(`ip${i}`) * 30;
    return {a, start, per};
  });
  const innerDots: {x: number; y: number; r: number}[] = [];
  if (exit < 1)
    inner.forEach((g, i) => {
      if (F < g.start) return;
      const age = (F - g.start) % g.per;
      const sp = surfacePoint(g.a);
      const c0: P = [lerp(PC[0], sp[0], 0.35 + rand(`id${i}`) * 0.3), lerp(PC[1], sp[1], 0.35 + rand(`id${i}`) * 0.3)];
      const travel = smoothstep(0, 34, age);
      if (travel < 1) innerDots.push({x: lerp(c0[0], sp[0], travel), y: lerp(c0[1], sp[1], travel), r: 6 + travel * 6});
      bubblesFrom(F, g.start + 34, sp, g.per, 0, 16 + rand(`iq${i}`) * 8, `in${i}`, bubs);
    });
  // çözünmüş gaz: küçük soluk mavi noktalar; aktif çukurlara doğru akar
  const dots = Array.from({length: 80}, (_, i) => {
    const x0 = rand(`gx${i}`) * W;
    const y0 = 260 + rand(`gy${i}`) * 1400;
    const inside = Math.hypot(x0 - PC[0], (y0 - PC[1]) / 0.92) < PR * 0.98;
    if (inside) return null;
    let best = -1;
    let bd = 1e9;
    PITS.forEach((k, j) => {
      if (F < activeAt(k, j)) return;
      const p = pitPoint(k);
      const d = Math.hypot(p[0] - x0, p[1] - y0);
      if (d < bd) {
        bd = d;
        best = k;
      }
    });
    const [wx, wy] = wiggle(rand(`gw${i}`), local4, 5);
    if (best < 0 || bd > 320) return {x: x0 + wx, y: y0 + wy, o: 0.8};
    const p = pitPoint(best);
    const u = ((F * (0.012 + rand(`gs${i}`) * 0.01) + rand(`gp${i}`)) % 1);
    const e = u * u;
    return {x: lerp(x0, p[0], e) + wx * (1 - e), y: lerp(y0, p[1], e) + wy * (1 - e), o: 0.8 * (1 - smoothstep(0.8, 1, u))};
  });
  const pitMark = prog(F, P2.puruzlu - 4, 16);
  const wall = mix(palette.particle, color.ink, 0.38);
  const crowd = busCrowd();
  const pop = (i: number, n: number) => settle(F, lerp(P2.exit + 12, P2.seker + 10, i / n), true);
  const tx = lerp(0, -620, exit);
  const ty = lerp(0, 980, exit);
  const sc = lerp(1, 0.7, exit);

  return (
    <AbsoluteFill style={{background: palette.cola}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <defs>
          <clipPath id="p2clip">
            <path d={PATH} />
          </clipPath>
        </defs>
        <WaterField frame={local4} w={W} h={H} />
        <g opacity={1 - exit}>
          {dots.map((d, i) => (d ? <circle key={i} cx={d.x} cy={d.y} r={7} fill="#EAF3F7" stroke={color.ink} strokeWidth={1.8} opacity={d.o} /> : null))}
        </g>
        <g transform={`translate(${tx} ${ty}) translate(${PC[0]} ${PC[1]}) scale(${sc}) translate(${-PC[0]} ${-PC[1]})`} >
          <path d={PATH} fill={wall} transform={`translate(${misregister.x} ${misregister.y})`} />
          <g clipPath="url(#p2clip)">
            <rect x={PC[0] - 400} y={PC[1] - 400} width={800} height={800} fill={wall} />
            {CELLS2.map((c, i) => (
              <path key={i} d={c.d} fill={palette.particle} />
            ))}
            {innerDots.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#BFD8E4" stroke={color.ink} strokeWidth={2} />
            ))}
          </g>
          <path d={PATH} fill="none" stroke={color.ink} strokeWidth={6} strokeLinejoin="round" />
          {/* pürüzlü çukurlar: kısa mürekkep işaretleri, "pürüzlü" kelimesiyle */}
          {PITS.map((k) => {
            const [x, y] = OUTLINE[k];
            const a = Math.atan2(y - PC[1], x - PC[0]);
            return (
              <path key={k} d={`M ${x + Math.cos(a + 1.3) * 18} ${y + Math.sin(a + 1.3) * 18} Q ${x - Math.cos(a) * 10} ${y - Math.sin(a) * 10} ${x + Math.cos(a - 1.3) * 18} ${y + Math.sin(a - 1.3) * 18}`}
                fill="none" stroke={color.ink} strokeWidth={3.5} strokeLinecap="round" opacity={pitMark} />
            );
          })}
        </g>
        {bubs.map((b, i) => (
          <g key={i} opacity={1 - exit}>
            <circle cx={b.x} cy={b.y} r={b.r} fill="#E2EEF3" stroke={color.ink} strokeWidth={3} />
            {b.r > 10 ? <path d={`M ${b.x - b.r * 0.55} ${b.y - b.r * 0.1} A ${b.r * 0.6} ${b.r * 0.6} 0 0 1 ${b.x - b.r * 0.05} ${b.y - b.r * 0.58}`} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" /> : null}
          </g>
        ))}
        {/* şeker kalabalığı: Sahne 4'ün ilk karesindeki konumlara iner */}
        {crowd.standing.map((m, i) => {
          const s = pop(i * 2 + 1, 22);
          if (s <= 0.001) return null;
          const [wx, wy] = wiggle(m.wseed, local4, m.wamp);
          return <g key={`st${i}`} transform={`translate(${m.x + wx} ${m.y + wy}) scale(${s}) translate(${-(m.x + wx)} ${-(m.y + wy)})`}><Sugar x={m.x + wx} y={m.y + wy} r={m.r} rot={m.rot} /></g>;
        })}
        {crowd.sugars.map((m, i) => {
          const s = pop(i * 2, 22);
          if (s <= 0.001) return null;
          const [wx, wy] = wiggle(m.wseed, local4, m.wamp);
          return <g key={`su${i}`} transform={`translate(${m.x + wx} ${m.y + wy}) scale(${s}) translate(${-(m.x + wx)} ${-(m.y + wy)})`}><Sugar x={m.x + wx} y={m.y + wy} r={m.r} rot={m.rot + local4 * 0.004 * -0.3} /></g>;
        })}
        {crowd.caff.map((m, i) => {
          const s = pop(6 + i * 5, 22);
          if (s <= 0.001) return null;
          const [wx, wy] = wiggle(m.wseed, local4, m.wamp);
          return <Caffeine key={`c${i}`} x={m.x + wx} y={m.y + wy} r={m.r * s} rot={m.rot} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ================= Sahne 6 · sıcak su ile kola, yan yana ================= */

const Band: React.FC<{F: number; y0: number; y1: number; bg: string; flows: number; speed: number; sugars: number; seed: string; wig: number}> = ({F, y0, y1, bg, flows, speed, sugars, seed, wig}) => {
  const edge = (y: number) => 250 + Math.sin(y * 0.011 + rand(seed) * 6) * 22;
  const id = `band-${seed}`;
  const pts: P[] = [[-20, y0 - 20]];
  for (let y = y0 - 20; y <= y1 + 20; y += 20) pts.push([edge(y), y]);
  pts.push([-20, y1 + 20]);
  const part = smoothClosed(pts, 0.5);
  const wall = mix(palette.particle, color.ink, 0.38);
  const sug = scatter(sugars, [380, y0 + 60, 1010, y1 - 60], seed + 's');
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={0} y={y0} width={W} height={y1 - y0} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={0} y={y0} width={W} height={y1 - y0} fill={bg} />
        <WaterField frame={F * wig} w={W} h={H} count={900} seed={seed + 'w'} />
        <path d={part} fill={wall} />
        {Array.from({length: 7}, (_, i) => (
          <path key={i} d={smoothClosed(blob(90 + (i % 2) * 90, y0 + 50 + i * ((y1 - y0) / 7), 40, seed + 'c' + i, 0.15, 8))} fill={palette.particle} />
        ))}
        <path d={smoothOpen(pts.slice(1, -1))} fill="none" stroke={color.ink} strokeWidth={6} />
        {sug.map((s, i) => {
          const [wx, wy] = wiggle(s.s, F * wig, 3 * wig);
          return <Sugar key={i} x={s.x + wx} y={s.y + wy} r={24} rot={s.s * 4} />;
        })}
        {Array.from({length: flows}, (_, i) => {
          const yy = y0 + 50 + rand(`${seed}fy${i}`) * (y1 - y0 - 100);
          const ph = rand(`${seed}fp${i}`);
          const t = (F * speed * (0.8 + rand(`${seed}fs${i}`) * 0.4) + ph) % 1;
          const u = 1 - Math.pow(1 - t, 1.5);
          const x0 = edge(yy) - 30;
          const pos = (uu: number): P => [x0 + uu * (W + 60 - x0), yy + Math.sin(uu * 6 + ph * 20 + F * 0.03) * 14 * uu];
          const [x, y] = pos(u);
          const o = smoothstep(edge(yy) - 10, edge(yy) + 30, x);
          return (
            <g key={i} opacity={o}>
              {[0.04, 0.08, 0.12].map((d, j) => {
                const [tx, ty] = pos(Math.max(0, 1 - Math.pow(1 - Math.max(0, t - d), 1.5)));
                return <circle key={j} cx={tx} cy={ty} r={5 - j * 1.2} fill={color.ink} opacity={0.5 - j * 0.12} />;
              })}
              {i % 7 === 6 ? <Caffeine x={x} y={y} r={17} rot={ph * 3} /> : <Aroma x={x} y={y} r={18} seed={`${seed}a${i}`} />}
            </g>
          );
        })}
      </g>
      <line x1={0} y1={y0} x2={W} y2={y0} stroke={color.ink} strokeWidth={4} />
      <line x1={0} y1={y1} x2={W} y2={y1} stroke={color.ink} strokeWidth={4} />
    </g>
  );
};

export const SceneCompare: React.FC<{from: number}> = ({from}) => {
  const F = useF(from);
  const c = B.compare;
  const topIn = prog(F, c.start, 18, ease.move);
  const botIn = prog(F, c.start + 4, 18, ease.move);
  const tag = prog(F, c.start + 14, 12);
  return (
    <AbsoluteFill style={{background: color.paper}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${(1 - topIn) * W} 0)`}>
          <Band F={F} y0={330} y1={900} bg="#F2E3CC" flows={30} speed={0.0125} sugars={0} seed="hot" wig={1.6} />
        </g>
        <g transform={`translate(${(1 - botIn) * -W} 0)`}>
          <Band F={F} y0={960} y1={1530} bg={palette.coldCola} flows={9} speed={0.0042} sugars={10} seed="cola" wig={0.35} />
        </g>
      </svg>
      <Tag x={W - margin - 150} y={270} opacity={tag}>sıcak su</Tag>
      <Tag x={W - margin - 70} y={1548} opacity={tag}>kola</Tag>
    </AbsoluteFill>
  );
};

/* ================= Sahne 7 · refraktometre ================= */

/** Okunan değer: önce kahve aralığında bir an duraksar, sonra şekerle birlikte tırmanır. */
const reading = (F: number) => {
  const r = B.refr;
  const a = prog(F, r.count, 12, ease.set) * 1.35;
  const b = prog(F, r.count + 18, r.stop - r.count - 18, ease.time) * (9.6 - 1.35);
  return a + b;
};

export const SceneRefractometer: React.FC<{from: number}> = ({from}) => {
  const F = useF(from);
  const r = B.refr;
  const enter = settle(F, r.start);
  const exit = prog(F, r.exit - 4, 22, ease.exit);
  const dy = (1 - enter) * 900 + exit * 1300;
  const drop = prog(F, r.drop, 16, ease.build);
  const v = reading(F);
  const val = v.toFixed(1).replace('.', ',');
  const scaleX = (x: number) => lerp(330, 750, x / 12);
  const band = prog(F, r.count + 4, 12);
  const pulse = F >= r.stop ? Math.max(0, 1 - (F - r.stop) / 10) : 0;
  return (
    <AbsoluteFill style={{background: color.paper}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(0 ${dy}) translate(540 1000) scale(1.22) translate(-540 -1000)`}>
          {/* pipet ve damla */}
          <g opacity={1 - prog(F, r.drop + 18, 12)}>
            <path d="M 520 260 L 560 260 L 552 480 Q 540 500 528 480 Z" fill={color.ceramic} stroke={color.ink} strokeWidth={4} />
            <rect x={508} y={170} width={64} height={100} rx={18} fill={color.ink} />
          </g>
          {drop < 1 && F >= r.drop - 6 ? <path d={smoothClosed(blob(540, lerp(510, 740, drop), 14, 'drop', 0.1, 8))} fill="#6B3A1E" stroke={color.ink} strokeWidth={2.5} /> : null}
          {/* gövde */}
          <rect x={290 + misregister.x} y={560 + misregister.y} width={500} height={880} rx={90} fill={color.ink} opacity={0.18} />
          <rect x={290} y={560} width={500} height={880} rx={90} fill={color.ceramic} stroke={color.ink} strokeWidth={5} />
          {/* prizma kuyusu */}
          <circle cx={540} cy={760} r={128} fill="#C9C4BA" stroke={color.ink} strokeWidth={5} />
          <circle cx={540} cy={760} r={84} fill="#46545C" stroke={color.ink} strokeWidth={4} />
          {drop >= 1 ? <ellipse cx={540} cy={760} rx={70 * Math.min(1, (F - r.drop - 16) / 8 + 0.4)} ry={50 * Math.min(1, (F - r.drop - 16) / 8 + 0.4)} fill="#6B3A1E" opacity={0.85} /> : null}
          {/* ekran */}
          <rect x={330} y={960} width={420} height={230} rx={22} fill="#E4E8D9" stroke={color.ink} strokeWidth={5} />
          {/* ölçek: kahve aralığı işaretli; gösterge okumayı izler */}
          <line x1={330} y1={1290} x2={750} y2={1290} stroke={color.ink} strokeWidth={4} />
          {Array.from({length: 13}, (_, i) => (
            <line key={i} x1={scaleX(i)} y1={1290} x2={scaleX(i)} y2={i % 2 ? 1302 : 1312} stroke={color.ink} strokeWidth={3} />
          ))}
          <rect x={scaleX(1.2)} y={1270} width={scaleX(1.5) - scaleX(1.2)} height={20} fill={palette.particle} opacity={band} />
          <path d={`M ${scaleX(v)} 1262 l -14 -24 l 28 0 Z`} fill={color.ink} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 540 + (330 - 540) * 1.22, top: 1000 + (960 - 1000) * 1.22 + dy, width: 420 * 1.22, height: 230 * 1.22, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: font.sans, fontWeight: 520, fontSize: 160 * (1 + pulse * 0.06), color: color.ink, letterSpacing: '-0.02em'}}>
        %<Digits value={val} width={0.6} />
      </div>
      <Tag x={540 + (scaleX(1.35) - 540) * 1.22 - 50} y={1000 + (1325 - 1000) * 1.22 + dy} opacity={band * (1 - exit)} size={34}>kahve</Tag>
    </AbsoluteFill>
  );
};

/* ================= Sahne 8 · tat ================= */

const bean = (cx: number, cy: number, s: number) => smoothClosed(blob(cx, cy, 120 * s, 'bean', 0.06, 12).map(([x, y]) => [cx + (x - cx) * 0.78, cy + (y - cy) * 1.08] as P), 0.9);

export const SceneTaste: React.FC<{from: number}> = ({from}) => {
  const F = useF(from);
  const t = B.taste;
  const zig = prog(F, t.start + 2, 18, ease.draw);
  const wave = prog(F, t.seker + 10, 22, ease.draw);
  const soften = prog(F, t.bastirir - 4, 24, ease.move);
  const up = prog(F, t.vanilya + 2, 22, ease.move);
  const pair = prog(F, t.vanilya, 20, ease.set);
  const beanIn = settle(F, t.kavrulmus - 4);
  const braid = prog(F, t.kavrulmus + 6, 50, ease.draw);
  const y0 = 860 - up * 900;
  const zz: P[] = Array.from({length: 15}, (_, i) => [90 + i * 64, y0 + (i % 2 ? -1 : 1) * lerp(130, 26, soften)]);
  const wv: P[] = Array.from({length: 40}, (_, i) => [80 + i * 24, y0 + 30 + Math.sin(i * 0.5 + F * 0.05) * 60]);
  const strand = (side: number): P[] =>
    Array.from({length: 26}, (_, i) => {
      const k = i / 25;
      const x = lerp(side < 0 ? 440 : 780, 540, smoothstep(0, 0.55, k)) + Math.sin(k * 14 + F * 0.06) * 46 * side * smoothstep(0.3, 1, k);
      return [x, lerp(1180, 380, k)];
    });
  return (
    <AbsoluteFill style={{background: color.paper}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <g opacity={1 - up}>
        <path d={soften < 0.5 ? 'M ' + zz.map((q) => q.join(' ')).join(' L ') : smoothOpen(zz)} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - zig} fill="none" stroke={palette.particle} strokeWidth={lerp(9, 6, soften)} strokeLinejoin={soften > 0.5 ? 'round' : 'miter'} />
        <path d={smoothOpen(wv)} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - wave} fill="none" stroke="#E9C98F" strokeWidth={26} strokeLinecap="round" opacity={0.9} />
        <path d={smoothOpen(wv)} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - wave} fill="none" stroke={color.ink} strokeWidth={3} />
        </g>
        {/* vanilya çubuğu ve kavrulmuş çekirdek; aromaları birbirine sarılır */}
        <g opacity={pair} transform={`translate(0 ${(1 - pair) * 120})`}>
          {/* vanilya çubuğu: uzun, kıvrık, boyuna kırışıklı */}
          <path d="M 110 1470 C 180 1360, 330 1210, 470 1120 C 492 1108, 506 1124, 490 1140 C 360 1240, 220 1380, 150 1494 C 138 1512, 104 1494, 110 1470 Z" fill={color.ink} transform={`translate(${misregister.x} ${misregister.y})`} opacity={0.2} />
          <path d="M 110 1470 C 180 1360, 330 1210, 470 1120 C 492 1108, 506 1124, 490 1140 C 360 1240, 220 1380, 150 1494 C 138 1512, 104 1494, 110 1470 Z" fill="#3B2416" stroke={color.ink} strokeWidth={5} />
          <path d="M 140 1478 C 220 1360, 340 1240, 476 1132" fill="none" stroke="#6E4A30" strokeWidth={3} strokeLinecap="round" />
          <path d="M 488 1130 C 512 1104, 528 1090, 548 1080" fill="none" stroke={color.ink} strokeWidth={5} strokeLinecap="round" />
        </g>
        {beanIn > 0.001 ? (
          <g transform={`translate(780 1330) scale(${beanIn}) translate(-780 -1330)`}>
            <path d={bean(780, 1330, 1)} fill={color.ink} transform={`translate(${misregister.x} ${misregister.y})`} opacity={0.2} />
            <path d={bean(780, 1330, 1)} fill="#4A2C1B" stroke={color.ink} strokeWidth={5} />
            <path d="M 772 1214 C 820 1280, 740 1380, 790 1446" fill="none" stroke={color.crease} strokeWidth={9} strokeLinecap="round" />
          </g>
        ) : null}
        <path d={smoothOpen(strand(-1))} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - braid} fill="none" stroke="#D9B26A" strokeWidth={10} strokeLinecap="round" />
        <path d={smoothOpen(strand(1))} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - braid} fill="none" stroke="#8A4B27" strokeWidth={10} strokeLinecap="round" />
      </svg>
      <Tag x={96} y={y0 - 200} opacity={zig * (1 - up)}>acılık</Tag>
      <Tag x={760} y={y0 + 120} opacity={wave * (1 - up)}>şeker</Tag>
      <Tag x={120} y={1560} opacity={pair}>vanilya</Tag>
      <Tag x={640} y={1500} opacity={beanIn}>kavrulmuş kahve</Tag>
    </AbsoluteFill>
  );
};

/* ================= Final · gerçek tadım görüntüsü ================= */

export const FinalFootage: React.FC<{from: number}> = ({from}) => {
  const F = useF(from);
  const fz = B.final;
  const ins = prog(F, fz.inset, fz.insetEnd - fz.inset, ease.move);
  const s = lerp(1, 0.56, ins);
  const top = lerp(0, 150, ins);
  const end2 = fz.clip2 + 81;
  const cr1 = prog(F, fz.start + 6, 10) * (1 - prog(F, fz.clip2 - 8, 8));
  const cr2 = prog(F, fz.clip2 + 4, 10);
  return (
    <AbsoluteFill style={{background: color.paper}}>
      <div style={{position: 'absolute', left: (W - W * s) / 2, top, width: W, height: H, transform: `scale(${s})`, transformOrigin: '0 0'}}>
        {ins > 0 ? <div style={{position: 'absolute', left: misregister.x / s, top: misregister.y / s, width: W, height: H, background: color.ink, opacity: 0.2}} /> : null}
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden', outline: ins > 0 ? `${5 / s}px solid ${color.ink}` : undefined}}>
          <Sequence from={0} durationInFrames={fz.clip2 - fz.start} layout="none">
            <OffthreadVideo src={ext('fin1.mp4')} muted style={{width: W, height: H}} />
          </Sequence>
          <Sequence from={fz.clip2 - fz.start} durationInFrames={81} layout="none">
            <OffthreadVideo src={ext('fin2.mp4')} muted style={{width: W, height: H}} />
          </Sequence>
          {F >= end2 ? <Img src={ext('fin2_son.png')} style={{position: 'absolute', inset: 0, width: W, height: H}} /> : null}
          <Credit lines={[credits.c2]} opacity={cr1} size={40} bottom={330} />
          <Credit lines={[credits.mm]} opacity={cr2} size={40} bottom={330} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================= Sahne 2b · parçacığın içi: kavurmadan kalan gaz ================= */

/** Parçacığa dalış/çıkış: kâğıt parçacık sahnesi bu noktaya doğru büyür, hücre sahnesi buradan açılır. */
export const CELLS_AT: P = [560, 1060];
export const cellsIris = (F: number) => {
  const c = B.cells;
  const open = prog(F, c.in, c.full - c.in, ease.zoom);
  const close = prog(F, c.out, c.end - c.out, ease.zoom);
  const k = open * (1 - close);
  return {r: 2300 * k, k, on: F >= c.in && F < c.end};
};

/** Yüzeyin (kola ile parçacık arasındaki sınırın) yüksekliği; üç noktada aşağı inen dar bir çatlak. */
const CRACKS = [230, 580, 880];
const surfaceY = (x: number) => {
  let y = 900 + Math.sin(x * 0.012) * 34 + Math.sin(x * 0.031 + 1) * 16;
  for (const cx of CRACKS) y += 300 * Math.exp(-Math.pow((x - cx) / 30, 2));
  return y;
};
const SURF: P[] = Array.from({length: 109}, (_, i) => [-20 + i * 10.4, surfaceY(-20 + i * 10.4)]);
const TISSUE = smoothClosed([...SURF, [1120, 2000], [-40, 2000]] as P[], 0.6);
const BIG_CELLS = (() => {
  const out: {d: string; x: number; y: number; r: number; seed: string}[] = [];
  const R = 118;
  const w = Math.sqrt(3) * R;
  const h = 1.5 * R;
  for (let row = 0; row * h < 1200; row++)
    for (let col = -1; col * w < 1180; col++) {
      const seed = `bc${row}-${col}`;
      const x = col * w + (row % 2 ? w / 2 : 0) + (rand(seed + 'x') - 0.5) * 22;
      const y = 860 + row * h + (rand(seed + 'y') - 0.5) * 22;
      out.push({d: smoothClosed(blob(x, y, R * 0.82, seed, 0.12, 10)), x, y, r: R * 0.82, seed});
    }
  return out;
})();

export const SceneCells: React.FC<{from: number}> = ({from}) => {
  const F = useF(from);
  const c = B.cells;
  const p = B.particle;
  const push = lerp(1, 1.14, prog(F, c.in, c.end - c.in, ease.time));
  const drift = prog(F, c.in, c.end - c.in, ease.time) * -40;
  const wall = mix(palette.particle, color.ink, 0.38);
  // gaz cepleri: yüzeye yakın hücrelerden başlayarak şişer
  const pockets = BIG_CELLS.filter((b) => b.y > surfaceY(b.x) + 60).map((b) => {
    const st = c.full - 6 + (b.y - 900) / 1000 * 26 + rand(b.seed + 'g') * 10;
    const g = smoothstep(st, st + 22, F);
    const breathe = 1 + Math.sin(F * 0.16 + rand(b.seed) * 6) * 0.05 * g;
    return {b, g, breathe};
  });
  // kaçış: her çatlaktan, kolaya doğru yükselen kabarcık zinciri
  const escapes: {x: number; y: number; r: number}[] = [];
  // çatlaklara ek olarak yüzeyin başka noktalarından da sızıntı (hücre duvarlarındaki gözenekler)
  const vents = [...CRACKS, 90, 400, 720, 1000];
  vents.forEach((cx, j) => {
    const crack = j < CRACKS.length;
    const per = crack ? 6 + j : 13 + (j % 3) * 3;
    const start = (crack ? c.full + 2 : p.kavurmadan) + j * 3;
    for (let n = 0; n < 60; n++) {
      const birth = start + n * per + rand(`eb${j}${n}`) * 4;
      const age = F - birth;
      if (age < 0 || age > 110) continue;
      const y0 = surfaceY(cx) + (crack ? 120 : 6);
      const y = y0 - Math.pow(age, 1.4) * 3.2;
      const inCrack = y > surfaceY(cx) - 30;
      const x = cx + (inCrack ? Math.sin(age * 0.5 + n) * 4 : Math.sin(age * 0.2 + n) * 14 * Math.min(1, (surfaceY(cx) - y) / 120));
      const r = inCrack ? 13 : lerp(13, 30 + rand(`er${j}${n}`) * 14, smoothstep(0, 200, surfaceY(cx) - y));
      if (y > -40) escapes.push({x, y, r});
    }
  });
  return (
    <AbsoluteFill style={{background: palette.cola, overflow: 'hidden'}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(0 ${drift}) translate(540 960) scale(${push}) translate(-540 -960)`}>
          <WaterField frame={F - B.bus.start} w={W} h={1100} count={620} seed="cellsw" />
          <path d={TISSUE} fill={wall} transform={`translate(${misregister.x} ${misregister.y})`} opacity={0.5} />
          <defs>
            <clipPath id="tissue">
              <path d={TISSUE} />
            </clipPath>
          </defs>
          <g clipPath="url(#tissue)">
            <rect x={-40} y={600} width={W + 80} height={1500} fill={wall} />
            {BIG_CELLS.map((b, i) => (
              <path key={i} d={b.d} fill={palette.particle} />
            ))}
            {pockets.map(({b, g, breathe}, i) =>
              g > 0.01 ? (
                <path key={i} d={smoothClosed(blob(b.x, b.y, b.r * 0.58 * g * breathe, b.seed + 'p', 0.16, 8))} fill="#BFD8E4" stroke={color.ink} strokeWidth={2.6} />
              ) : null,
            )}
          </g>
          <path d={smoothOpen(SURF)} fill="none" stroke={color.ink} strokeWidth={6} strokeLinejoin="round" />
          {escapes.map((e, i) => (
            <g key={i}>
              <circle cx={e.x} cy={e.y} r={e.r} fill="#E2EEF3" stroke={color.ink} strokeWidth={2.6} />
              {e.r > 14 ? <path d={`M ${e.x - e.r * 0.55} ${e.y - e.r * 0.1} A ${e.r * 0.6} ${e.r * 0.6} 0 0 1 ${e.x - e.r * 0.05} ${e.y - e.r * 0.58}`} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" /> : null}
            </g>
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
