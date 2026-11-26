/**
 * KOLA + V60 — film. Sahneler sırayla; zamanlar script.ts'teki B'den (gerçek dış ses kaydından türetilmiş).
 */
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {margin, type} from '../../system/tokens';
import {Fade, Line, Lines} from '../../system/type';
import {CELLS_AT, FinalFootage, OpeningFootage, SceneCells, SceneCompare, SceneParticle, SceneRefractometer, SceneTaste, SceneV60, cellsIris, diveIris} from './film-scenes';
import {SceneBus, SceneGradient} from './scenes';
import {B, copy} from './script';

const Seq: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => (
  <Sequence from={from} durationInFrames={to - from}>
    {children}
  </Sequence>
);

export const KolaV60Film: React.FC = () => {
  const f = useCurrentFrame();
  const iris = diveIris(f);
  const ci = cellsIris(f);
  const zoomP = 1 + 1.8 * ci.k; // parçacığın içine dalarken kâğıt sahne de o noktaya doğru büyür
  const d = B.diff;
  return (
    <AbsoluteFill>
      <Seq from={0} to={B.v60.start}>
        <OpeningFootage />
      </Seq>
      <Seq from={B.v60.start} to={B.v60.diveEnd}>
        <SceneV60 from={B.v60.start} />
      </Seq>
      <Seq from={B.particle.start} to={B.bus.start}>
        <AbsoluteFill style={iris.done ? undefined : {clipPath: `circle(${iris.r.toFixed(1)}px at ${iris.at[0]}px ${iris.at[1]}px)`}}>
          <AbsoluteFill style={{transform: `scale(${zoomP})`, transformOrigin: `${CELLS_AT[0]}px ${CELLS_AT[1]}px`}}>
            <SceneParticle from={B.particle.start} />
          </AbsoluteFill>
        </AbsoluteFill>
      </Seq>
      <Seq from={B.cells.in} to={B.cells.end}>
        <AbsoluteFill style={{clipPath: `circle(${ci.r.toFixed(1)}px at ${CELLS_AT[0]}px ${CELLS_AT[1]}px)`}}>
          <SceneCells from={B.cells.in} />
        </AbsoluteFill>
      </Seq>
      <Seq from={B.bus.start} to={B.bus.end}>
        <SceneBus />
      </Seq>
      <Seq from={d.start} to={d.end}>
        <SceneGradient kafTag={d.kafTag - d.start} slowFrom={d.slowFrom - d.start} slowTo={d.slowTo - d.start} />
      </Seq>
      <Seq from={B.compare.start} to={B.compare.end}>
        <SceneCompare from={B.compare.start} />
      </Seq>
      <Seq from={B.refr.start} to={B.refr.end}>
        <SceneRefractometer from={B.refr.start} />
      </Seq>
      <Seq from={B.taste.start} to={B.taste.end}>
        <SceneTaste from={B.taste.start} />
      </Seq>
      <Seq from={B.final.start} to={B.total}>
        <FinalFootage from={B.final.start} />
      </Seq>

      {/* ekran metni: tek sayı, tek vurgu (Sahne 4 içinde), tek final */}
      <div style={{position: 'absolute', left: margin - 8, top: 280}}>
        <Line in={B.sugarFig.in} out={B.sugarFig.out} role="figure">
          {copy.sugar.figure}
        </Line>
        <Fade in={B.sugarFig.landed - 6} out={B.sugarFig.out} style={{...type.unit, marginTop: 6, marginLeft: 10}}>
          {copy.sugar.unit}
        </Fade>
      </div>
      <div style={{position: 'absolute', left: margin, top: 1262}}>
        <Lines in={B.final.text.in} out={B.total + 10} lines={copy.closing} />
      </div>
    </AbsoluteFill>
  );
};
