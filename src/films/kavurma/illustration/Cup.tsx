/**
 * FİNCAN (tepeden) — açılış ve kapanış motifi
 *
 * Çekirdekle aynı birim uzayında çizilir; fincandaki kahve, çekirdeğin `morph = 0`
 * hâlidir. Bu katman yalnızca seramik ağzı ve kulpu çizer.
 * `open` 0 → 1: seramik kenar dışarı açılarak kadrajdan çıkar (kameranın fincana girişi).
 * Buhar, duman, parlama yoktur: sıcaklık renk, yüzey ve kadrajla kurulur.
 */
import React from 'react';
import {brush, color, misregister} from '../../../system/tokens';
import {lerp} from '../../../system/motion';
import {smoothClosed, type P} from '../../../system/organic';
import {ASPECT, DISK_R, VIEW} from './Bean';

const RIM_R = 117;
const N = 72;
const ring = (r: number, wob: number, phase: number): P[] =>
  Array.from({length: N}, (_, i) => {
    const a = (i / N) * Math.PI * 2;
    const rr = r * (1 + wob * Math.sin(3 * a + phase) + wob * 0.6 * Math.sin(5 * a + phase * 2));
    return [VIEW.cx + Math.cos(a) * rr, VIEW.cy + Math.sin(a) * rr];
  });

/** Kulp: kenardan dışarı uzanan yuvarlatılmış kısa bir kol (tepeden görünüş). */
const handle = (angle: number): string => {
  const pts: P[] = [];
  const r0 = RIM_R - 2;
  const r1 = RIM_R + 40;
  const hw = 13;
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const at = (r: number, side: number): P => [VIEW.cx + ca * r - sa * side, VIEW.cy + sa * r + ca * side];
  pts.push(at(r0, -hw * 1.15), at(r1 - 8, -hw), at(r1, -hw * 0.45), at(r1, hw * 0.45), at(r1 - 8, hw), at(r0, hw * 1.15));
  return smoothClosed(pts, 0.9);
};

export const Cup: React.FC<{width: number; open: number}> = ({width, open}) => {
  const px = width / VIEW.w;
  const u = 1 / px;
  const s = lerp(1, 3.2, open);
  const k = Math.min(1.5, Math.max(0.35, width / 600));
  const o = {x: misregister.x * k * u, y: misregister.y * k * u};
  const outer = smoothClosed(ring(RIM_R, 0.004, 0.3));
  const inner = smoothClosed(ring(DISK_R - 1, 0.003, 1.1).reverse());
  const handleD = handle((24 * Math.PI) / 180);
  const line = brush.max * 0.8 * u;
  return (
    <svg width={width} height={width * ASPECT} viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <g transform={`translate(${VIEW.cx} ${VIEW.cy}) scale(${s}) translate(${-VIEW.cx} ${-VIEW.cy})`}>
        <path d={handleD} fill={color.ceramic} transform={`translate(${o.x} ${o.y})`} />
        <path d={handleD} fill="none" stroke={color.ink} strokeWidth={line / s} strokeLinejoin="round" />
        <path d={`${outer} ${inner}`} fill={color.ceramic} fillRule="evenodd" transform={`translate(${o.x} ${o.y})`} />
        <path d={`${outer} ${inner}`} fill="none" stroke={color.ink} strokeWidth={line / s} />
      </g>
    </svg>
  );
};
