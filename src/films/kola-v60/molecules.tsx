/**
 * KOLA + V60 — molekül dili (filme özgü)
 *
 * Moleküller hiçbir zaman sabit yuvada durmaz: her biri tohumlu, kare-saf bir titreşimle kıpırdar.
 * Biçimler kimyasal yapıyı birebir çizmez, aileyi tanıtır (ekranda dipnot yok; bunu çizimin dili anlatır):
 *   su       küçük soluk çizgi (kadrajın çoğunluğu)
 *   şeker    yuvarlatılmış altıgen halka (krem dolgu)
 *   kafein   kaynaşmış altıgen + beşgen (soluk kahve)
 *   aroma/asit kahveye özgü küçük organik damla (kavrulmuş kahve tonları)
 */
import React from 'react';
import {color} from '../../system/tokens';
import {blob, rand, smoothClosed, type P} from '../../system/organic';

export const palette = {
  cola: '#EADBC2', // magnify edilmiş kola: vanilyalı, karamel sıcaklığında kâğıt
  water: '#9FB6C4',
  sugar: '#F6EAD0',
  caffeine: '#D8B88E',
  aroma: ['#A4612F', '#C07A3A', '#8A4B27', '#B8863F'],
  seat: '#C3DDEA', // açılışın buz mavisi: serinin bağı
  particle: '#5F3C25',
  coldCola: '#DCDDD3', // soğuk kola: aynı kâğıt, buz mavisine doğru bir adım
} as const;

/** Kare-saf titreşim: aynı kare → aynı konum. */
export const wiggle = (seed: number, frame: number, amp: number): P => [
  Math.sin(frame * 0.11 + seed * 37.1) * amp + Math.sin(frame * 0.047 + seed * 11.3) * amp * 0.6,
  Math.cos(frame * 0.09 + seed * 23.7) * amp + Math.cos(frame * 0.053 + seed * 5.9) * amp * 0.6,
];

const poly = (cx: number, cy: number, r: number, n: number, rot: number): P[] =>
  Array.from({length: n}, (_, k) => {
    const a = rot + (k / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });

const LINE = 2.6;

export const Sugar: React.FC<{x: number; y: number; r?: number; rot?: number; opacity?: number}> = ({x, y, r = 22, rot = 0, opacity = 1}) => (
  <g opacity={opacity}>
    <path d={smoothClosed(poly(x, y, r, 6, rot), 0.45)} fill={palette.sugar} stroke={color.ink} strokeWidth={LINE} />
    <circle cx={x} cy={y} r={r * 0.28} fill="none" stroke={color.ink} strokeWidth={LINE * 0.7} opacity={0.55} />
  </g>
);

export const Caffeine: React.FC<{x: number; y: number; r?: number; rot?: number; opacity?: number}> = ({x, y, r = 17, rot = 0, opacity = 1}) => {
  // altıgen ve beşgen bir kenarı paylaşır
  const hex = poly(x - r * 0.62, y, r, 6, rot);
  const pen = poly(x + r * 0.95, y, r * 0.86, 5, rot + Math.PI);
  return (
    <g opacity={opacity}>
      <path d={smoothClosed(pen, 0.4)} fill={palette.caffeine} stroke={color.ink} strokeWidth={LINE} />
      <path d={smoothClosed(hex, 0.4)} fill={palette.caffeine} stroke={color.ink} strokeWidth={LINE} />
    </g>
  );
};

export const Aroma: React.FC<{x: number; y: number; r?: number; seed: string; opacity?: number}> = ({x, y, r = 11, seed, opacity = 1}) => {
  const tone = palette.aroma[Math.floor(rand(seed + 'c') * palette.aroma.length)];
  return (
    <path d={smoothClosed(blob(x, y, r, seed, 0.28, 7))} fill={tone} stroke={color.ink} strokeWidth={LINE * 0.8} opacity={opacity} />
  );
};

/** Su: kadrajın çoğunluğunu oluşturan küçük, soluk çizgiler. */
export const WaterField: React.FC<{frame: number; w: number; h: number; count?: number; seed?: string; clip?: string}> = ({
  frame,
  w,
  h,
  count = 1100,
  seed = 'w',
  clip,
}) => (
  <g clipPath={clip}>
    {Array.from({length: count}, (_, i) => {
      const s = rand(`${seed}${i}`);
      const x = rand(`${seed}x${i}`) * w;
      const y = rand(`${seed}y${i}`) * h;
      const [dx, dy] = wiggle(s, frame, 3.5);
      const a = (rand(`${seed}a${i}`) * 180 + frame * (s - 0.5) * 2) % 180;
      return (
        <line
          key={i}
          x1={x + dx - 4}
          y1={y + dy}
          x2={x + dx + 4}
          y2={y + dy}
          stroke={palette.water}
          strokeWidth={3}
          strokeLinecap="round"
          transform={`rotate(${a} ${x + dx} ${y + dy})`}
        />
      );
    })}
  </g>
);

/** Bir bölgede çakışmayan, titreşen konumlar (tohumlu ızgara + sapma). */
export const scatter = (n: number, box: [number, number, number, number], seed: string): {x: number; y: number; s: number}[] => {
  const [x0, y0, x1, y1] = box;
  const cols = Math.ceil(Math.sqrt((n * (x1 - x0)) / (y1 - y0)));
  const rows = Math.ceil(n / cols);
  const cw = (x1 - x0) / cols;
  const ch = (y1 - y0) / rows;
  const out: {x: number; y: number; s: number}[] = [];
  for (let i = 0; i < n; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    out.push({
      x: x0 + (c + 0.5) * cw + (rand(`${seed}x${i}`) - 0.5) * cw * 0.55,
      y: y0 + (r + 0.5) * ch + (rand(`${seed}y${i}`) - 0.5) * ch * 0.55,
      s: rand(`${seed}s${i}`),
    });
  }
  return out;
};
