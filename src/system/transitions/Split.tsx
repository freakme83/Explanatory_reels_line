/**
 * GEÇİŞ — Yarılma
 * Sayfa, kahramanın kendi çatlağı boyunca ikiye ayrılır; alttaki sayfa görünür.
 * Geçiş dekoratif değil: çatlama olayının sayfa ölçeğindeki devamıdır.
 */
import React from 'react';
import type {ReactNode} from 'react';
import {AbsoluteFill, Easing, random, useCurrentFrame} from 'remotion';
import {canvas, color} from '../tokens';
import {ease, prog} from '../motion';

type P = [number, number];

/** Üstten alta, verilen "omurga" noktalarından geçen kırık çizgi. */
export const buildFault = (spine: P[], seed: string): P[] => {
  const top = spine[0];
  const bottom = spine[spine.length - 1];
  const up: P[] = [];
  for (let y = top[1] - 70, i = 0; y > -80; y -= 70, i++) {
    up.unshift([top[0] + (random(`${seed}-u${i}`) - 0.5) * 34, y]);
  }
  const down: P[] = [];
  for (let y = bottom[1] + 70, i = 0; y < canvas.height + 80; y += 70, i++) {
    down.push([bottom[0] + (random(`${seed}-d${i}`) - 0.5) * 34, y]);
  }
  return [...up, ...spine, ...down];
};

const poly = (pts: P[]) => pts.map((p) => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(', ');

export const Split: React.FC<{
  at: number;
  fault: P[];
  /** Çizginin çizilmeye başladığı nokta (omurganın ortası). */
  originIndex: number;
  children: ReactNode;
}> = ({at, fault, originIndex, children}) => {
  const f = useCurrentFrame();
  const draw = prog(f, at, 10, ease.draw);
  const open = prog(f, at + 8, 28, Easing.bezier(0.7, 0, 0.25, 1));
  const dx = open * 700;
  const rot = open * 3;

  const left = `polygon(-200px -200px, ${poly(fault)}, -200px ${canvas.height + 200}px)`;
  const right = `polygon(${canvas.width + 200}px -200px, ${poly(fault)}, ${canvas.width + 200}px ${canvas.height + 200}px)`;

  const upper = fault.slice(0, originIndex + 1).reverse();
  const lower = fault.slice(originIndex);
  const line = (pts: P[]) => pts.map((p) => p.join(',')).join(' ');

  const content = (
    <AbsoluteFill>
      {children}
      {draw > 0 ? (
        <svg width={canvas.width} height={canvas.height} style={{position: 'absolute', inset: 0}}>
          {[upper, lower].map((pts, i) => (
            <polyline
              key={i}
              points={line(pts)}
              pathLength={1}
              fill="none"
              stroke={color.ink}
              strokeWidth={5}
              strokeLinejoin="round"
              strokeDasharray="1 1"
              strokeDashoffset={1 - draw}
            />
          ))}
        </svg>
      ) : null}
    </AbsoluteFill>
  );

  if (open === 0) return content;
  if (open >= 1) return null;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: left, transform: `translateX(${-dx}px) rotate(${-rot}deg)`, transformOrigin: '0 50%'}}>
        {content}
      </AbsoluteFill>
      <AbsoluteFill style={{clipPath: right, transform: `translateX(${dx}px) rotate(${rot}deg)`, transformOrigin: '100% 50%'}}>
        {content}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
