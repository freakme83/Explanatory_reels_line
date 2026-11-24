"""Aday ses efektlerini dinlemeden ön eleme: ölçüm tablosu + spektrogram sayfası.

Kullanım:
    python3 tools/audio/ses_incele.py cikti.png "klasor/**/*.ogg" ...
Her dosya için süre, etkin süre, atak, tepe, spektral merkez, alçak/yüksek enerji oranı yazdırır ve
spektrogram + zarf görüntüsü üretir. Yalnızca ön elemedir: karakteri (ör. "enstrüman gibi mi") ancak
dinleme doğrular — dinleyemiyorsanız bunu raporda açıkça belirtin.
"""
import glob, os, subprocess, sys
import numpy as np, scipy.signal as sg
from PIL import Image, ImageDraw

SR = 48000


def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(float)


def main(out, pats):
    files = [f for p in pats for f in sorted(glob.glob(p, recursive=True))]
    W, H, cols = 360, 200, 4
    sheet = Image.new('RGB', (cols * W, ((len(files) + cols - 1) // cols) * (H + 20)), (20, 20, 20)); d = ImageDraw.Draw(sheet)
    for i, f in enumerate(files):
        x = load(f); a = np.abs(x); pk = a.max() + 1e-9
        env = np.sqrt(np.convolve(x ** 2, np.ones(480) / 480, 'same')) + 1e-9
        on = np.flatnonzero(env > pk * 10 ** (-30 / 20)); eff = (on[-1] - on[0]) / SR if len(on) else 0
        X = np.abs(np.fft.rfft(x * np.hanning(len(x)))); fq = np.fft.rfftfreq(len(x), 1 / SR)
        print(f'{os.path.basename(f):38s} {len(x)/SR:5.2f}s etkin {eff:4.2f}s atak {a.argmax()/SR*1000:5.0f}ms tepe {20*np.log10(pk):6.1f}dB '
              f'merkez {(X*fq).sum()/X.sum():6.0f}Hz alçak {X[fq<300].sum()/X.sum():.2f} yüksek {X[fq>4000].sum()/X.sum():.2f}')
        seg = x[:int(0.8 * SR)]
        fr, _, Z = sg.spectrogram(seg, SR, nperseg=512, noverlap=448)
        Z = 10 * np.log10(Z + 1e-12); Z = np.clip((Z - Z.max() + 70) / 70, 0, 1)[fr < 12000][::-1]
        im = Image.fromarray((Z * 255).astype(np.uint8)).resize((W, H)).convert('RGB'); dd = ImageDraw.Draw(im)
        e = np.abs(seg); n = max(1, len(e) // W)
        for k in range(W):
            c = e[k * n:(k + 1) * n]; dd.line([(k, H - 1), (k, H - 1 - int((c.max() if len(c) else 0) / (e.max() + 1e-9) * 40))], fill=(255, 200, 0))
        X0, Y0 = (i % cols) * W, (i // cols) * (H + 20); sheet.paste(im, (X0, Y0)); d.text((X0 + 4, Y0 + H + 3), os.path.basename(f) + '  (0,8 sn, 0–12 kHz)', fill=(230, 230, 230))
    sheet.save(out); print('→', out)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2:])
