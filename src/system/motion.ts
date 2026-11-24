/**
 * SİSTEM — hareket
 *
 * Hareket bir bilgiyi taşır ya da yoktur. Süzülme, nefes, dekoratif döngü yok.
 * Her öğe: girer → görevini yapar → durur (sindirme payı) → çıkar.
 */
import {Easing, interpolate, interpolateColors, spring} from 'remotion';
import {canvas, color, roastScale} from './tokens';

export const ease = {
  set: Easing.bezier(0.16, 0.84, 0.24, 1),
  move: Easing.bezier(0.65, 0, 0.3, 1),
  exit: Easing.bezier(0.6, 0, 0.85, 0.3),
  draw: Easing.bezier(0.4, 0, 0.12, 1),
  time: Easing.bezier(0.3, 0.05, 0.35, 1),
  build: Easing.bezier(0.55, 0, 0.95, 0.6),
  /** Ölçek değişimi: makro ↔ mikro. Ortası uzun, uçları yumuşak. */
  zoom: Easing.bezier(0.7, 0, 0.2, 1),
  /** Ani geri çekilme: patlamadan önceki an. */
  snap: Easing.bezier(0.8, 0, 0.1, 1),
} as const;

export const dur = {
  set: 22,
  fade: 12,
  exit: 14,
  /** Bir öğe yerine oturduktan sonra en az bu kadar sabit kalır. */
  digest: 36,
} as const;

export const prog = (frame: number, start: number, duration: number, easing: (t: number) => number = ease.set) =>
  duration <= 0
    ? frame >= start
      ? 1
      : 0
    : interpolate(frame, [start, start + duration], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing,
      });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Ölçek geçişi algısal olarak eşit hızda olsun diye üstel ara değer. */
export const lerpScale = (a: number, b: number, t: number) => a * Math.pow(b / a, t);

export const settle = (frame: number, start: number, stiff = false) =>
  spring({
    frame: frame - start,
    fps: canvas.fps,
    config: stiff ? {damping: 15, stiffness: 210, mass: 0.7} : {damping: 12, stiffness: 115, mass: 0.85},
  });

export const roastColor = (tempC: number) =>
  interpolateColors(
    tempC,
    roastScale.map((s) => s[0]),
    roastScale.map((s) => s[1]),
  );

export const mix = (a: string, b: string, t: number) => interpolateColors(clamp01(t), [0, 1], [a, b]);
export const paperMix = (c: string, t: number) => mix(c, color.paper, t);

/** Tek seferlik fiziksel sarsıntı. */
export const jolt = (frame: number, at: number, amp = 12) => {
  const seq = [0, 1, -0.65, 0.4, -0.2, 0.08, 0];
  const n = frame - at;
  return n < 0 || n >= seq.length ? 0 : seq[n] * amp;
};

/** Yumuşak eşik: a altında 0, b üstünde 1, arası pürüzsüz (keskin görünürlük eşiği yok). */
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
