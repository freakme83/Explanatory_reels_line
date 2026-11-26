/**
 * KOLA + V60 — SES OLAY LİSTESİ
 *
 * `npm run events -- kola-v60` → out/kola-v60/events.json; `python3 tools/audio/mix.py kola-v60` mikser.
 * Bütün kareler script.ts'ten (B) hesaplanır. Kaynaklar: audio/library (yalnızca CC0; dökülme ve köpürme için
 * Freesound CC0 kayıtları dahil). Müzik yok; naylon gitar bilgi anlarının işitsel imzası.
 */
import {rand} from '../../system/organic';
import {B} from './script';
import {CLIPS} from './recording';

const L = 'audio/library';
const imp = (f: string) => `${L}/kenney-impact-sounds/${f}.ogg`;
const ui = (f: string) => `${L}/kenney-interface-sounds/${f}.wav`;
const rpg = (f: string) => `${L}/kenney-rpg-audio/${f}.ogg`;
const ny = (n: string) => `${L}/meta-nylon-guitar/INSGuitarNylon_${n}_01.ogg`;
const fs = (f: string) => `${L}/freesound-cc0/${f}.mp3`;
const COLA = fs('fs_245643_unfa'); // "Cola Into Glass": 1–2,5 sn dökülme, 5–20 sn köpürme
const POUR = fs('fs_517176_craigglenday'); // "Pouring a fizzy drink"
const POUR2 = fs('fs_234620_squashy555'); // "pouring fizzy drink"
const FIZZ = fs('fs_187336_baidonovan'); // "Fizzing Carbonated Beverage": yakın, kıtır köpük

type Crop = {pre_ms?: number; len_ms: number; fade_ms?: number; hp_hz?: number; saturate?: number; start_s?: number};
type Ev = {id: string; file: string; frame: number; gain_db: number; rate?: number; reverse?: boolean; align?: 'onset' | 'end' | 'start'; crop?: Crop; why: string};

const o = B.open.clips;
const v = B.v60;
const p = B.particle;
const bus = B.bus.start;
const d = B.diff;
const r = B.refr;
const t = B.taste;
const fz = B.final;

/* Sahne 2: kabarcıkların koptuğu kareler (film-scenes.tsx'teki çukur zamanlamasıyla aynı formül). */
const PITS = [2, 7, 11, 15, 25, 30, 35, 38];
const activeAt = (i: number) => (i < 2 ? p.start + 10 + i * 9 : i < 5 ? p.puruzlu + (i - 2) * 7 : p.ideal - 14 + (i - 5) * 6);
const detach: number[] = [];
PITS.forEach((k, i) => {
  const per = 44 + rand(`pp${k}`) * 26;
  const off = rand(`pf${k}`) * 30;
  for (let n = 0; n < 12; n++) {
    const fr = Math.round(activeAt(i) - off + n * per + per * 0.7);
    if (fr > activeAt(i) && fr < p.exit - 4) detach.push(fr);
  }
});
detach.sort((a, b) => a - b);
// çok sık düşenleri seyrelt: en az 7 kare arayla
const plips = detach.filter((f, i, a) => i === 0 || f - a[i - 1] >= 7).slice(0, 26);

/* Refraktometre: sayı tırmanırken hızlanan tıkırtılar. */
const ticks: number[] = [];
for (let k = 0, f = r.count + 18; f < r.stop - 2; k++) {
  ticks.push(Math.round(f));
  f += Math.max(2.2, 9 - k * 0.55);
}

const sfx: Ev[] = [
  /* ---- Açılış: gerçek görüntü ---- */
  {id: 'dokulme-1', file: COLA, frame: 0, gain_db: -16, align: 'start', crop: {start_s: 0.9, len_ms: 2600, fade_ms: 60}, why: 'İlk kare: kola V60\'a dökülür'},
  {id: 'kopuk-taban', file: COLA, frame: 30, gain_db: -24, align: 'start', crop: {start_s: 5.5, len_ms: 9500, fade_ms: 900}, why: 'Görüntü boyunca köpürme dokusu; çizime geçerken kâğıda taşınır'},
  {id: 'dokulme-2', file: POUR, frame: o[1], gain_db: -21, align: 'start', crop: {start_s: 0.45, len_ms: 1500, fade_ms: 80}, why: 'İkinci klip: dökülme'},
  {id: 'dokulme-3', file: POUR2, frame: o[2], gain_db: -21, align: 'start', crop: {start_s: 0.9, len_ms: 1200, fade_ms: 80}, why: 'Üçüncü klip: dökülme'},
  {id: 'dokulme-4', file: POUR, frame: o[4], gain_db: -21, align: 'start', crop: {start_s: 6.8, len_ms: 1300, fade_ms: 80}, why: 'Son klip: dökülen kolanın köpüklü yatağa düşüşü'},
  /* ---- Sahne 1: fotoğraftan çizime, köpüren yatak ---- */
  {id: 'cizim', file: rpg('cloth_3'), frame: v.draw + 2, gain_db: -14, rate: 0.85, why: 'Mürekkep çizgisi V60\'ı izler'},
  {id: 'kagit', file: rpg('book_flip_2'), frame: v.wipe + 6, gain_db: -16, why: 'Fotoğraf kâğıda döner'},
  {id: 'kopuk-yakin', file: FIZZ, frame: v.wipe + 20, gain_db: -17, align: 'start', crop: {start_s: 0.0, len_ms: 5200, fade_ms: 700}, why: 'Çizilmiş yatak köpürür: yakın, kıtır köpük ("heyecanlı")'},
  ...[0, 9, 15, 22, 27, 33, 38, 42, 47, 51].map((dd, i): Ev => ({id: `patlama-${i + 1}`, file: ui(['drop_002', 'drop_003', 'drop_004'][i % 3]), frame: v.foam - 30 + dd, gain_db: -27 + i * 0.4, rate: 1.35 + rand(`pt${i}`) * 0.5, why: 'Yatakta kabarcıklar patlar; sıklaşır'})),
  {id: 'dalis', file: rpg('cloth_2'), frame: v.diveEnd, gain_db: -15, reverse: true, align: 'end', rate: 0.9, why: 'Kabarcığın içine dalış: ters kayma, içeride biter'},
  {id: 'dalis-plip', file: ui('drop_004'), frame: v.diveEnd - 2, gain_db: -19, rate: 0.75, why: 'Kabarcığın zarından geçiş'},
  /* ---- Sahne 2: tek parçacık, kabarcıklar ---- */
  {id: 'kola-ici', file: COLA, frame: v.diveEnd - 4, gain_db: -30, align: 'start', crop: {start_s: 9.0, len_ms: 9000, fade_ms: 1200}, why: 'Kolanın içi: uzak, yumuşak köpürme'},
  ...plips.map((f, i): Ev => ({id: `kopma-${i + 1}`, file: ui(i % 2 ? 'drop_003' : 'drop_002'), frame: f, gain_db: -25, rate: 0.95 + rand(`kp${i}`) * 0.55, why: 'Kabarcık çukurdan kopar'})),
  ...[0, 14, 25, 41, 52].map((dd, i): Ev => ({id: `ic-gaz-${i + 1}`, file: ui('drop_004'), frame: p.kavurmadan + 34 + dd, gain_db: -24, rate: 0.62 + i * 0.03, why: 'Kavurmadan kalan gaz: içeriden çıkan, daha pes kabarcıklar'})),
  /* ---- Sahne 3: şeker kalabalığı ---- */
  {id: 'parcacik-cekilir', file: rpg('cloth_3'), frame: p.exit + 2, gain_db: -17, rate: 0.8, why: 'Parçacık kadrajdan çekilir'},
  ...Array.from({length: 11}, (_, i): Ev => ({id: `seker-${i + 1}`, file: ui(i % 2 ? 'select_002' : 'click_005'), frame: Math.round(p.exit + 14 + (i / 10) * (p.seker - p.exit - 6)), gain_db: -26, rate: 1.1 + (i % 4) * 0.08, why: 'Şeker molekülleri birer birer belirir: kalabalık'})),
  {id: 'rakam', file: imp('impact_wood_light_003'), frame: B.sugarFig.landed - 6, gain_db: -19, why: '118 g yerine oturur'},
  /* ---- Sahne 4: dolu otobüs ---- */
  ...[0, 5, 10].map((dd, i): Ev => ({id: `koltuk-${i + 1}`, file: ui('select_002'), frame: bus + 2 + dd, gain_db: -23, rate: 0.85 + i * 0.06, why: 'Koltuklar belirir'})),
  {id: 'kosu', file: rpg('cloth_3'), frame: bus + 58, gain_db: -15, rate: 1.5, align: 'end', why: 'Kahve aroması koşarak gelir'},
  {id: 'kapi-tislama', file: FIZZ, frame: bus + 47, gain_db: -16, align: 'start', crop: {start_s: 1.2, len_ms: 320, fade_ms: 60, hp_hz: 900}, why: 'Otobüs kapısı: pnömatik tıslama'},
  {id: 'kapi-kapanir', file: imp('impact_plank_medium_002'), frame: bus + 56, gain_db: -12, why: 'Kapı kapanır'},
  {id: 'carpma', file: imp('impact_generic_light_000'), frame: bus + 58, gain_db: -15, rate: 1.35, why: 'Aroma kapıya çarpar (son anda yetişemedi)'},
  {id: 'kalir', file: ny('StringG_Vel01Finger_G3'), frame: bus + 86, gain_db: -11, why: '"Kalır.": sessizliğin ardından gitar (1)'},
  {id: 'kalir-2', file: ny('StringG_Vel01Finger_D4'), frame: bus + 92, gain_db: -12, why: 'Koltuklar suya erirken yukarı açılan ikinci nota'},
  {id: 'erime', file: rpg('cloth_2'), frame: bus + 92, gain_db: -19, rate: 0.7, why: 'Koltuklar dalgalı suya dönüşür'},
  {id: 'sizma', file: ui('drop_002'), frame: bus + 130, gain_db: -21, rate: 0.8, why: 'Aroma içeri süzülüp yerine oturur'},
  /* ---- Sahne 5: fark ---- */
  {id: 'fark-gecis', file: rpg('book_flip_3'), frame: d.start + 1, gain_db: -16, why: 'Yeni sahne: parçacık ile kola yan yana'},
  ...Array.from({length: 16}, (_, i): Ev => ({id: `akis-${i + 1}`, file: ui('click_005'), frame: d.start + 16 + i * 8 + Math.round(rand(`ak${i}`) * 4), gain_db: -28, rate: 1.5 + rand(`ar${i}`) * 0.3, why: 'Kahveye özgü bileşikler bol ve hızlı geçer'})),
  ...[0, 1].map((i): Ev => ({id: `kafein-${i + 1}`, file: ui('drop_003'), frame: d.kafTag - 30 + i * 46, gain_db: -24, rate: 0.6, why: 'Kafein: seyrek, pes'})),
  {id: 'kolada-var', file: ny('StringB_Vel01Finger_B3'), frame: d.kafTag + 4, gain_db: -19, why: '"Kolada zaten kafein var": küçük not'},
  ...Array.from({length: 7}, (_, i): Ev => ({id: `yavas-${i + 1}`, file: ui('click_005'), frame: Math.round(d.slowFrom + 4 + i * (10 + i * 2.5)), gain_db: -27, rate: 1.3 - i * 0.11, why: '"Soğuk ve şekerli": akış yavaşlar, tıklar seyrekleşip pesleşir'})),
  /* ---- Sahne 6: sıcak su / kola ---- */
  {id: 'bant-1', file: rpg('cloth_3'), frame: B.compare.start + 2, gain_db: -17, rate: 1.1, why: 'Sıcak su bandı girer'},
  {id: 'bant-2', file: rpg('cloth_3'), frame: B.compare.start + 8, gain_db: -19, rate: 0.9, why: 'Kola bandı girer'},
  ...Array.from({length: 10}, (_, i): Ev => ({id: `sicak-${i + 1}`, file: ui('click_005'), frame: B.compare.start + 22 + i * 5, gain_db: -28, rate: 1.7 + rand(`sc${i}`) * 0.2, why: 'Sıcak suda hızlı, bol geçiş'})),
  ...[0, 1, 2].map((i): Ev => ({id: `kola-yavas-${i + 1}`, file: ui('click_005'), frame: B.compare.start + 30 + i * 24, gain_db: -26, rate: 0.85, why: 'Kolada yavaş, seyrek geçiş'})),
  /* ---- Sahne 7: refraktometre ---- */
  {id: 'cihaz', file: imp('impact_plate_light_003'), frame: r.start + 14, gain_db: -18, why: 'Refraktometre masaya konur'},
  {id: 'damla', file: ui('drop_002'), frame: r.drop + 16, gain_db: -16, rate: 0.9, why: 'Damla prizmaya düşer'},
  ...ticks.map((f, i): Ev => ({id: `sayac-${i + 1}`, file: ui('click_005'), frame: f, gain_db: -24, rate: 1 + i * 0.03, why: 'Sayı tırmanır: hızlanan tıkırtı'})),
  {id: 'sayac-dur', file: ui('select_002'), frame: r.stop, gain_db: -17, rate: 0.8, why: 'Saçma değerde durur'},
  {id: 'cihaz-cikis', file: rpg('cloth_2'), frame: r.exit, gain_db: -18, why: 'Cihaz kadrajdan çıkar'},
  /* ---- Sahne 8: tat ---- */
  {id: 'zikzak', file: rpg('creak_3'), frame: t.start + 4, gain_db: -22, rate: 1.6, why: 'Keskin acılık çizgisi: kuru, pürüzlü'},
  {id: 'dalga', file: ny('StringG_Vel01Finger_G4'), frame: t.seker + 12, gain_db: -17, why: 'Şekerin yumuşak dalgası'},
  {id: 'torpulenir', file: ny('StringG_Vel01Finger_D4'), frame: t.bastirir + 4, gain_db: -19, why: 'Acılık törpülenir'},
  {id: 'vanilya', file: rpg('book_flip_3'), frame: t.vanilya + 2, gain_db: -19, why: 'Vanilya çubuğu belirir'},
  {id: 'cekirdek', file: imp('impact_wood_light_001'), frame: t.kavrulmus + 2, gain_db: -19, why: 'Kavrulmuş çekirdek yerine oturur'},
  {id: 'sarilma-1', file: ny('StringB_Vel01Finger_B3'), frame: t.kavrulmus + 14, gain_db: -18, why: 'İki aroma birbirine sarılır (1)'},
  {id: 'sarilma-2', file: ny('StringHighE_Vel01Finger_D5'), frame: t.kavrulmus + 26, gain_db: -20, why: 'İki aroma birbirine sarılır (2)'},
  /* ---- Final: gerçek tadım görüntüsü ---- */
  {id: 'buz', file: ui('glass_002'), frame: fz.start + 2, gain_db: -20, rate: 0.85, why: 'Gerçek görüntüye dönüş: buzlu bardak'},
  {id: 'kola-final', file: COLA, frame: fz.start, gain_db: -30, align: 'start', crop: {start_s: 12.0, len_ms: 6000, fade_ms: 900}, why: 'Bardaktaki kolanın köpürmesi, uzaktan'},
  {id: 'baski', file: rpg('book_flip_2'), frame: fz.inset + 4, gain_db: -17, why: 'Görüntü kâğıda basılmış bir fotoğrafa küçülür'},
  {id: 'cozulus-1', file: ny('StringG_Vel01Finger_G3'), frame: fz.text.landed + 3, gain_db: -15, why: 'Final cümlesi: yumuşak çözülüş (1)'},
  {id: 'cozulus-2', file: ny('StringB_Vel01Finger_B3'), frame: fz.text.landed + 6, gain_db: -17, why: 'Çözülüş (2)'},
  {id: 'cozulus-3', file: ny('StringG_Vel01Finger_D4'), frame: fz.text.landed + 9, gain_db: -18, why: 'Çözülüş (3)'},
];

/** Referans miksle aynı denge: efekt veriyolu dış sesin ~12 LU altında (ölçüm: önce 14,7 LU altındaydı). */
const BOOST = 3;
for (const e of sfx) e.gain_db += BOOST;

export default {
  fps: 30,
  /** Kayıt referanstan ~3 dB sessiz: yalnızca sabit ana kazanç (tepe −1 dBFS altında kalır). */
  master_db: 0.4,
  totalFrames: B.total,
  voice: {file: 'audio/vo/kola-v60.mp3', clips: CLIPS.map((c) => ({id: c.id, rec: c.rec, atFrame: c.at}))},
  textures: [],
  duck: {db: 2.5, threshold_db: -42, attack_s: 0.04, release_s: 0.3},
  sfx,
};
