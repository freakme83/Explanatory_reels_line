# AGENTS.md — buradan başla

Bu repo, **kod ile üretilen kısa açıklayıcı dikey videolar** (Instagram Reels / TikTok / Shorts, 1080×1920, 30 fps)
için bir üretim hattıdır. Her video bir "film"dir: Remotion (React + TypeScript) ile kare kare, deterministik çizilir;
dış ses ve ses efektleri ayrı bir Python araç zinciriyle görüntüye kare hassasiyetinde bağlanır.

`src/films/kavurma/` onaylanmış **referans film**dir (kahve çekirdeğinin kavrulması, ~51 sn). Onu **örnek** olarak oku;
yaratıcı kararlarını (renkler, fincan, çekirdek, kırmızı "Çat.") yeni filmlere kural diye taşıma.

Belgeler (tekrarsız): bu dosya = **ne yapılır, hangi sırayla**. `docs/sistem.md` = **neden ve nasıl** (ilkeler,
teknik çözümler, dersler). `docs/stil-briefi.md` = kullanıcının istediği tarzı almak için şablon.
`src/films/kavurma/README.md` = referans filme özgü notlar.

## 0. Ortam

Node 20+, FFmpeg, Python 3.10+. Kurulum: `npm ci` ve `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`;
ses adımlarında `PYTHON=.venv/bin/python` verin (ya da bu paketleri sistem Python'una kurun).
Chromium: Remotion kendisi indirir; ya da `KT_BROWSER` ile kurulu bir headless Chrome yolu verin.
Kontrol: `npx tsc --noEmit` ve `npm run audit -- kavurma` hatasız geçmeli.

## 1. İlk iş: kullanıcının tarzını öğren

Yeni bir video istenince önce `docs/stil-briefi.md` sorularını kullanıcıyla kısa bir konuşmada doldur
(konu, hedef kitle, ton, renk/tipografi tercihi, referanslar, dil, ses karakteri, süre beklentisi, kaçınılacaklar).
Kullanıcı "referans filmdeki gibi" derse varsayılan sistemle ilerle. Farklı bir tarz isterse:
- Renk, yazı tipi, tipografi ölçeği → `src/system/tokens.ts` (ve gerekirse `public/fonts/` + `src/system/fonts.ts`).
- Kurallar ve bileşenler (metin maskesi, zamanlama, denetim) aynı kalır; onlar tarzdan bağımsızdır.
- Tokens değişince referans film de değişir; kabul edilebilir — referans kodu git geçmişinde durur.

## 2. Varsayılan üretim akışı (yeniden çalışmayı en aza indiren sıra)

Kullanıcıya **yalnızca kalın** adımlarda sor. Teknik konular (maske, zamanlama, seviye) için onay isteme; ölç ve raporla.

1. **Araştırma + doğruluk notu**: 3–6 temel iddia, kaynaklı, yaklaşık aralıklarla (film klasöründe `README.md`).
2. **Kurgu, hook, dış ses metni** → **kullanıcı onayı.** Hook kitlenin gündelik deneyiminden/merakından kurulur;
   hook'un sorusu filmde gerçekten cevaplanır. Dış ses yazım ilkeleri: `docs/sistem.md` §4.
3. **Açılış**: 2–3 statik alternatif (tam çözünürlük still, render değil) → **kullanıcı seçimi.**
4. **Dış ses kaydı** (kullanıcı üretir/verir; ör. TTS). Kayıt gelmeden zamanlama kesinleşmez.
5. **Hizalama**: kelime zaman kodları (TTS'in zaman damgaları / forced alignment; yoksa
   `$PYTHON tools/audio/hizala.py kayit.mp3 metin.txt`) → `src/films/<film>/recording.ts` (klipler + kelimeler).
6. **İşaret listesi** `script.ts` + `npm run audit -- <film>` + `npm run glyphs -- <film>`. Render yok, saniyeler.
7. **Hedefli stiller**: kritik karelerin tam çözünürlük still'leri ve kırpıntıları
   (`npx remotion still src/index.ts <film> out/<film>/k.png --frame=N`). Sorunlar burada çözülür.
8. **Sessiz görüntü**: `npm run film -- <film> goruntu` (~1 dk) + kare şeridi ile hareket kontrolü.
9. **Ses tasarımı**: `src/films/<film>/ses.ts` (olaylar), `audio/library/`'den seçim
   (`$PYTHON tools/audio/ses_incele.py sayfa.png "audio/library/**/*.ogg"`), `npm run film -- <film> ses`.
   Görüntü yeniden render edilmez.
10. **Kullanıcı: izleme ve dinleme onayı** → teslim (MP4 + ayrı `dis_ses.wav` / `efektler.wav`), commit.

Ses karakterini dinleyemiyorsan bunu açıkça söyle; ölçümler (spektrogram, RMS) karakteri doğrulayamaz.

## 3. Yeni film nasıl açılır

1. `src/films/<film>/` oluştur: `script.ts` (işaretler + metin + zamanlama; `cues`, `voice`, `spec`, `allText`, `B`
   dışa aktarır), `Film.tsx` (sahneleme), `recording.ts` (kayıt hizalaması), `ses.ts` (ses olayları), `README.md`
   (doğruluk notu, filme özgü kararlar, kaynaklar/atıflar). Kavurma'daki aynı adlı dosyalar şablondur.
2. `src/Root.tsx` içine bir satır ekle: `film('<film>', Bileşen, B.total)`.
3. Filme özgü illüstrasyonlar `src/films/<film>/illustration/` altına; yalnızca gerçekten genel olan parçalar
   `src/system/` altına taşınır.

## 4. Değişmez kurallar (ayrıntı ve gerekçe: `docs/sistem.md`)

- Ekrandaki her unsur o anda anlatılan bilgiye hizmet eder ve görevi bitince çekilir. Kalıcı künye/marka yazısı,
  kategori, ayırıcı çizgi, sayfa numarası, HUD, sürekli gösterge yok. Aynı anda tek metin, tek fikir. (`audit` denetler.)
- Açıklayıcı film, hareketli carousel değil: kompozisyon ve ölçek sahneye göre serbestçe değişir; hareket bilgi taşır.
- İlk kare boş olmaz; okunabilirlik önce gelir; italik ölçülü (metin başına ≤ 1 kelime).
- Yapay zekâ klişesi yok (kıvrımlı duman, parlayan parçacık, glow/gradyan/kart, jenerik whoosh/bip).
- Önce dış ses, sonra animasyon zamanlaması; onaylı kaydın hızı/nefesi korunur (germe, kompresyon, reverb yok).
- Ses değiştiği için görüntü yeniden render edilmez; video süresi konuya göre belirlenir, sabit hedefe zorlanmaz.
- **Lisans:** depoya yalnızca CC0 ses girer (`audio/library/`). Atıf gerektiren sesler `audio/external/` içinde yerel
  kalır (git yok sayar), kaynağı `audio/external/KAYNAKLAR.md`'ye yazılır; yayında atıf zorunludur.
- Repoya kişisel bilgi, sır/anahtar, render çıktısı (`out/`), `node_modules` girmez.

## 5. Komutlar

```bash
npm run studio                         # canlı önizleme (tarayıcı)
npm run audit -- <film>                # işaret listesi denetimi
npm run why -- <film> <kare>           # o karede ne var ve neden
npm run glyphs -- <film>               # gerçek harf sınırları ölçümü + satır sığma kontrolü
npm run film -- <film> [goruntu|ses|hepsi]   # sessiz görüntü / ses miksi / ikisi → out/<film>/<film>.mp4
$PYTHON tools/audio/hizala.py kayit.mp3 metin.txt        # modelsiz dış ses hizalaması
$PYTHON tools/audio/ses_incele.py sayfa.png "audio/library/**/*.ogg"   # efekt ön eleme
```

Referans filmi yeniden üretmek: `audio/external/` içine çatlama kaydını koyun (`audio/external/KAYNAKLAR.md`),
sonra `npm run film -- kavurma`.
