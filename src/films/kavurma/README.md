# Kavurma — referans film (onaylı)

Kahve çekirdeğinin kavrulurken geçirdiği fiziksel dönüşüm. 1080×1920, 30 fps, 51,0 sn (1531 kare), Türkçe dış sesli.
Kareler: `docs/referans/kavurma_kareler.jpg`. Üretim: `npm run film -- kavurma` (çatlama kaydı gerekli, aşağıda).
**Onaylı nihai sürümdür; görüntüsü ve sesi değiştirilmez.** Yeni filmler için şablon/örnek olarak okunur.

## Kurgu
Fincan (ilk karede soru: "Bu koku, bu tat nereden geliyor?") → kahve yüzeyi biçim değiştirip kavrulmuş çekirdeğe döner
→ zaman geri sarılır, yeşil çekirdek → mikro: hücreler ve su → makro: ısınma, renk izleri (aroma cümlesi) →
mikro: buhar ve basınç → dev çekirdek, 196°C → dış ses susar, **çatlama** → sayfa çatlaktan yarılır → hacim (+%60) →
terazi (−%15) → tat: tek çekirdek açıktan koyuya (meyvemsi / karamelimsi / acımsı, yalnızca ekranda) → çekirdek
fincana döner → "Fincandaki tat, bu dönüşümün hafızasıdır."

## Bu filme özgü kararlar (kural değil)
Buz mavisi açılış/kapanış zemini ve büyük, kadrajdan taşan fincan; çekirdeğin baştan sona kahraman olması; kavurma renk
ölçeği; tek vurgu rengi olarak kırmızı "Çat."; ölçek değişimleri (makro↔mikro) ile ilerleyen anlatı; açılışın
filmin geri kalanından daha cesur olması. Seçim süreci: 3 açılış alternatifi (buz mavisi / kiremit / hardal) →
buz mavisi paleti + iki satırlı sola hizalı soru.

## Dosyalar
`script.ts` işaret listesi + metin + zamanlama · `recording.ts` dış ses ölçümleri ve klipler · `Film.tsx` sahneleme ·
`illustration/Bean.tsx`, `Cup.tsx` filme özgü illüstrasyon (Bean içindeki kamera/LOD deseni yeniden kullanılabilir) ·
`ses.ts` 46 ses olayı ve nihai miks değerleri.

## Dış ses
`audio/vo/kavurma.mp3` — ElevenLabs ile elle üretildi ("explainer soothing"; stability ≈ 56, similarity ≈ 78 dosya
adından). Kullanımı, onu üreten hesabın ElevenLabs planı koşullarına tabidir; başka projede yeniden kullanmayın.
Kayıt 8 klibe yalnızca duraklamaların ortasından bölündü (`recording.ts → CLIPS`, her klibin gerekçesiyle);
zaman germe yok. Çatlamada dış ses yoktur (bilinçli).

## Ses
CC0: Kenney (Impact, Interface, RPG Audio) + Meta Open Sound naylon gitar — `audio/library/`.
Çatlama: Freesound 878408 "Egg drop" (debbicar, **CC BY 4.0**) — depoda değil; `audio/external/KAYNAKLAR.md`'deki
adla oraya konmalı. **Yayında atıf zorunlu:** *"Egg drop" by debbicar (freesound.org/s/878408), CC BY 4.0, kısaltılmıştır.*

## Doğruluk notu
Sayılar yaklaşık, orta kavurma içindir; dış ses "yaklaşık / kadar / civarında / -e yakın" der. Yayın öncesi uzman okuması önerilir.

| İfade | Değer | Kaynaklardaki aralık | Durum |
|---|---|---|---|
| Yeşil çekirdekte su | — | %10–12 nem (ICO %8–12,5) | Uygun |
| Isıyla renk değişir, yüzlerce aroma bileşiği oluşur | — | Kavrulmuş kahvede 800–1000+ uçucu bileşik (yeşilde ~200); Maillard + karamelizasyon | Uygun, temkinli |
| Birinci çatlama | ~196°C | ~196–205°C | Aralığın alt ucu, "civarında" |
| Çatlamanın nedeni | buhar + basınç | su buharı ve CO₂ basıncı | Uygun |
| Hacim artışı | +%60 ("kadar artabilir") | %50–100 | Temkinli |
| Ağırlık kaybı | −%15 ("su ve gaz kaybıyla … -e yakın") | %12–20; çoğu su, kalanı uçucular/CO₂ | Uygun |
| Tat eğilimi | meyvemsi / karamelimsi / acımsı | koyulaştıkça asitlik azalır, karamelize/acı notalar artar; köken, işleme, demleme de belirler | Genel eğilim |
| Dakika izleri | temsili eğri | tipik kavurma 9–15 dk | Temsili; ekranda dakika yok |

Kaynaklar (Kasım 2026): saveur.com/article/Wine-and-Drink/Artisanal-Roasting-101 · twochimpscoffee.com/blogs/how-coffee-changes-when-its-roasted ·
coffeeresearch.org/coffee/roasting.htm · perfectdailygrind.com/2017/08/roaster-guide-why-is-green-bean-moisture-content-important ·
pmc.ncbi.nlm.nih.gov/articles/PMC7914306 · pmc.ncbi.nlm.nih.gov/articles/PMC8346979 · pmc.ncbi.nlm.nih.gov/articles/PMC12224095 ·
coffeereview.com/coffee-reference/coffee-categories/roast-styles/roasting-chemistry
