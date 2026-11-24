"""Film sesi: dış ses yerleşimi + efektler + miks. Görüntüden bağımsızdır (görüntü yeniden render edilmez).

Kullanım:  python3 tools/audio/mix.py <film>
Girdi : out/<film>/events.json  (npm run events -- <film> üretir; kaynağı src/films/<film>/ses.ts)
Çıktı : out/<film>/dis_ses.wav, efektler.wav, karisim.wav, hizalama.txt

Kurallar (bkz. AGENTS.md / docs/sistem.md):
- Dış sese hiçbir işlem uygulanmaz; kayıt yalnızca duraklamaların ortasından bölünmüş klipler hâlinde yerleştirilir.
- Her efektin atağı (align=onset) ya da sonu (align=end, ters çalınanlar) olay karesine düşer.
- Dış ses konuşurken yalnızca efekt veriyolu `duck_db` kadar alçalır.
- Miks tepesi −1 dBFS'yi aşarsa hata verir (clipping yok); düzeltme efekt seviyelerinden yapılır.
"""
import json, os, subprocess, sys
import numpy as np
import soundfile as sf

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dsp import SR, t_, lp, hp, brown, norm  # noqa: E402

db = lambda x: 10 ** (x / 20)


def decode(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def place(buf, x, at):
    a = max(0, at); b = min(len(buf), at + len(x))
    if b > a:
        buf[a:b] += x[a - at:b - at]


def rate(x, r):
    if r == 1.0:
        return x
    return np.interp(np.arange(int(len(x) / r)) * r, np.arange(len(x)), x)


def onset(x, rel_db=-20):
    a = np.abs(x); return int(np.flatnonzero(a > a.max() * db(rel_db))[0])


def tail(x, rel_db=-30):
    a = np.abs(x); return int(np.flatnonzero(a > a.max() * db(rel_db))[-1])


def crop(x, c):
    """Kayıttan tek olay seç: atak öncesi pre_ms, toplam len_ms, sonda fade_ms; isteğe bağlı yüksek geçiren ve yumuşak doygunluk."""
    on = onset(x, -30)
    a = max(0, on - int(c.get('pre_ms', 3) / 1000 * SR)); b = on + int(c['len_ms'] / 1000 * SR)
    seg = x[a:b].copy()
    f = int(c.get('fade_ms', 30) / 1000 * SR); seg[-f:] *= np.linspace(1, 0, f) ** 1.5
    f0 = int(0.002 * SR); seg[:f0] *= np.linspace(0, 1, f0)
    seg = hp(seg, c.get('hp_hz', 40)) / np.abs(seg).max()
    k = c.get('saturate')
    return np.tanh(k * seg) / np.tanh(k) if k else seg


def heat(h, fps):
    """Isınma/basınç gibi sürekli doku: alçak geçirgen kahverengi gürültü, yavaş dalgalanma, seviye zarfı."""
    a, b, p = h['frame'], h['endFrame'], h['pressureFrom']
    d = (b - a) / fps; tt = t_(d)
    tex = hp(lp(brown(d), 750), 110)
    tex = norm(tex) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.37 * tt + 1.1)) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.11 * tt))
    fr = a + tt * fps
    return tex * db(np.interp(fr, [a, a + 45, p, b - 30, b], [-80, h['gain_db'], h['gain_db'], h['peak_db'], -80]))


def main(film):
    out_dir = os.path.join(ROOT, 'out', film)
    ev = json.load(open(os.path.join(out_dir, 'events.json')))
    fps = ev['fps']; N = int(round(ev['totalFrames'] / fps * SR)); f2s = lambda fr: int(round(fr / fps * SR))

    # dış ses
    vo = np.zeros(N)
    if ev.get('voice'):
        src = decode(os.path.join(ROOT, ev['voice']['file'])); fade = int(0.015 * SR); ramp = np.linspace(0, 1, fade)
        for c in ev['voice']['clips']:
            seg = src[int(round(c['rec'][0] * SR)):int(round(c['rec'][1] * SR))].copy()
            if c['rec'][0] > 0:
                seg[:fade] *= ramp
            seg[-fade:] *= ramp[::-1]
            place(vo, seg, f2s(c['atFrame']))

    # efektler
    s = np.zeros(N); log = []
    for h in ev.get('textures', []):
        place(s, heat(h, fps), f2s(h['frame']))
    for e in ev['sfx']:
        path = os.path.join(ROOT, e['file'])
        if not os.path.exists(path):
            raise SystemExit(f"Ses dosyası yok: {e['file']} ({e['id']}). Kaynağı: audio/*/KAYNAKLAR.md")
        x = crop(decode(path), e['crop']) if e.get('crop') else norm(decode(path))
        x = rate(x, e.get('rate', 1.0))
        if e.get('reverse'):
            x = x[::-1].copy(); fl = int(0.01 * SR); x[:fl] *= np.linspace(0, 1, fl)
        x = x * db(e['gain_db']); at = f2s(e['frame'])
        ref = tail(x) if e.get('align') == 'end' else onset(x)
        place(s, x, at - ref); log.append((e['id'], e['frame'], (at - ref + ref) / SR * fps))

    # ducking: yalnızca efekt veriyolu
    d = ev.get('duck', {}); hop = 240
    env = np.sqrt(np.convolve(vo ** 2, np.ones(1440) / 1440, 'same'))[::hop]
    active = (20 * np.log10(env + 1e-12) > d.get('threshold_db', -42)).astype(float)
    g = np.empty_like(active); cur = 0.0
    up, dn = 1 - np.exp(-hop / (d.get('attack_s', 0.04) * SR)), 1 - np.exp(-hop / (d.get('release_s', 0.30) * SR))
    for i, v in enumerate(active):
        cur += (v - cur) * (up if v > cur else dn); g[i] = cur
    s = s * (1 - (1 - db(-d.get('db', 2.5))) * np.interp(np.arange(N), np.arange(len(g)) * hop, g))

    m = vo + s; pk = 20 * np.log10(np.abs(m).max() + 1e-12)
    if pk > -1.0:
        raise SystemExit(f'miks tepe {pk:.2f} dBFS (> −1): efekt seviyelerini düşürün')
    for name, x in [('dis_ses.wav', vo), ('efektler.wav', s), ('karisim.wav', m)]:
        sf.write(os.path.join(out_dir, name), x.astype(np.float32), SR, subtype='PCM_24')
    with open(os.path.join(out_dir, 'hizalama.txt'), 'w') as fh:
        fh.write('olay\tplan_kare\tyerlesen_kare\n')
        for i, f, got in log:
            fh.write(f'{i}\t{f}\t{got:.2f}\n')
    worst = max((abs(got - f) for _, f, got in log), default=0)
    print(f'→ out/{film}/dis_ses.wav, efektler.wav, karisim.wav · {len(log)} efekt, en büyük hizalama farkı {worst:.3f} kare · tepe {pk:.2f} dBFS')


if __name__ == '__main__':
    main(sys.argv[1])
