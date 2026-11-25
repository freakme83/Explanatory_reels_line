/**
 * KOLA + V60 — iki kritik sahne (stil kareleri bu bileşenlerden render edilir; üretimde aynen kullanılır)
 *
 * Sahne 4 · "Dolu otobüs": izleyicinin sezgisi (koltuklar dolar, kapı kapanır, kahve dışarıda kalır),
 *   kısa sessizlik, "Kalır." → koltuklar suya erir, moleküller serbest kalır, kahve aroması içeri sızar.
 * Sahne 5 · "Fark": solda kahve parçacığının hücreleri, sağda kola. Kahveye özgü bileşikler bol bir akışla
 *   kolaya geçer; kafein seyrek geçer, kolada zaten bir miktar kafein var.
 * Kareler yerel (sahne başından); film zaman çizelgesine dış ses kaydından sonra bağlanır.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {canvas, color, margin, type} from '../../system/tokens';
import {ease, lerp, mix, prog, settle} from '../../system/motion';
import {rand, smoothClosed, smoothOpen, type P} from '../../system/organic';
import {Aroma, Caffeine, Sugar, WaterField, palette, scatter, wiggle} from './molecules';

const W = canvas.width;
const H = canvas.height;

const Tag: React.FC<{x: number; y: number; children: React.ReactNode; opacity?: number; light?: boolean}> = ({x, y, children, opacity = 1, light}) => (
  <div style={{position: 'absolute', left: x, top: y, ...type.unit, fontSize: 34, color: light ? color.paper : color.ink, opacity}}>{children}</div>
);

/* ================= Sahne 4 · Dolu otobüs ================= */

export const S4 = {seats: 0, door: 40, silence: 52, answer: 74, melt: 78, slip: 86, total: 180} as const;

const COLS = 3;
const ROWS = 4;
const SEAT0: P = [210, 640];
const SEAT_DX = 255;
const SEAT_DY = 235;
const SZ = 1.55; // koltuk ölçeği
const seatCenter = (i: number): P => [SEAT0[0] + (i % COLS) * SEAT_DX, SEAT0[1] + Math.floor(i / COLS) * SEAT_DY];

/** Koltuk ana hattı (sırtlık + oturak), m=1'de dalgalı bir su çizgisine dönüşür. */
const seatPath = (c: P, m: number, frame: number, seed: number) => {
  const [cx, cy] = c;
  const outline: P[] = ([
    [-46, 26], [-50, -40], [-40, -58], [40, -58], [50, -40],
    [46, 26], [64, 34], [60, 56], [-60, 56], [-64, 34],
  ] as P[]).map(([x, y]) => [cx + x * SZ, cy + y * SZ] as P);
  const wave: P[] = outline.map((_, k) => {
    const t = k < 5 ? k / 4 : (9 - k) / 4;
    const x = cx - 110 + t * 220;
    return [x, cy + 30 + Math.sin(t * Math.PI * 2 + frame * 0.12 + seed * 6) * 9 + (k < 5 ? -1.5 : 1.5)];
  });
  return smoothClosed(outline.map((p, k) => [lerp(p[0], wave[k][0], m), lerp(p[1], wave[k][1], m)] as P), lerp(0.35, 1, m));
};

export const SceneBus: React.FC = () => {
  const f = useCurrentFrame();
  const melt = prog(f, S4.melt, 34, ease.move);
  const door = prog(f, S4.door, 10, ease.snap);
  const sugarSeats = Array.from({length: COLS * ROWS}, (_, i) => i);
  const free = scatter(12, [130, 560, 880, 1480], 'free4');
  const standing = scatter(10, [110, 560, 860, 1500], 'stand4');
  const caff = scatter(3, [140, 600, 860, 1450], 'caf4');

  // kahve aroması: kapıya gelir, kapı yüzüne kapanır, "Kalır." ile içeri sızar
  const arrive = settle(f, 22, true);
  const bump = f >= S4.door + 8 && f < S4.door + 16 ? Math.sin(((f - S4.door - 8) / 8) * Math.PI) * -18 : 0;
  const slip = prog(f, S4.slip, 44, ease.move);
  const outside: P = [lerp(1160, 1042, arrive) + bump, 900];
  const path: P[] = [outside, [930, 960], [830, 1010], [700, 990], [600, 930]];
  const k = slip * (path.length - 1);
  const i0 = Math.min(path.length - 2, Math.floor(k));
  const aroma: P = slip === 0 ? outside : [lerp(path[i0][0], path[i0 + 1][0], k - i0), lerp(path[i0][1], path[i0 + 1][1], k - i0)];
  const [aw, ah] = wiggle(0.77, f, 2.5);

  const shoutS = settle(f, S4.answer, true);

  return (
    <AbsoluteFill style={{background: palette.cola}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <WaterField frame={f} w={W} h={H} />

        {/* koltuklar */}
        {sugarSeats.map((i) => {
          const c = seatCenter(i);
          const appear = settle(f, S4.seats + i * 1.2, true);
          if (appear <= 0.001) return null;
          return (
            <g key={i} transform={`translate(${c[0]} ${c[1]}) scale(${0.85 + 0.15 * appear}) translate(${-c[0]} ${-c[1]})`} opacity={Math.min(1, appear * 1.4)}>
              <path d={seatPath(c, melt, f, rand(`seat${i}`))} fill={mix(palette.seat, palette.cola, melt)} fillOpacity={1 - melt * 0.9}
                stroke={melt > 0.6 ? mix(color.ink, palette.water, (melt - 0.6) / 0.4) : color.ink} strokeWidth={4} strokeLinejoin="round" />
              {/* sırtlık ile oturak arasındaki dikiş: koltuğu koltuk yapan çizgi */}
              <path d={`M ${c[0] - 66} ${c[1] + 40} Q ${c[0]} ${c[1] + 48} ${c[0] + 66} ${c[1] + 40}`} fill="none" stroke={color.ink} strokeWidth={3} opacity={1 - melt} />
            </g>
          );
        })}

        {/* kapı: iki kanat kapanır; erime anında kanatlar da çözülür */}
        {[-1, 1].map((side) => {
          const x = 968 + side * lerp(62, 25, door);
          const op = 1 - melt;
          return (
            <g key={side} opacity={op}>
              <rect x={x - 25} y={720} width={50} height={300} rx={12} fill={palette.seat} stroke={color.ink} strokeWidth={4} />
              <rect x={x - 14} y={746} width={28} height={110} rx={7} fill={palette.cola} stroke={color.ink} strokeWidth={2.6} />
            </g>
          );
        })}

        {/* şeker: önce koltuklara oturur, sonra serbest kalır */}
        {sugarSeats.map((i) => {
          const [sx, sy] = seatCenter(i);
          const start = free[i];
          const sit = settle(f, 6 + i * 1.3);
          const [wx, wy] = wiggle(rand(`s4${i}`), f, lerp(0.6, 4, melt));
          const seated: P = [sx, sy - 8];
          const loose: P = [lerp(seated[0], start.x, melt), lerp(seated[1], start.y, melt)];
          const p: P = melt > 0 ? loose : [lerp(start.x, seated[0], sit), lerp(start.y, seated[1], sit)];
          return <Sugar key={i} x={p[0] + wx} y={p[1] + wy} r={34} rot={rand(`r4${i}`) * 2 + f * 0.004 * (melt * 2 - 0.3)} />;
        })}
        {standing.map((s, i) => {
          // koridordakiler: koltukların arasında, ayakta (kalabalık hissi)
          const [wx, wy] = wiggle(s.s, f, 3);
          const ax = SEAT0[0] + SEAT_DX * (0.5 + (i % 2)) + (s.s - 0.5) * 40;
          const ay = s.y;
          return <Sugar key={`st${i}`} x={lerp(ax, s.x, melt) + wx} y={ay + wy} r={30} rot={s.s * 3} />;
        })}
        {caff.map((s, i) => {
          const [wx, wy] = wiggle(s.s + 0.3, f, 3);
          return <Caffeine key={`c${i}`} x={s.x + wx} y={s.y + wy} r={24} rot={s.s * 2} />;
        })}

        {/* kahve aroması (filmin küçük kahramanı) */}
        <Aroma x={aroma[0] + aw} y={aroma[1] + ah} r={24} seed="hero-aroma" />
      </svg>

      {f >= S4.answer ? (
        <div style={{position: 'absolute', left: margin - 12, top: 262, ...type.shout, fontSize: 260, color: color.accent, transformOrigin: 'left bottom',
          transform: `scale(${1.3 - 0.3 * shoutS})`, opacity: prog(f, S4.answer, 3)}}>
          Kalır.
        </div>
      ) : null}
      <Tag x={margin} y={1640} opacity={0.55}>temsili</Tag>
    </AbsoluteFill>
  );
};

/* ================= Sahne 5 · Fark ================= */

export const S5 = {total: 210} as const;

const edgeX = (y: number) => 430 + Math.sin(y * 0.006 + 0.4) * 38 + Math.sin(y * 0.017 + 1.3) * 16;

const PARTICLE_PATH = (() => {
  const pts: P[] = [[-40, -40]];
  for (let y = -40; y <= H + 40; y += 24) pts.push([edgeX(y), y]);
  pts.push([-40, H + 40]);
  return smoothClosed(pts, 0.5);
})();

/** Parçacığın içi: Kavurma'daki gibi petek hücreler (duvarlar koyu, hücreler kavrulmuş kahve). */
const CELLS = (() => {
  const out: {x: number; y: number; d: string; seed: number}[] = [];
  const R = 54;
  const w = Math.sqrt(3) * R;
  const h = 1.5 * R;
  for (let row = -1; row * h < H + h; row++)
    for (let col = -1; col * w < 560; col++) {
      const s = `pc${row}-${col}`;
      const x = col * w + (row % 2 ? w / 2 : 0) + (rand(s + 'x') - 0.5) * 16;
      const y = row * h + (rand(s + 'y') - 0.5) * 16;
      const pts: P[] = Array.from({length: 9}, (_, k) => {
        const a = rand(s + 'r') * 6 + (k / 9) * Math.PI * 2;
        const rr = R * 0.8 * (1 + (rand(`${s}${k}`) - 0.5) * 0.26);
        return [x + Math.cos(a) * rr, y + Math.sin(a) * rr];
      });
      out.push({x, y, d: smoothClosed(pts), seed: rand(s)});
    }
  return out;
})();

type Flow = {y0: number; bend: number; speed: number; phase: number; seed: string};
const aromaFlows: Flow[] = Array.from({length: 22}, (_, i) => ({
  y0: 560 + (i / 22) * 900 + (rand(`af${i}`) - 0.5) * 30,
  bend: (rand(`ab${i}`) - 0.5) * 160,
  speed: 0.0055 + rand(`as${i}`) * 0.003,
  phase: rand(`ap${i}`),
  seed: `aflow${i}`,
}));
const caffFlows: Flow[] = [0, 1].map((i) => ({y0: 1180 + i * 220, bend: (i - 0.5) * 60, speed: 0.0016, phase: 0.12 + i * 0.13, seed: `cflow${i}`}));

const along = (fl: Flow, t: number): P => {
  const x0 = edgeX(fl.y0) - 60;
  const x = x0 + t * (W + 80 - x0);
  return [x, fl.y0 + Math.sin(t * Math.PI) * fl.bend * t];
};

export const SceneGradient: React.FC = () => {
  const f = useCurrentFrame();
  const intro = prog(f, 0, 24, ease.set);
  const sugar = scatter(12, [580, 500, 1010, 1520], 'sug5');
  const colaCaff = scatter(4, [620, 560, 990, 1500], 'caf5');
  const inside = scatter(24, [40, 500, 380, 1540], 'in5');
  const wall = mix(palette.particle, color.ink, 0.38);

  return (
    <AbsoluteFill style={{background: palette.cola}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <defs>
          <clipPath id="particle5">
            <path d={PARTICLE_PATH} />
          </clipPath>
          <clipPath id="cola5">
            <path d={`M ${W + 40} -40 L ${W + 40} ${H + 40} ${PARTICLE_PATH.replace(/^M/, 'L')}`} />
          </clipPath>
        </defs>

        <WaterField frame={f} w={W} h={H} />

        {/* parçacık: kayık basılmış dolgu, petek hücreler, fırça kontur */}
        <path d={PARTICLE_PATH} fill={wall} transform="translate(9 7)" />
        <g clipPath="url(#particle5)">
          <rect x={-40} y={-40} width={W} height={H + 80} fill={wall} />
          {CELLS.map((c, i) => (
            <path key={i} d={c.d} fill={palette.particle} />
          ))}
          {inside.map((s, i) => {
            const [wx, wy] = wiggle(s.s, f, 2);
            return i % 6 === 5 ? (
              <Caffeine key={i} x={s.x + wx} y={s.y + wy} r={20} rot={s.s * 3} />
            ) : (
              <Aroma key={i} x={s.x + wx} y={s.y + wy} r={17} seed={`in${i}`} />
            );
          })}
        </g>
        <path d={smoothOpen(Array.from({length: 90}, (_, k) => [edgeX(-40 + k * 24), -40 + k * 24] as P))} fill="none" stroke={color.ink} strokeWidth={6} />

        {/* kola: şeker kalabalığı ve koladaki mevcut kafein */}
        {sugar.map((s, i) => {
          const [wx, wy] = wiggle(s.s, f, 3);
          return <Sugar key={i} x={s.x + wx} y={s.y + wy} r={30} rot={s.s * 4} />;
        })}
        {colaCaff.map((s, i) => {
          const [wx, wy] = wiggle(s.s + 0.2, f, 3);
          return <Caffeine key={`cc${i}`} x={s.x + wx} y={s.y + wy} r={22} rot={s.s * 2} />;
        })}

        {/* akışlar: hızlı ve bol (kahveye özgü bileşikler) · yavaş ve seyrek (kafein) */}
        <g clipPath="url(#cola5)" opacity={intro}>
          {aromaFlows.map((fl, i) => {
            const t = (f * fl.speed + fl.phase) % 1;
            const [x, y] = along(fl, t);
            const trail = [0.035, 0.07, 0.105, 0.14].map((d) => along(fl, Math.max(0, t - d)));
            return (
              <g key={i}>
                {trail.map(([tx, ty], j) => (
                  <circle key={j} cx={tx} cy={ty} r={4.5 - j} fill={color.ink} opacity={0.4 - j * 0.08} />
                ))}
                <Aroma x={x} y={y} r={16} seed={fl.seed} />
              </g>
            );
          })}
          {caffFlows.map((fl, i) => {
            const t = (f * fl.speed + fl.phase) % 0.45;
            const [x, y] = along(fl, t);
            const trail = [0.02, 0.04].map((d) => along(fl, Math.max(0, t - d)));
            return (
              <g key={i}>
                {trail.map(([tx, ty], j) => (
                  <circle key={j} cx={tx} cy={ty} r={4 - j} fill={color.ink} opacity={0.35 - j * 0.1} />
                ))}
                <Caffeine x={x} y={y} r={22} rot={0.4 + i} />
              </g>
            );
          })}
        </g>
      </svg>

      <Tag x={margin} y={420} opacity={intro} light>kahve</Tag>
      <Tag x={W - margin - 70} y={420} opacity={intro}>kola</Tag>
      <Tag x={540} y={1470} opacity={intro}>kafein · kolada da var</Tag>
      <Tag x={W - margin - 110} y={1660} opacity={0.55 * intro}>temsili</Tag>
    </AbsoluteFill>
  );
};
