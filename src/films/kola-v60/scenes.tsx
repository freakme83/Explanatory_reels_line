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
import {ease, lerp, mix, prog, settle, smoothstep} from '../../system/motion';
import {rand, smoothClosed, smoothOpen, type P} from '../../system/organic';
import {Aroma, Caffeine, Sugar, WaterField, palette, scatter, wiggle} from './molecules';

const W = canvas.width;
const H = canvas.height;

const Tag: React.FC<{x: number; y: number; children: React.ReactNode; opacity?: number; light?: boolean}> = ({x, y, children, opacity = 1, light}) => (
  <div style={{position: 'absolute', left: x, top: y, ...type.unit, fontSize: 34, color: light ? color.paper : color.ink, opacity}}>{children}</div>
);

/* ================= Sahne 4 · Dolu otobüs ================= */

/** Yerel kareler (Sahne 4 başından). Kapı "kalır mı?" sorusunun son hecesinde kapanır; ~0,6 sn sessizlik; "Kalır." */
export const S4 = {seats: 0, rush: 34, door: 48, hit: 58, answer: 86, melt: 90, slip: 98, shoutOut: 136, total: 219} as const;

const DOOR_X = 885;
const DOOR_SHUT = DOOR_X + 50; // kapalı kapının dış kenarı
const HERO_R = 40;
const HERO_Y = 900;

const COLS = 3;
const ROWS = 4;
const SEAT0: P = [190, 640];
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

/** Sahne 4'ün ilk karesindeki kalabalık (Sahne 3 bu konumlarda kurulur, kesme görünmez). */
export const busCrowd = () => {
  const free = scatter(12, [130, 560, 880, 1480], 'free4');
  const standing = scatter(10, [110, 560, 860, 1500], 'stand4').map((s, i) => ({x: SEAT0[0] + SEAT_DX * (0.5 + (i % 2)) + (s.s - 0.5) * 40, y: s.y, s: s.s}));
  const caff = scatter(3, [140, 600, 860, 1450], 'caf4');
  return {
    sugars: free.map((p, i) => ({x: p.x, y: p.y, r: 34, rot: rand(`r4${i}`) * 2, wseed: rand(`s4${i}`), wamp: 0.6})),
    standing: standing.map((p) => ({x: p.x, y: p.y, r: 30, rot: p.s * 3, wseed: p.s, wamp: 3})),
    caff: caff.map((p) => ({x: p.x, y: p.y, r: 24, rot: p.s * 2, wseed: p.s + 0.3, wamp: 3})),
  };
};

export const SceneBus: React.FC = () => {
  const f = useCurrentFrame();
  const melt = prog(f, S4.melt, 34, ease.move);
  const door = prog(f, S4.door, 9, ease.snap);
  const sugarSeats = Array.from({length: COLS * ROWS}, (_, i) => i);
  const free = scatter(12, [130, 560, 880, 1480], 'free4');
  const standing = scatter(10, [110, 560, 860, 1500], 'stand4');
  const caff = scatter(3, [140, 600, 860, 1450], 'caf4');

  // kahve aroması: kadraj dışından koşarak gelir, kapı burnunun dibinde kapanır, kapıya çarpar,
  // ezilip geri seker ve kapıya yapışık bekler; "Kalır." ile içeri sızar
  const rush = prog(f, S4.rush, S4.hit - S4.rush, ease.build);
  const u = f - S4.hit;
  const squash = u >= 0 ? 0.34 * Math.exp(-u / 4.5) * Math.cos(u * 0.75) : 0;
  const sx = u >= 0 ? 1 - squash : 1 + 0.14 * rush; // koşarken hafif uzar, çarpınca yassılaşır
  const sy = u >= 0 ? 1 + squash * 0.7 : 1 - 0.08 * rush;
  const recoil = u >= 0 && u < 12 ? Math.sin((u / 12) * Math.PI) * 20 : 0;
  const rest = DOOR_SHUT + HERO_R * sx + 2;
  const outside: P = [u >= 0 ? rest + recoil : lerp(1150, DOOR_SHUT + HERO_R + 2, rush), HERO_Y];
  const slip = prog(f, S4.slip, 44, ease.move);
  const path: P[] = [outside, [900, 915], [810, 880], [720, 850], [650, 840]];
  const k = slip * (path.length - 1);
  const i0 = Math.min(path.length - 2, Math.floor(k));
  const aroma: P = slip === 0 ? outside : [lerp(path[i0][0], path[i0 + 1][0], k - i0), lerp(path[i0][1], path[i0 + 1][1], k - i0)];
  const [aw, ah] = u >= 0 ? wiggle(0.77, f, 2) : [0, 0];
  // hız çizgileri (koşu) ve çarpma izleri (kapıya değdiği an); ikisi de işini bitirince çekilir
  const speedOp = f < S4.hit ? rush : 1 - prog(f, S4.hit, 6);
  const hitOp = u >= 0 ? 1 - prog(f, S4.hit + 10, 16) : 0;

  const shoutS = settle(f, S4.answer, true);
  const shoutOut = prog(f, S4.shoutOut, 14, ease.exit);

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
          const x = DOOR_X + side * lerp(62, 25, door);
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
        {speedOp > 0.01 && slip === 0
          ? [-17, 0, 17].map((dy, j) => (
              <line key={j} x1={aroma[0] + HERO_R + 14 + j * 6} y1={HERO_Y + dy} x2={aroma[0] + HERO_R + 58 + j * 14 - Math.abs(dy)} y2={HERO_Y + dy}
                stroke={color.ink} strokeWidth={4} strokeLinecap="round" opacity={speedOp * (0.75 - j * 0.12)} />
            ))
          : null}
        {hitOp > 0.01
          ? [-78, -52, 52, 78].map((deg, j) => {
              // kapıyla temas noktasından, kahramanın üstüne ve altına açılan kısa çarpma çizgileri
              const a = (deg * Math.PI) / 180;
              const r0 = HERO_R + 16;
              const r1 = r0 + 24;
              return (
                <line key={j} x1={DOOR_SHUT + Math.cos(a) * r0} y1={HERO_Y + Math.sin(a) * r0} x2={DOOR_SHUT + Math.cos(a) * r1} y2={HERO_Y + Math.sin(a) * r1}
                  stroke={color.ink} strokeWidth={4} strokeLinecap="round" opacity={hitOp} />
              );
            })
          : null}
        <g transform={`translate(${aroma[0] + aw} ${aroma[1] + ah}) scale(${sx} ${sy}) translate(${-(aroma[0] + aw)} ${-(aroma[1] + ah)})`}>
          <Aroma x={aroma[0] + aw} y={aroma[1] + ah} r={HERO_R} seed="hero-aroma" />
        </g>
      </svg>

      {f >= S4.answer && shoutOut < 1 ? (
        <div style={{position: 'absolute', left: margin - 12, top: 262, ...type.shout, fontSize: 260, color: color.accent, transformOrigin: 'left bottom',
          transform: `translateY(${shoutOut * 60}px) scale(${1.3 - 0.3 * shoutS})`, opacity: prog(f, S4.answer, 3) * (1 - shoutOut)}}>
          Kalır.
        </div>
      ) : null}
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
const aromaFlows: Flow[] = Array.from({length: 28}, (_, i) => ({
  y0: 640 + (i / 28) * 560 + (rand(`af${i}`) - 0.5) * 26,
  bend: (rand(`ab${i}`) - 0.5) * 220,
  speed: 0.006 + rand(`as${i}`) * 0.003,
  phase: rand(`ap${i}`),
  seed: `aflow${i}`,
}));
const caffFlows: Flow[] = [{y0: 1385, bend: -30, speed: 0.0011, phase: 0, seed: 'cflow0'}];

/** Parçacık sınırından çıkarken belirme (yarım kesik şekil yok): sınırın r kadar içinden itibaren görünür. */
const outOf = (x: number, y: number, r: number) => smoothstep(-r * 0.6, r * 0.6 + 14, x - edgeX(y));

/** Akış yolu: sınırdan çıkarken hızlı, kolada yayıldıkça yavaşlar (difüzyon); her molekül kendi küçük salınımıyla. */
const along = (fl: Flow, t: number, T = 0): P => {
  const x0 = edgeX(fl.y0) - 60;
  const u = 1 - Math.pow(1 - t, 1.55);
  const x = x0 + u * (W + 80 - x0);
  const ph = fl.phase * 17;
  return [x, fl.y0 + Math.sin(u * Math.PI) * fl.bend * u + Math.sin(u * 7 + ph + T * 0.035) * 16 * u];
};

/** Yavaşlayan zaman: [from, to] aralığında hız 1'den `floor`a iner; konumlar bu zamanla ilerler (kesintisiz). */
const warp = (f: number, from: number, to: number, floor: number) => {
  if (f <= from) return f;
  let T = from;
  for (let k = from; k < f; k++) T += 1 - (1 - floor) * smoothstep(from, to, k);
  return T;
};

export const SceneGradient: React.FC<{kafTag?: number; slowFrom?: number; slowTo?: number}> = ({kafTag = 0, slowFrom = 1e9, slowTo = 1e9}) => {
  const f = useCurrentFrame();
  const intro = prog(f, 0, 24, ease.set);
  const T = warp(f, slowFrom, slowTo, 0.28); // soğuk ve şekerli: her şey yavaşlar
  const cold = smoothstep(slowFrom, slowTo, f);
  const amp = 1 - 0.55 * cold;
  const sugar = scatter(12, [580, 500, 1010, 1290], 'sug5');
  const colaCaff = [{x: 720, y: 1335, s: 0.21}, {x: 852, y: 1418, s: 0.63}, {x: 978, y: 1342, s: 0.4}]; // kolada zaten var: alt bölgede, sakin
  const inside = scatter(24, [40, 500, 380, 1540], 'in5');
  const wall = mix(palette.particle, color.ink, 0.38);

  return (
    <AbsoluteFill style={{background: mix(palette.cola, palette.coldCola, cold)}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <defs>
          <clipPath id="particle5">
            <path d={PARTICLE_PATH} />
          </clipPath>
        </defs>

        <WaterField frame={T} w={W} h={H} />

        {/* parçacık: kayık basılmış dolgu, petek hücreler, fırça kontur */}
        <path d={PARTICLE_PATH} fill={wall} transform="translate(9 7)" />
        <g clipPath="url(#particle5)">
          <rect x={-40} y={-40} width={W} height={H + 80} fill={wall} />
          {CELLS.map((c, i) => (
            <path key={i} d={c.d} fill={palette.particle} />
          ))}
          {inside.map((s, i) => {
            const [wx, wy] = wiggle(s.s, T, 2 * amp);
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
          const [wx, wy] = wiggle(s.s, T, 3 * amp);
          return <Sugar key={i} x={s.x + wx} y={s.y + wy} r={27} rot={s.s * 4} />;
        })}
        {colaCaff.map((s, i) => {
          const [wx, wy] = wiggle(s.s + 0.2, T, 3 * amp);
          return <Caffeine key={`cc${i}`} x={s.x + wx} y={s.y + wy} r={19} rot={s.s * 2} />;
        })}

        {/* akışlar: hızlı ve bol (kahveye özgü bileşikler) · yavaş ve seyrek (kafein) */}
        <g opacity={intro}>
          {aromaFlows.map((fl, i) => {
            const t = (T * fl.speed + fl.phase) % 1;
            const [x, y] = along(fl, t, T);
            const trail = [0.03, 0.06, 0.09, 0.12, 0.15].map((d) => along(fl, Math.max(0, t - d), T));
            return (
              <g key={i}>
                {trail.map(([tx, ty], j) => (
                  <circle key={j} cx={tx} cy={ty} r={6 - j} fill={color.ink} opacity={(0.6 - j * 0.1) * outOf(tx, ty, 0)} />
                ))}
                <Aroma x={x} y={y} r={21} seed={fl.seed} opacity={outOf(x, y, 21)} />
              </g>
            );
          })}
          {caffFlows.map((fl, i) => {
            const t = (T * fl.speed + fl.phase) % 0.4;
            const [x, y] = along(fl, t, T);
            return (
              <g key={i}>
                <circle cx={along(fl, Math.max(0, t - 0.025))[0]} cy={along(fl, Math.max(0, t - 0.025))[1]} r={3} fill={color.ink} opacity={0.3 * outOf(x, y, 0)} />
                <Caffeine x={x} y={y} r={19} rot={0.4 + i} opacity={outOf(x, y, 19)} />
              </g>
            );
          })}
        </g>
      </svg>

      <Tag x={margin} y={420} opacity={intro} light>kahve</Tag>
      <Tag x={W - margin - 70} y={420} opacity={intro}>kola</Tag>
      <Tag x={560} y={1462} opacity={prog(f, kafTag, 14)}>kafein · kolada da var</Tag>
    </AbsoluteFill>
  );
};
