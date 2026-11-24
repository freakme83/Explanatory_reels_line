"""Dış ses kaydını metne hizalar (model gerektirmeyen yedek yöntem).

Kullanım:
    python3 tools/audio/hizala.py kayit.mp3 metin.txt
metin.txt: her satır bir cümle (kayıttaki sırayla).

Yöntem (V5'te geliştirildi, ±~40 ms):
  1. FFmpeg silencedetect (−34 dB, ≥0,12 sn) → konuşma blokları ve duraklamalar.
  2. 300–3000 Hz bant enerjisinin tepe noktaları → hece çekirdekleri (Türkçede her hecede tek sesli harf).
  3. Blokların hece sayıları, metnin kümülatif hece sayılarıyla eşlenir → cümle başlangıç/bitişleri;
     her cümlenin hece çekirdekleri kelimelere sırayla dağıtılır → kelime başlangıç adayları.
Sınırlar: hızlı/yutulan heceler ve uzun sesliler sayımı ±1–2 kaydırabilir; sonucu bloklar ve duraklamalarla
birlikte gözle doğrulayın. Kelime zaman kodu veren bir TTS ya da forced aligner varsa önce onu kullanın.
"""
import re, subprocess, sys
import numpy as np, scipy.signal as sg

SR = 16000
VOW = re.compile(r'[aeıioöuüâîûAEIİOÖUÜÂÎÛ]')


def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(float)


def pauses(p, noise=-34, d=0.12):
    o = subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', f'silencedetect=noise={noise}dB:d={d}', '-f', 'null', '-'], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', o)]; en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', o)]
    return list(zip(st, en))


def nuclei(x):
    b, a = sg.butter(4, [300 / (SR / 2), 3000 / (SR / 2)], 'band'); y = sg.filtfilt(b, a, x)
    hop, win = int(SR * 0.005), int(SR * 0.03)
    fr = np.lib.stride_tricks.sliding_window_view(y, win)[::hop]
    db = sg.savgol_filter(20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9), 9, 2)
    t = np.arange(len(db)) * hop / SR + win / 2 / SR
    thr = max(np.percentile(db, 20) + 12, db.max() - 32)
    pk, _ = sg.find_peaks(db, prominence=2.5, distance=int(0.085 / 0.005), height=thr)
    return t[pk]


def main(audio, text):
    sents = [l.strip() for l in open(text, encoding='utf-8') if l.strip()]
    x = load(audio); dur = len(x) / SR; pk = nuclei(x); ps = pauses(audio)
    edges = [0.0] + [m for a, b in ps for m in [a, b]] + [dur]
    blocks = [(edges[i], edges[i + 1]) for i in range(0, len(edges) - 1, 2) if edges[i + 1] - edges[i] > 0.05]
    print(f'Süre {dur:.2f} sn · {len(blocks)} konuşma bloğu · {len(pk)} hece çekirdeği · metin {sum(len(VOW.findall(s)) for s in sents)} hece\n')
    print('Bloklar (başlangıç–bitiş, hece çekirdeği):')
    for a, b in blocks:
        print(f'  {a:6.2f}–{b:6.2f}  {int(((pk >= a) & (pk < b)).sum()):3d}')
    # cümle sınırlarını blok sınırlarına eşle: kümülatif hece sayısına en yakın blok sonu
    cum_b = np.cumsum([((pk >= a) & (pk < b)).sum() for a, b in blocks])
    print('\nCümleler (tahmini başlangıç–bitiş, kelime başlangıç adayları):')
    k0, used = 0, 0
    for s in sents:
        n = len(VOW.findall(s)); target = used + n
        k1 = int(np.argmin(np.abs(cum_b - target))); k1 = max(k1, k0)
        a, b = blocks[k0][0], blocks[k1][1]
        syl = pk[(pk >= a) & (pk < b)]
        words, i, starts = s.split(), 0, []
        for w in words:
            starts.append(f'{w}@{syl[min(i, len(syl) - 1)]:.2f}' if len(syl) else w); i += max(1, len(VOW.findall(w)))
        print(f'  {a:6.2f}–{b:6.2f}  {s}\n      ' + ' '.join(starts))
        used = cum_b[k1]; k0 = min(k1 + 1, len(blocks) - 1)


if __name__ == '__main__':
    main(*sys.argv[1:3])
