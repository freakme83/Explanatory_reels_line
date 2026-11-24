/**
 * REFERANS FİLM — "Kavurma" (onaylı nihai sürüm; zamanlama gerçek dış ses kaydından)
 *
 * Fincan → (kahve yüzeyi çekirdeğe döner) → zaman geri sarılır, yeşil çekirdek →
 * hücreler ve su → ısınma → buhar → çatlama → yarılma → hacim, ağırlık →
 * tat → çekirdek yeniden fincana döner → kapanış.
 *
 * Kalıcı katman yok; ekrandaki her şey script.ts'teki işaretlere bağlıdır.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {canvas, color, margin, type} from '../../system/tokens';
import {ease, jolt, lerp, lerpScale, mix, prog, roastColor, settle} from '../../system/motion';
import {Digits, Fade, Line, Lines} from '../../system/type';
import {textMotion} from '../../system/timing';
import {ASPECT, Bean, BeanCam, OUTLINE, VIEW, creaseAt, type BeanState, type Cam} from './illustration/Bean';
import {Cup} from './illustration/Cup';
import {Split, buildFault} from '../../system/transitions/Split';
import type {P} from '../../system/organic';
import {B, COFFEE_TEMP, HEAT_END_MINUTE, change, copy, tasteLevels, tempAt} from './script';

/* ---------------- Kamera durakları ---------------- */

const C = {x: VIEW.cx, y: VIEW.cy};
const cam = (width: number, at: P, focus: P = [C.x, C.y], rotate = 0): Cam => ({width, at, focus, rotate});

/** Açılış ve kapanış fincanı: büyük, sola ve aşağı taşar (açılış alternatiflerinden seçilen kompozisyon). */
const CUP = cam(940, [470, 1330]);
const CUP_PUSHED = cam(985, [462, 1318]);
const ROASTED = cam(640, [540, 1010], undefined, -6);
const SEED = cam(640 / Math.cbrt(change.volume), [540, 1010], undefined, -6);
const MICRO_A = cam(2400, [540, 1080], [98, 42]);
const HEAT = cam(430, [540, 700]);
const MICRO_B = cam(2400, [540, 1060], [104, 48]);
const GIANT = cam(880, [540, 1050]);

const tween = (a: Cam, b: Cam, t: number): Cam => ({
  width: lerpScale(a.width, b.width, t),
  focus: [lerp(a.focus[0], b.focus[0], t), lerp(a.focus[1], b.focus[1], t)],
  at: [lerp(a.at[0], b.at[0], t), lerp(a.at[1], b.at[1], t)],
  rotate: lerp(a.rotate ?? 0, b.rotate ?? 0, t),
});
const span = (f: number, a: number, b: number, e: (t: number) => number = ease.zoom) => prog(f, a, b - a, e);

const minuteAt = (f: number) => span(f, B.heat.start, B.heat.end, ease.time) * HEAT_END_MINUTE;
const HEAT_END_TEMP = tempAt(HEAT_END_MINUTE);

/* ---------------- Kahraman hattı (açılıştan yarılmaya) ---------------- */

type HeroState = BeanState & {cam: Cam; cupOpen: number};

const heroAt = (f: number): HeroState => {
  const o = B.open;
  // Açılış: fincan, yavaş yaklaşma
  if (f < o.morph) {
    return {cam: tween(CUP, CUP_PUSHED, span(f, 0, o.pushEnd, (t) => t)), cupOpen: 0, temp: COFFEE_TEMP, morph: 0, texture: 0, crease: 0};
  }
  // Kahve yüzeyi → kavrulmuş çekirdek
  if (f < o.morphEnd) {
    const t = span(f, o.morph, o.morphEnd, ease.move);
    return {
      cam: tween(CUP_PUSHED, ROASTED, t),
      cupOpen: span(f, o.morph, o.morphEnd - 6, ease.move),
      temp: COFFEE_TEMP,
      morph: t,
      texture: span(f, o.morph + 10, o.morphEnd, ease.set),
      crease: span(f, o.morph + 14, o.morphEnd + 4, ease.draw),
    };
  }
  const base = {cupOpen: 1, morph: 1, texture: 1, crease: span(f, o.morph + 14, o.morphEnd + 4, ease.draw)};
  // Zaman geri sarılır: kavrulmuş → yeşil, büyük → küçük
  if (f < B.zoomIn1.start) {
    const t = span(f, o.morphEnd, o.rewindEnd, ease.move);
    return {...base, cam: tween(ROASTED, SEED, t), temp: lerp(COFFEE_TEMP, 25, t)};
  }
  const water = f < B.zoomIn2.start ? span(f, B.cells.water, B.cells.water + 42, (t) => t) : 1;
  if (f < B.zoomOut1.start) return {...base, cam: tween(SEED, MICRO_A, span(f, B.zoomIn1.start, B.zoomIn1.end)), temp: 25, water};
  if (f < B.zoomIn2.start) {
    const temp = f < B.heat.start ? 25 : f < B.heat.end ? tempAt(minuteAt(f)) : HEAT_END_TEMP;
    return {...base, cam: tween(MICRO_A, HEAT, span(f, B.zoomOut1.start, B.zoomOut1.end)), temp, water};
  }
  const temp =
    f < B.crack.at
      ? lerp(HEAT_END_TEMP, 196, span(f, B.zoomIn2.start, B.preFigure.landed, (t) => t))
      : lerp(196, 199, span(f, B.crack.at, B.split.at, (t) => t));
  const vapor = span(f, B.vapor.start, B.vapor.end, ease.set);
  const pressure = span(f, B.vapor.pressureStart, B.crack.at, ease.build) * (1 - 0.7 * prog(f, B.crack.at, 24, ease.set));
  const crack = prog(f, B.crack.at, 7, ease.draw);
  const crackAge = f >= B.crack.at ? f - B.crack.at : -1;
  const c = f < B.snap.start ? tween(HEAT, MICRO_B, span(f, B.zoomIn2.start, B.zoomIn2.end)) : tween(MICRO_B, GIANT, span(f, B.snap.start, B.snap.end, ease.snap));
  return {...base, cam: c, temp, water, vapor, pressure, crack, crackAge};
};

const Hero: React.FC = () => {
  const f = useCurrentFrame();
  const {cam: c, cupOpen, ...s} = heroAt(f);
  const shaken: Cam = {...c, at: [c.at[0] + jolt(f, B.crack.at, 16), c.at[1] + jolt(f, B.crack.at + 1, -8)]};
  return (
    <BeanCam cam={shaken}>
      {cupOpen < 1 ? <Cup width={c.width} open={cupOpen} /> : null}
      <div style={{position: 'absolute', inset: 0}}>
        <Bean id="hero" width={c.width} frame={f} {...s} />
      </div>
    </BeanCam>
  );
};

/* ---------------- Isı: sıcaklık ve dakika izleri ---------------- */

const PRINT_W = 56;
const PRINTS = Array.from({length: 10}, (_, k) => k);
const printSlot = (k: number): P => {
  const gap = 28;
  const total = PRINTS.length * PRINT_W + (PRINTS.length - 1) * gap;
  return [canvas.width / 2 - total / 2 + PRINT_W / 2 + k * (PRINT_W + gap), 1082];
};
const printFrame = (k: number) => {
  for (let f = B.heat.start; f <= B.heat.end; f++) if (minuteAt(f) >= k) return f;
  return B.heat.end;
};

const Heat: React.FC = () => {
  const f = useCurrentFrame();
  const temp = Math.round(f < B.heat.start ? 25 : f < B.heat.end ? tempAt(minuteAt(f)) : HEAT_END_TEMP);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, width: canvas.width, top: 1160, display: 'flex', justifyContent: 'center'}}>
        <Line in={B.heat.figIn} out={B.heat.figOut} role="figure">
          <Digits value={String(temp)} />
          <span style={{fontSize: '0.4em', verticalAlign: '1.1em', marginLeft: '0.05em'}}>°C</span>
        </Line>
      </div>
      {PRINTS.map((k) => {
        const at = printFrame(k);
        if (f < at) return null;
        const travel = prog(f, at, 18, ease.move);
        const land = settle(f, at + 14, true);
        const out = prog(f, B.heat.printsOut + k * 2, 12, ease.exit);
        const [sx, sy] = printSlot(k);
        const x = lerp(HEAT.at[0], sx, travel);
        const y = lerp(HEAT.at[1] + 120, sy, travel);
        const w = lerp(HEAT.width * 0.3, PRINT_W, travel) * (0.92 + 0.08 * land);
        const h = w * ASPECT;
        return (
          <svg key={k} width={w} height={h} viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
            style={{position: 'absolute', left: x - w / 2, top: y - h / 2 + out * 30, opacity: Math.min(1, travel * 2.2) * (1 - out)}}>
            <path d={OUTLINE} fill={roastColor(tempAt(k))} />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------------- Eşik: 196°C (dış sesle birlikte) ---------------- */

const PreCrackFigure: React.FC = () => {
  const f = useCurrentFrame();
  const p = B.preFigure;
  if (f < p.in || f > p.out + 16) return null;
  const v = Math.round(lerp(HEAT_END_TEMP, 196, span(f, p.in, p.landed, ease.time)));
  return (
    <div style={{position: 'absolute', left: margin, top: 262}}>
      <Line in={p.in} out={p.out} role="figure">
        <Digits value={String(v)} />
        <span style={{fontSize: '0.4em', verticalAlign: '1.1em', marginLeft: '0.05em'}}>°C</span>
      </Line>
    </div>
  );
};

/* ---------------- Vuruş ---------------- */

const Shout: React.FC = () => {
  const f = useCurrentFrame();
  if (f < B.crack.at || f >= B.crack.shoutOut + 12) return null;
  const s = settle(f, B.crack.at, true);
  const out = prog(f, B.crack.shoutOut, 10, ease.exit);
  return (
    <div style={{position: 'absolute', left: 62, top: 250, ...type.shout, color: color.accent, transformOrigin: 'left bottom',
      transform: `scale(${1.4 - 0.4 * s}) rotate(${-5 * (1 - s)}deg) translateY(${out * 40}px)`, opacity: prog(f, B.crack.at, 3) * (1 - out)}}>
      {copy.shout}
    </div>
  );
};

/* ---------------- Yarılma hattı ---------------- */

const fault = (() => {
  const px = GIANT.width / VIEW.w;
  const spine: P[] = [];
  for (let i = 0; i <= 16; i++) {
    const {p} = creaseAt(i / 16);
    spine.push([GIANT.at[0] + (p[0] - VIEW.cx) * px, GIANT.at[1] + (p[1] - VIEW.cy) * px]);
  }
  const pts = buildFault(spine, 'v3-fault');
  return {pts, origin: pts.indexOf(spine[8])};
})();

/* ---------------- Sonuç: hacim, ağırlık ---------------- */

const VOL_AT: P = [540, 800];
const VOL_W = 400;
const PIVOT: P = [540, 1010];
const ARM = 360;
const ROAST_SMALL = 200 * Math.cbrt(change.volume);
const tiltAt = (f: number) => -7 * settle(f, B.weight.tilt) * (Math.PI / 180);
const beamEnd = (side: -1 | 1, tilt: number): P => [PIVOT[0] + side * ARM * Math.cos(tilt), PIVOT[1] + side * ARM * Math.sin(tilt)];
const onBeam = (side: -1 | 1, w: number, tilt: number): P => {
  const e = beamEnd(side, tilt);
  return [e[0], e[1] - (w * ASPECT) / 2 - 8];
};
const place = (pos: P, w: number): React.CSSProperties => ({position: 'absolute', left: pos[0] - w / 2, top: pos[1] - (w * ASPECT) / 2});

const Figure: React.FC<{inAt: number; out: number; figure: string; unit: string}> = ({inAt, out, figure, unit}) => (
  <div style={{position: 'absolute', left: 0, width: canvas.width, top: 1160, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    <Line in={inAt} out={out} role="figure">
      {figure}
    </Line>
    <Fade in={inAt + 10} out={out}>
      <div style={{...type.unit, color: color.ink, marginTop: 6}}>{unit}</div>
    </Fade>
  </div>
);

const Result: React.FC = () => {
  const f = useCurrentFrame();
  const grow = settle(f, B.volume.grow);
  const roastW0 = VOL_W * lerp(1, Math.cbrt(change.volume), grow);
  const move = prog(f, B.weight.move, 28, ease.move);
  const beam = prog(f, B.weight.beam, 20, ease.draw);
  const tilt = tiltAt(f);
  const exit = prog(f, B.weight.exit, 14, ease.exit);

  const greenW = lerp(VOL_W, 200, move);
  const roastW = lerp(roastW0, ROAST_SMALL, move);
  const gPos: P = [lerp(VOL_AT[0], onBeam(-1, greenW, tilt)[0], move), lerp(VOL_AT[1], onBeam(-1, greenW, tilt)[1], move)];
  const rPos: P = [lerp(VOL_AT[0], onBeam(1, roastW, tilt)[0], move), lerp(VOL_AT[1], onBeam(1, roastW, tilt)[1], move)];
  const ghostDraw = prog(f, B.volume.ghost, 24, ease.draw);
  const roastInk = prog(f, B.volume.roast, 8, ease.set);
  const greenFill = prog(f, B.weight.move, 14, ease.set);
  const gone = f >= B.weight.exit + 16;

  return (
    <AbsoluteFill>
      {!gone ? (
        <AbsoluteFill style={{opacity: 1 - exit, transform: `translateY(${exit * 30}px)`}}>
          {beam > 0 ? (
            <svg width={canvas.width} height={canvas.height} style={{position: 'absolute', inset: 0}}>
              <path
                d={`M ${PIVOT[0]} ${PIVOT[1] + 4} C ${PIVOT[0] - 18} ${PIVOT[1] + 50}, ${PIVOT[0] - 40} ${PIVOT[1] + 78}, ${PIVOT[0] - 52} ${PIVOT[1] + 92} L ${PIVOT[0] + 52} ${PIVOT[1] + 92} C ${PIVOT[0] + 40} ${PIVOT[1] + 78}, ${PIVOT[0] + 18} ${PIVOT[1] + 50}, ${PIVOT[0]} ${PIVOT[1] + 4} Z`}
                fill={color.ink} opacity={beam} />
              <line x1={PIVOT[0] - ARM * beam * Math.cos(tilt)} y1={PIVOT[1] - ARM * beam * Math.sin(tilt)}
                x2={PIVOT[0] + ARM * beam * Math.cos(tilt)} y2={PIVOT[1] + ARM * beam * Math.sin(tilt)}
                stroke={color.ink} strokeWidth={7} strokeLinecap="round" />
            </svg>
          ) : null}
          {f >= B.volume.ghost ? (
            <div style={place(gPos, greenW)}>
              {greenFill > 0 ? (
                <div style={{position: 'absolute', inset: 0, opacity: greenFill}}>
                  <Bean id="green" width={greenW} frame={f} temp={25} />
                </div>
              ) : null}
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* Kavrulmuş çekirdek: terazi çekildiğinde yerinde kalır ve tat bölümüne taşınır */}
      {f >= B.volume.roast && f < B.taste.move ? (
        <div style={{...place(rPos, roastW), opacity: roastInk}}>
          <Bean id="roasted" width={roastW} frame={f} temp={207} crack={0.3} />
        </div>
      ) : null}
      {/* Ghost dış hattı kavrulmuş çekirdeğin üstünde kalsın diye ayrı katman */}
      {f >= B.volume.ghost && f < B.weight.move + 14 ? (
        <div style={{...place(gPos, greenW), opacity: 1 - greenFill}}>
          <Bean id="ghost-top" width={greenW} frame={f} temp={25} ghost={{tone: roastColor(25), draw: ghostDraw}} />
        </div>
      ) : null}

      {f < B.weight.move ? (
        <Figure inAt={B.volume.figIn} out={B.volume.figOut} figure={copy.volume.figure} unit={copy.volume.unit} />
      ) : f < B.weight.exit + 20 ? (
        <Figure inAt={B.weight.figIn} out={B.weight.figOut} figure={copy.weight.figure} unit={copy.weight.unit} />
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------------- Tat ve kapanış: aynı kavrulmuş çekirdek ---------------- */

const TASTE: P = [540, 830];
const TASTE_W = 420;

const tasteTemp = (f: number) => {
  let t = 207;
  tasteLevels.forEach((l, i) => {
    const s = B.taste.words[i].in - 10;
    t = lerp(t, l.temp, prog(f, s, 16, ease.move));
  });
  return t;
};

const Finale: React.FC = () => {
  const f = useCurrentFrame();
  const restPos = onBeam(1, ROAST_SMALL, tiltAt(B.taste.move));
  const m = prog(f, B.taste.move, B.taste.moveEnd - B.taste.move, ease.move);
  const pos: P = [lerp(restPos[0], TASTE[0], m), lerp(restPos[1], TASTE[1], m)];
  const width = lerp(ROAST_SMALL, TASTE_W, m);
  const close = prog(f, B.close.morph, B.close.morphEnd - B.close.morph, ease.move);

  const c: Cam = close > 0 ? tween(cam(width, pos), CUP, close) : cam(width, pos);
  const temp = lerp(tasteTemp(f), COFFEE_TEMP, close);
  return (
    <AbsoluteFill>
      <BeanCam cam={c}>
        {close > 0 ? <Cup width={c.width} open={1 - prog(f, B.close.morph + 6, B.close.morphEnd - B.close.morph - 6, ease.move)} /> : null}
        <div style={{position: 'absolute', inset: 0}}>
          <Bean id="finale" width={c.width} frame={f} temp={temp} morph={1 - close} texture={1 - prog(f, B.close.morph, 30, ease.set)}
            crease={1 - prog(f, B.close.morph, 26, ease.move)} crack={0.3 * (1 - close)} />
        </div>
      </BeanCam>
      {tasteLevels.map((l, i) => (
        <div key={l.word} style={{position: 'absolute', left: 0, width: canvas.width, top: 1210, display: 'flex', justifyContent: 'center'}}>
          <Line in={B.taste.words[i].in} out={B.taste.words[i].out} role="word" duration={textMotion.setWord}>
            {l.word}
          </Line>
        </div>
      ))}
      <div style={{position: 'absolute', left: margin, top: 300}}>
        <Lines in={B.close.text.in} out={B.close.text.out + 100} lines={copy.closing} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- Açılış sorusu ---------------- */

/** İlk karede tamamen görünür (dizgi animasyonu yok); görevini bitirince maskenin altına iner. */
const Q_SIZE = 138;
const OpeningQuestion: React.FC = () => {
  const f = useCurrentFrame();
  const out = prog(f, B.open.q.out, 14, ease.exit);
  if (out >= 1) return null;
  const st = {...type.statement, fontSize: Q_SIZE, lineHeight: 1.0, fontWeight: 420, color: ICE_TEXT, whiteSpace: 'nowrap' as const};
  return (
    <div style={{position: 'absolute', left: margin, top: 300}}>
      {copy.question.map((l, i) => (
        <div key={l} style={{clipPath: `inset(-${2 * Q_SIZE}px -${Q_SIZE}px -${Math.round(Q_SIZE * 0.16)}px -${Q_SIZE}px)`}}>
          <div style={{...st, transform: `translateY(${prog(f, B.open.q.out + i * 2, 14, ease.exit) * 1.3}em)`}}>{l}</div>
        </div>
      ))}
    </div>
  );
};

/* ---------------- Sayfa rengi ---------------- */

/** Açılış ve kapanış zemini: buz mavisi. Fincan çekirdeğe dönerken kreme, finalde geri buz mavisine. */
const ICE = '#C3DDEA';
const ICE_TEXT = '#3B2416';
const paperAt = (f: number) => {
  if (f < B.split.at) {
    const warm = mix(color.cream, color.sand, span(f, B.heat.start, B.heat.end, ease.time));
    return mix(ICE, warm, span(f, B.open.morph, B.open.morphEnd, ease.move));
  }
  return mix(color.blue, ICE, span(f, B.close.morph, B.close.morphEnd, ease.move));
};

/* ---------------- Film ---------------- */

export const KavurmaFilm: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill lang="tr" style={{background: paperAt(f)}}>
      {f >= B.split.at ? <Result /> : null}
      {f >= B.taste.move ? <Finale /> : null}

      {f < B.split.at + 40 ? (
        <Split at={B.split.at} fault={fault.pts} originIndex={fault.origin}>
          {f >= B.split.at - 2 ? <AbsoluteFill style={{background: paperAt(B.split.at - 1)}} /> : null}
          <Hero />
          <Shout />
        </Split>
      ) : null}

      <OpeningQuestion />
      <PreCrackFigure />
      <div style={{position: 'absolute', right: margin, top: 318}}>
        <Lines in={B.cells.text.in} out={B.cells.text.out} lines={copy.cells} align="right" />
      </div>
      {f >= B.heat.figIn - 1 && f < B.heat.figOut + 20 ? <Heat /> : null}
      <div style={{position: 'absolute', left: margin, top: 318}}>
        <Lines in={B.vapor.text.in} out={B.vapor.text.out} lines={copy.vapor} />
      </div>
    </AbsoluteFill>
  );
};
