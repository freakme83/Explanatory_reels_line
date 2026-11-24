# Sistem: ilkeler, teknik çözümler, dersler

Neden böyle çalıştığımızın kaydı. Ne yapılacağı ve sırası: `AGENTS.md`. Örnekler referans film *Kavurma*'dandır;
**örnekler kural değildir**, yeni konu kendi görsel fikrini bulur.

## 1. Görsel dil ve anlatım

- Varsayılan estetik: modern, sıcak, minimalist editoryal — kırık beyaz/krem zeminler, karakterli serif (Fraunces)
  + sade sans (Schibsted Grotesk), düz dolgu + mürekkep kontur + hafif baskı kayması. Gradyan, glow, kart, HUD yok.
  Kullanıcı başka bir tarz isterse bu katman (`src/system/tokens.ts`) değişir; aşağıdaki ilkeler değişmez.
- **Her unsur o an anlatılan bilgiye hizmet eder, görevini bitirince çekilir.** İlke kodda: her film ekrana gelen her
  şeyi `script.ts` içinde giriş/oturma/çıkış karesi ve yazılı **amaç** ile bildirir; `npm run audit` denetler
  (aynı anda tek metin ve tek fikir, ≥ 1 sn sindirme, kahraman dışında hiçbir öğe filmin %25'inden uzun yaşamaz →
  kalıcı katman kurulamaz, vurgu rengi tek doruk an için). Yasak unsur listesi: `src/system/principles.ts → forbidden`.
- Açıklayıcı film, sabit sayfa şablonu değil: dev nesne, kadrajdan taşma, mikroskop yakınlığı serbest.
- Bilgiyi önce görüntü verir; metin yalnızca görüntünün söyleyemediğini söyler. Ekran metni dış sesin kısaltmasıdır;
  görüntüde açıkça görüleni dış ses tekrar etmez (Kavurma: tat kelimeleri yalnızca ekranda).
- Hareket bilgi taşır (bir şey değişiyorsa onu gösterir); süzülme/nefes gibi amaçsız döngü yok. Geçişler anlamlıdır
  (biçim değişimi, kahramanın taşınması, olayın kendisinin geçiş olması — Kavurma: çatlağın kadrajı yarması).
- İtalik ölçülü: cümle ve sayılar düz; metin başına en çok bir italik kelime (denetlenir). İlk bakışta okunabilirlik.
- Yapay zekâ klişelerinden kaçın; duyusal etkiyi renk, ölçek, kadraj, yüzey ve tempo kurar.

## 2. Hook ve kurgu

- Hook, kitlenin **gündelik deneyiminden ve merakından** kurulur. Bilimsel olarak şaşırtıcı bir bilgi kendiliğinden
  ilgi çekici sayılmaz. Hook'un sorduğu soru filmde gerçekten cevaplanır (Kavurma'da "koku ve tat nereden geliyor?"
  sorusu ancak "yüzlerce aroma bileşiği oluşur" cümlesi eklenince cevaplandı).
- İlk kare boş olmaz; soru/hook ilk karede okunur durumdadır (harf harf beklenmez).
- **Açılış dikkat çeker, ana anlatı dikkati yönetir**: açılış filmin geri kalanından daha cesur olabilir (kontrast,
  tipografik ölçek, kadrajdan taşan büyük nesne). Açılış ayrı değerlendirilir: 2–3 statik alternatif ucuzdur.
- Süre konunun gerektirdiği kadardır (Kavurma ~51 sn); her film `spec` içinde kendi aralığını tanımlar.
- Sayılar yaklaşık ve kaynaklı; "her durumda sabit" izlenimi verilmez ("yüzde altmış kadar artabilir").

## 3. Teknik çözümler (yeniden kullanılabilir, `src/system/`)

| Sorun | Çözüm | Dosya |
|---|---|---|
| İtalik, Türkçe aksan (İ Ş Ç Ğ), alt uzantılar maskede kırpılıyor | Harf sınırları gerçek tarayıcıda piksel piksel ölçülür; maske yalnızca alt kenardan, **piksel** cinsinden keser (`em` kırpan kutunun kendi küçük font boyutuna göre çözülür — eski hata). fontSize'ı değiştirilen özel metinde pay ayrıca hesaplanır | `type.tsx`, `glyph-metrics.json`, `tools/glyphs.ts` |
| Metin animasyonu bitmeden kesiliyor | Animasyon ≠ okuma: `textSpan` oturma karesini hesaplar; okuma (0,8 sn + 0,2 sn/kelime) tam göründükten sonra başlar; final ≥ 2,5 sn; film final metinden önce bitemez | `timing.ts`, `principles.ts` |
| Makro↔mikro geçişte katmanlar "dijital eriyor" | İç yapı opaklıkla açılıp kapanmaz; ayrıntı düzeyi öğenin **ekrandaki boyutundan** türetilir (renk komşusuna karışır); zum üstel (`lerpScale`), odak sabit | `motion.ts`; örnek: `films/kavurma/illustration/Bean.tsx` |
| Aynı yerde metin giriş/çıkışı üst üste biniyor | Sonraki metin, önceki tamamen çekildikten sonra girer (audit: aynı anda tek metin) | `principles.ts` |
| Ani kaybolmalar | Her öğe kesmeden önce sıfıra iner; sabit `ease` sözlüğü | `motion.ts` |
| Zamanlama tutarsızlığı | Tek zaman kaynağı `script.ts`; ses olayları aynı kareleri kullanır; her kare saf zaman fonksiyonu (tohumlu rastgelelik) | `principles.ts`, `organic.ts` |
| "Bu karede bu neden var?" | `npm run why -- <film> <kare>` | `tools/audit.ts` |

Bilinen ufak durum: aynı kod iki ayrı render'da birkaç karede gözle görülmeyen piksel farkı üretebilir (PSNR ≥ 48 dB);
deterministiklik içerik düzeyindedir.

## 4. Dış ses

- **Hedef karakter:** sıcak, sakin, samimi, doğal; Headspace benzeri rafine; spiker/reklam sesi değil, sohbet tonu.
- **Referans filmde:** ElevenLabs ile elle üretilmiş bir kayıt ("explainer soothing" sesi). Dosya adından okunan
  ayarlar stability ≈ 56, similarity ≈ 78; model doğrulanamadı — yeni üretimde ayarları arayüzden not edin.
  Ölçülen: 44,1 kHz mono, −18,5 LUFS, tepe −1,1 dBTP, doğal hız 4,8–6,4 hece/sn (ort. ~5,3).
- **Yazım:** konuşma dili; kısa, tek dinleyişte anlaşılan cümleler; noktalı virgül yok; görüntüyü tekrar etme;
  duraklamalara yer bırak. Hece/sn (Türkçede hece = sesli harf) yalnızca yardımcı ölçüt.
- **Önce kayıt, sonra zamanlama.** Kayıt yalnızca duraklamaların ortasından bölünür, gerekirse araya sessizlik eklenir;
  germe/kompresyon/reverb yok. Önemli görsel olayda dış ses susabilir, anlatımı efekt devralır (Kavurma: "…civarında"
  → ~0,9 sn beklenti → çatlama). Sessizlik anlatımın parçasıdır.
- **Hizalama:** öncelik kelime zaman damgası veren TTS ya da forced alignment (ör. TTS'in timestamp çıktısı,
  WhisperX, Montreal Forced Aligner — kullanılabilirse). Model indirilemeyen ortamda `tools/audio/hizala.py`:
  sessizlik tespiti + hece çekirdeği (300–3000 Hz enerji tepeleri), ±~40 ms; hızlı/yutulan heceler sayımı ±1–2
  kaydırabilir → sonuç bloklar ve duraklamalarla gözle doğrulanır.
- API entegrasyonu henüz yok; gelecekte TTS + zaman damgası birlikte alınırsa 4–5. adımlar otomatikleşir.

## 5. Ses tasarımı

- Görsel minimalizm işitsel zenginliğe engel değil. Yumuşak kayma, organik pop, dokunsal tık, çınlama/pluck, kâğıt,
  porselen — her biri bir görsel olayın anlamını taşır, o olayın karesine **atağıyla** (ters çalınanlarda **sonuyla**)
  hizalanır (`tools/audio/mix.py`). Her animasyona ses konmaz; fon müziği varsayılan olarak yok.
- Gerçek kayıt ↔ sentez amaca göre: dokunsal/organik olaylar için kayıt; kayıtla bulunamayan sürekli doku için sentez.
  Doruk anı katmanlı sentezle yapmak "vurmalı enstrüman" gibi duyuldu → gerçek kayıt.
- **Referans miks (başlangıç değeri, kural değil):** dış sese işlem yok; efekt veriyolu dış ses konuşurken −2,5 dB
  (atak 40 ms, bırakış 300 ms); konuşmanın ortasına düşen efektler tek tek geri çekilir; doruk an (dış sessiz) konuşma
  seviyesinde. Sonuç: −18,9 LUFS, gerçek tepe −1,1 dBTP, clipping yok, konuşmanın gövdesinde efektler ~5 dB altta.
  **Aşırı korumacı miks efektleri yok eder** (ilk iki denemede efektler "zayıf" bulundu).
- Kütüphane: `audio/library/` (yalnızca CC0, kaynak/commit kaydı `sources.json`). Kenney ve Freesound gibi sitelere
  ağ erişimi yoksa Kenney CC0 paketlerinin özgün lisans dosyalı GitHub aynaları kullanılabilir. Mixkit/Pixabay CC0
  değildir: filmde kullanılabilir, depoya girmez.

## 6. Tekrarlanmayacak hatalar

- Kalıcı "dergi" arayüzü (künye, folyo, ayraç, bölüm etiketi, HUD) — hareket hâlinde kalabalık durdu.
- Geç başlayan, sakin/öngörülebilir, bilimsel şema gibi açılış; harf harf beklenen soru.
- Final metninin animasyon bitmeden kesilmesi; aynı noktada üst üste binen metinler; tahmini maske payı.
- Opaklıkla kapanan katmanlar; dekoratif hareket.
- Dış sesin görüntüyü tekrar etmesi; tahmini zaman kodlarına güvenmek (zamanlama daima gerçek kayıttan).
- Katmanlı sentezle doruk sesi; aşırı korumacı efekt seviyeleri; 5 dB ducking.
- Lisansı sayfadan kontrol etmeden ses kullanmak; CC0 olmayanı depoya eklemek.
- Ses değişti diye görüntüyü yeniden render etmek.
- Dinlemeden "ses iyi" demek.
