# Explanatory Reels Line

Kod ile üretilen kısa, dikey, editoryal açıklayıcı videolar (1080×1920, 30 fps) için üretim hattı:
Remotion + React + TypeScript ile kare kare deterministik görüntü; dış ses ve ses efektleri Python araçlarıyla
görüntüye kare hassasiyetinde bağlanır.

- **Ajanlar ve geliştiriciler için başlangıç:** [`AGENTS.md`](AGENTS.md)
- İlkeler, teknik çözümler, dersler: [`docs/sistem.md`](docs/sistem.md)
- Yeni video öncesi tarz soruları: [`docs/stil-briefi.md`](docs/stil-briefi.md)
- Referans film: [`src/films/kavurma/`](src/films/kavurma/README.md) — kareler: `docs/referans/kavurma_kareler.jpg`

```
src/system/        yeniden kullanılabilir tasarım sistemi (tokens, hareket, maskeli metin, ilkeler+denetim, zamanlama)
src/films/<film>/  her film: script.ts, Film.tsx, recording.ts, ses.ts, README.md
tools/             render, denetim, harf ölçümü, olaylar; tools/audio: miks, hizalama, ses ön eleme
audio/library/     yalnızca CC0 efektler (kaynak kaydıyla)   audio/vo/  dış ses kayıtları
audio/external/    atıf gerektiren sesler (git'e girmez; yalnızca KAYNAKLAR.md)
public/fonts/      yazı tipleri (SIL OFL)
```

Lisanslar: [`LICENSES.md`](LICENSES.md).
