# Kola + V60 — ikinci film

Sıcak su yerine vanilyalı kolayla V60 demlemek: neden köpürür, bu kadar şekerli bir sıvı kahveden bir şey çözebilir mi,
neden yine de beğenilir. 1080×1920, 30 fps, ~63,8 sn (1915 kare), Türkçe dış ses, altyazı ayrı SRT.
Üretim: `npm run film -- kola-v60` · altyazı: `npm run srt -- kola-v60`.

## Kurgu
Gerçek görüntü (viral kolalı V60 videoları, ağır çekim) → "Arkasındaki bilim": mürekkep V60'ı izler, fotoğraf kâğıda
döner → çizilmiş yatak köpürür → tek kabarcığın içine dalış → tek kahve parçacığı: koladaki gaz pürüzlü çukurlarda
kabarcık olur → "kavurmadan kalan gaz": parçacığın içine dalış, Kavurma'daki petek hücreler yakından; gaz cepleri
şişer, çatlaklardan kolaya kaçar; geri çıkış → parçacık çekilir, kola şekerle dolar
(**118 g** · şeker · 1 litre kolada) → **dolu otobüs**: koltuklar dolar, kapı kahve aromasının yüzüne kapanır, sessizlik,
**"Kalır."**, koltuklar suya erir → fark: kahveye özgü bileşikler bol akar, kafein seyrek (kolada zaten var); "soğuk ve
şekerli" ile her şey yavaşlar → sıcak su / kola yan yana → refraktometre şekeri de sayıp saçma bir değere tırmanır →
tat: acılık çizgisi şekerle törpülenir; vanilya ve kavrulmuş kahve aromaları birbirine sarılır → gerçek tadım
görüntüsü → kâğıda basılmış fotoğraf + "Kimse *şikayetçi* değil."

## Bu filme özgü kararlar (kural değil)
Gerçek görüntüyle açılış ve kapanış; kola kâğıdı (#EADBC2) ve buz mavisi koltuklar; molekül dili (`molecules.tsx`:
şeker halkası, kafein, kahve aroması damlası, su = soluk çizgiler, kadrajın çoğunluğu); dolu otobüs metaforu ve
kapıya çarpan aroma; tek vurgu "Kalır."; naylon gitar bilgi anlarında. Bilimsel incelikler dış seste uyarı olarak
değil, görüntüde: moleküller hiç sabit durmaz, su çoğunluktadır, kafein akışı seyrek ve koladaki kafein görünür,
yavaşlama hareketin kendisiyle anlatılır. Ekranda "temsili/şematik" dipnotu yoktur (`docs/sistem.md`).

## Dosyalar
`script.ts` işaret listesi + zamanlama · `recording.ts` dış ses cümleleri, kelime anları, klipler · `kelimeler.json`
kelime zaman damgaları · `Film.tsx` sahneleme · `scenes.tsx` Sahne 4–5 (otobüs, fark) · `film-scenes.tsx` diğer
sahneler · `molecules.tsx` molekül dili · `ses.ts` ses olayları.

## Depoda olmayan girdiler (yeniden üretmek için)
- **Dış ses** `audio/vo/kola-v60.mp3`: ElevenLabs, kullanıcının kendi ses klonu (eleven_v4; iki çekimden ilki).
  Kişisel ses klonu olduğu için depoya girmez. Metin: `recording.ts → REC.sentences` (sırayla).
  s07 ("Üstelik bir de kavurmadan kalan gaz var.") kullanıcı tarafından aynı sesle yeniden seslendirildi:
  `audio/vo/kola-v60-s07.mp3` (vurgu Türkçeye uygun olsun diye); `recording.ts → ALT_S07`, klip `N`.
- **Görüntü** `public/external/kola-v60/`: üçüncü taraf videolardan kırpılmış klipler; depoya girmez.
  Kaynak tek bir ekran kaydı (996×1770, 60 fps). Instagram arayüzü ve Rusça altyazılar kırpıldı; ağır çekim 0,4–0,6×.

| Dosya | Kaynak (saniye) | Hız | Kırpma (x:y:w:h) | Hesap |
|---|---|---|---|---|
| op1.mp4 | 0,00–0,90 | 0,6× | 0:46:868:1544 | @created2coffee |
| op2.mp4 | 1,35–2,24 | 0,6× | 48:46:772:1372 | @maxmamedov.coffee |
| op3.mp4 | 2,85–3,14 | 0,4× | 0:46:868:1544 | @pullandpourcoffee |
| op4.mp4 | 3,17–3,57 | 0,4× | 0:46:868:1544 | @created2coffee |
| op5.mp4 (+ op5_son.png) | 2,26–2,82 | 0,5× | 48:46:772:1372 | @maxmamedov.coffee |
| fin1.mp4 | 3,60–4,88 | 0,5× | 0:46:868:1544 | @created2coffee |
| fin2.mp4 (+ fin2_son.png) | 4,92–6,28 | 0,5× | 70:46:772:1372 | @maxmamedov.coffee |

Komut: `ffmpeg -i kaynak.mov -vf "trim=start=A:end=B,setpts=(PTS-STARTPTS)/HIZ,crop=…,scale=1080:1920:flags=lanczos,fps=30,format=yuv420p" -an -c:v libx264 -crf 14 op1.mp4`;
`_son.png` = klibin son karesi. Hesap adları açılışta birlikte, finalde her klipte gösterilir.
**Yayın öncesi:** görüntü sahiplerinden kullanım izni alınması önerilir.

## Ses
CC0: Kenney + Meta naylon gitar + Freesound CC0 dökülme/köpürme kayıtları (`audio/library/freesound-cc0/`).
Miks: efekt veriyolu dış sesin ~12 LU altında (Kavurma ile aynı denge), ducking 2,5 dB; kayıt referanstan sessiz olduğu
için yalnızca sabit +0,4 dB ana kazanç. Sonuç ≈ −21 LUFS, tepe −1,1 dBFS.

## Doğruluk notu
| İfade | Değer / anlatım | Kaynak | Durum |
|---|---|---|---|
| Gaz pürüzlü yüzeyde kabarcık olur | heterojen çekirdeklenme | Liger-Belair 2019; Coffey 2008 | Uygun |
| Kavurmadan kalan gaz | hücrelerden CO₂ çıkışı | Smrke 2017 | Uygun |
| 1 litre vanilyalı kolada şeker | ~118 g ("yaklaşık") | Coca-Cola ABD: 42 g / 355 mL | ABD ürünü; ülkeye göre değişebilir |
| "Kalır." / suyun koltuk sayısı yok | çok çözünmüş madde ≠ doygunluk | çözünürlük bileşiğe özgü | Uygun (koltuklar metafor, eriyerek bozulur) |
| Kafein farklı | kolada kafein var → geçiş farkı küçülür | konsantrasyon farkı | Görselde: seyrek akış + koladaki kafein |
| Soğuk ve şekerli → yavaş | difüzyon yavaşlar, viskozite artar | Telis 2007; Fuller & Rao 2017 | Uygun |
| Sıcak demleme kadar çözünmesi çok zor | ölçülmemiş çıkarım | — | Kontrollü deney yok; görsel karşılaştırma niteliksel |
| Refraktometre şekeri de sayar | kahve kalibrasyonu kolada geçersiz | refraktometre ilkesi | Ekrandaki %9,6 bir okuma örneğidir, ölçüm değil |
| Şeker acılığı bastırır | duyusal baskılama | Calviño 1990 | Uygun |
| Vanilya kavrulmuş notalarla anlaşabilir | "anlaşabilir" | — | Duyusal panel yok; hipotez dille korunur |
