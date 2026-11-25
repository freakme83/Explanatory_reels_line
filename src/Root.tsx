/**
 * Kompozisyon kaydı. Her film burada bir satırla tanımlanır:
 *   id = film klasörünün adı (src/films/<id>/), süre film script.ts'teki B.total'dan gelir.
 */
import React from 'react';
import {Composition} from 'remotion';
import {canvas} from './system/tokens';
import {loadFonts} from './system/fonts';
import {KavurmaFilm as Kavurma} from './films/kavurma/Film';
import {B as kavurma} from './films/kavurma/script';
import {SceneBus, SceneGradient, S4, S5} from './films/kola-v60/scenes';

loadFonts();

const film = (id: string, component: React.FC, frames: number) => (
  <Composition key={id} id={id} component={component} durationInFrames={frames} fps={canvas.fps} width={canvas.width} height={canvas.height} />
);

export const Root: React.FC = () => <>{[film('kavurma', Kavurma, kavurma.total), film('kola-v60-sahne4', SceneBus, S4.total), film('kola-v60-sahne5', SceneGradient, S5.total)]}</>;
