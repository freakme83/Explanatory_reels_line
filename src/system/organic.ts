/**
 * Organik çizim yardımcıları: tohumlu rastgelelik, pürüzsüz kapalı/açık eğriler.
 * Saf fonksiyonlar — aynı tohum her zaman aynı şekli verir.
 */
export type P = [number, number];

/** Dizgeden tohumlanmış 0–1 arası sayı (deterministik). */
export const rand = (seed: string) => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h += h << 13;
  h ^= h >>> 7;
  h += h << 3;
  h ^= h >>> 17;
  h += h << 5;
  return ((h >>> 0) % 100000) / 100000;
};

const f2 = (n: number) => n.toFixed(2);

/** Catmull-Rom → kübik Bézier, kapalı. */
export const smoothClosed = (pts: P[], tension = 1) => {
  const n = pts.length;
  let d = `M ${f2(pts[0][0])} ${f2(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: P = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2: P = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    d += ` C ${f2(c1[0])} ${f2(c1[1])}, ${f2(c2[0])} ${f2(c2[1])}, ${f2(p2[0])} ${f2(p2[1])}`;
  }
  return d + ' Z';
};

/** Catmull-Rom → kübik Bézier, açık. */
export const smoothOpen = (pts: P[]) => {
  const n = pts.length;
  let d = `M ${f2(pts[0][0])} ${f2(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${f2(c1[0])} ${f2(c1[1])}, ${f2(c2[0])} ${f2(c2[1])}, ${f2(p2[0])} ${f2(p2[1])}`;
  }
  return d;
};

/** Merkez etrafında, yarıçapı açıyla hafifçe dalgalanan organik damla/hücre. */
export const blob = (cx: number, cy: number, r: number, seed: string, wobble = 0.14, n = 9): P[] => {
  const pts: P[] = [];
  const rot = rand(`${seed}-rot`) * Math.PI * 2;
  for (let k = 0; k < n; k++) {
    const a = rot + (k / n) * Math.PI * 2;
    const rr = r * (1 + (rand(`${seed}-${k}`) - 0.5) * 2 * wobble);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return pts;
};
