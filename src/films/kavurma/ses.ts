/**
 * KAVURMA — SES OLAY LİSTESİ (onaylı nihai miks)
 *
 * `npm run events -- kavurma` bu dosyanın varsayılan dışa aktarımını out/kavurma/events.json olarak yazar;
 * `python3 tools/audio/mix.py kavurma` onu miksler. Bütün kareler script.ts'ten hesaplanır.
 * Yeni bir film için bu dosya kopyalanıp kendi olaylarıyla yeniden yazılır (şablon).
 */
import {B, HEAT_END_MINUTE} from './script';
import {CLIPS} from './recording';
import {ease, prog} from '../../system/motion';

const L = 'audio/library';
const imp = (f: string) => `${L}/kenney-impact-sounds/${f}.ogg`;
const ui = (f: string) => `${L}/kenney-interface-sounds/${f}.wav`;
const rpg = (f: string) => `${L}/kenney-rpg-audio/${f}.ogg`;
const ny = (n: string) => `${L}/meta-nylon-guitar/INSGuitarNylon_${n}_01.ogg`;

// Dakika izlerinin yere konduğu kareler (Film.tsx: printFrame(k) + 14)
const minuteAt = (f: number) => prog(f, B.heat.start, B.heat.end - B.heat.start, ease.time) * HEAT_END_MINUTE;
const printLand = Array.from({length: 10}, (_, k) => {
  for (let f = B.heat.start; f <= B.heat.end; f++) if (minuteAt(f) >= k) return f + 14;
  return B.heat.end + 14;
});
const waterBase = B.cells.water;

type Ev = {id: string; file: string; frame: number; gain_db: number; rate?: number; reverse?: boolean; align?: 'onset' | 'end';
  crop?: {pre_ms?: number; len_ms: number; fade_ms?: number; hp_hz?: number; saturate?: number}; why: string};
const sfx: Ev[] = [
  {id: 'porselen-acilis', file: imp('impact_plate_light_003'), frame: 2, gain_db: -15, why: 'İlk karede fincan: porselen dokunuşu'},
  {id: 'bicim-degisimi', file: rpg('cloth_3'), frame: B.open.morph, gain_db: -15, rate: 0.85, why: 'Kahve yüzeyi çekirdeğe dönüşürken yumuşak kayma'},
  {id: 'geri-sarma', file: rpg('cloth_2'), frame: B.open.rewindEnd, gain_db: -16, reverse: true, align: 'end', why: 'Zaman geri sarılır: ters kayma, yeşile ulaşınca biter'},
  {id: 'yakinlasma-1', file: rpg('cloth_2'), frame: B.zoomIn1.start, gain_db: -16, rate: 0.8, why: 'Makrodan mikroya kayma'},
  ...[0, 8, 15, 23, 33].map((d, i): Ev => ({id: `damla-${i + 1}`, file: ui(i % 2 ? 'drop_003' : 'drop_002'), frame: waterBase + d, gain_db: -19 - (i % 2), rate: [1.0, 1.12, 0.94, 1.26, 1.06][i], why: 'Hücrelerde su damlaları belirir'})),
  {id: 'damla-parilti', file: ui('glass_002'), frame: waterBase + 42, gain_db: -24, rate: 1.5, why: 'Damlalar tamamlanır: küçük çınlama'},
  {id: 'uzaklasma-1', file: rpg('cloth_2'), frame: B.zoomOut1.end, gain_db: -17, reverse: true, align: 'end', rate: 0.9, why: 'Mikrodan makroya: ters kayma, makroda biter'},
  ...printLand.map((f, k): Ev => ({id: `iz-${k + 1}`, file: ui(k % 2 ? 'select_002' : 'click_005'), frame: f, gain_db: -21, rate: 0.85 + k * 0.04, why: 'Her dakika bir renk izi yere konur (perde, renk koyulaştıkça yükselir)'})),
  {id: 'yakinlasma-2', file: rpg('cloth_2'), frame: B.zoomIn2.start, gain_db: -17, rate: 0.8, why: 'Aynı hücrelere dönüş'},
  ...[0, 7, 13, 20].map((d, i): Ev => ({id: `kabarcik-${i + 1}`, file: ui('drop_004'), frame: B.vapor.start + 14 + d, gain_db: -20, rate: [1.0, 1.15, 0.92, 1.3][i], why: 'Su buhara döner: kabarcıklar'})),
  {id: 'gerilim', file: rpg('creak_3'), frame: B.vapor.pressureStart + 28, gain_db: -20, rate: 0.7, why: 'Basınç: çekirdek zorlanır'},
  {id: 'geri-cekilis', file: rpg('cloth_3'), frame: B.snap.end, gain_db: -16, reverse: true, align: 'end', rate: 1.1, why: 'Dev ölçeğe ani geri çekiliş'},
  {id: 'catlama', file: 'audio/external/freesound_878408_debbicar_egg-drop_hq-preview.mp3', frame: B.crack.at, gain_db: -2,
    crop: {pre_ms: 3, len_ms: 110, fade_ms: 30, hp_hz: 40, saturate: 2.6},
    why: 'Birinci çatlama: gerçek kayıttan tek kabuk darbesi (CC BY 4.0, atıf zorunlu); dış ses yok'},
  {id: 'yarilma', file: rpg('book_flip_2'), frame: B.split.at + 4, gain_db: -12, why: 'Sayfa çatlak boyunca ayrılır: kâğıt hareketi'},
  {id: 'yarilma-2', file: rpg('book_flip_3'), frame: B.split.at + 16, gain_db: -17, why: 'Yarılmanın sönümü'},
  {id: 'hacim-1', file: ny('StringG_Vel01Finger_G3'), frame: B.volume.grow, gain_db: -15, why: 'Çekirdek büyür: yükselen iki nota (1)'},
  {id: 'hacim-2', file: ny('StringG_Vel01Finger_D4'), frame: B.volume.grow + 7, gain_db: -15, why: 'Çekirdek büyür: yükselen iki nota (2)'},
  {id: 'teraziye-konma-1', file: imp('impact_wood_light_003'), frame: B.weight.move + 28, gain_db: -17, why: 'Yeşil çekirdek teraziye konur'},
  {id: 'teraziye-konma-2', file: imp('impact_wood_light_001'), frame: B.weight.move + 31, gain_db: -19, rate: 1.2, why: 'Kavrulmuş çekirdek teraziye konur (daha hafif)'},
  {id: 'terazi-egilir', file: rpg('creak_3'), frame: B.weight.tilt, gain_db: -17, rate: 0.9, why: 'Terazi eğilir'},
  {id: 'terazi-oturur', file: imp('impact_plank_medium_002'), frame: B.weight.tilt + 11, gain_db: -22, why: 'Terazi yerine oturur'},
  {id: 'tat-tasima', file: rpg('cloth_3'), frame: B.taste.move, gain_db: -20, rate: 0.9, why: 'Çekirdek tat bölümüne taşınır'},
  {id: 'tat-meyvemsi', file: ny('StringHighE_Vel01Finger_D5'), frame: B.taste.words[0].landed + 2, gain_db: -13, why: 'meyvemsi: parlak nota'},
  {id: 'tat-karamelimsi', file: ny('StringG_Vel01Finger_G4'), frame: B.taste.words[1].landed + 2, gain_db: -13, why: 'karamelimsi: orta nota'},
  {id: 'tat-acimsi', file: ny('StringB_Vel01Finger_B3'), frame: B.taste.words[2].landed + 2, gain_db: -13, why: 'acımsı: pes nota'},
  {id: 'kapanis-kayma', file: rpg('cloth_2'), frame: B.close.morphEnd - 4, gain_db: -18, reverse: true, align: 'end', why: 'Çekirdek fincana döner'},
  {id: 'porselen-kapanis', file: imp('impact_plate_light_000'), frame: B.close.morphEnd - 2, gain_db: -16, why: 'Fincan yerinde: açılıştaki porselen dokunuşu'},
  {id: 'cozulus-1', file: ny('StringG_Vel01Finger_G3'), frame: B.close.text.landed + 3, gain_db: -17, why: 'Kapanış cümlesi yerine oturunca yumuşak çözülüş (1)'},
  {id: 'cozulus-2', file: ny('StringB_Vel01Finger_B3'), frame: B.close.text.landed + 6, gain_db: -19, why: 'Çözülüş (2)'},
  {id: 'cozulus-3', file: ny('StringG_Vel01Finger_D4'), frame: B.close.text.landed + 9, gain_db: -20, why: 'Çözülüş (3)'},
];

/** Seviye ayarı (dB, ölçüme göre): konuşma altındaki efektler dış sesin ~8–12 dB altında, sessiz anlarda daha belirgin. */
const LEVEL: Record<string, number> = {
  'porselen-acilis': 4, 'bicim-degisimi': 3, 'geri-sarma': 10, 'yakinlasma-1': 6, 'damla': 9, 'damla-parilti': 8,
  'uzaklasma-1': 5, 'iz': 8, 'yakinlasma-2': 3, 'kabarcik': 9, 'gerilim': 8, 'geri-cekilis': 5,  'yarilma': 1, 'yarilma-2': 2, 'hacim': -4, 'teraziye-konma': 8, 'terazi-egilir': 1, 'terazi-oturur': 4,
  'tat-tasima': 6, 'tat-meyvemsi': 1, 'tat-karamelimsi': 1, 'tat-acimsi': 1, 'kapanis-kayma': 6, 'porselen-kapanis': 8, 'cozulus': -3,
};
for (const e of sfx) {
  const key = Object.keys(LEVEL).find((k) => e.id === k) ?? Object.keys(LEVEL).find((k) => e.id.startsWith(k + '-'));
  if (key) e.gain_db += LEVEL[key];
}

/** Nihai miks: efekt veriyolu +3,5 dB; konuşmanın ortasına düşen iki ses biraz geri (dış sesi maskelemesin). */
const FINAL_BOOST = 3.5;
const FINAL_TRIM: Record<string, number> = {gerilim: -3, 'terazi-egilir': -1.5};
for (const e of sfx) if (e.id !== 'catlama') e.gain_db += FINAL_BOOST + (FINAL_TRIM[e.id] ?? 0);

export default {
  fps: 30,
  totalFrames: B.total,
  voice: {file: 'audio/vo/kavurma.mp3', clips: CLIPS.map((c) => ({id: c.id, rec: c.rec, atFrame: c.at}))},
  textures: [{id: 'isinma', frame: B.heat.start, endFrame: B.crack.at - 12, pressureFrom: B.vapor.pressureStart, gain_db: -27.5, peak_db: -20.5,
    why: 'Isınma ve basınç: sıcak doku; çatlamadan ~0,4 sn önce susar (beklenti sessizliği)'}],
  duck: {db: 2.5, threshold_db: -42, attack_s: 0.04, release_s: 0.3},
  sfx,
};
