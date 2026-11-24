"""Küçük DSP yardımcıları (numpy/scipy). Lemo-Opuscar core/audio/sfx.py'den uyarlanmıştır (MIT, © 2026 LemoLab).
Her fonksiyon mono float dizisi döndürür @ SR. Gürültü üreteci sabit tohumludur (deterministik)."""
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
_rng = np.random.default_rng(7)


def t_(d): return np.arange(int(round(d * SR))) / SR
def env_exp(d, tau): return np.exp(-t_(d) / tau)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def noise(d): return _rng.standard_normal(int(round(d * SR)))
def norm(x, p=1.0): m = np.abs(x).max(); return x * (p / m) if m > 0 else x


def brown(d):
    w = np.cumsum(noise(d)); w -= np.linspace(w[0], w[-1], len(w)); return norm(hp(w, 20))
