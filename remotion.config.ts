import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setConcurrency(4);
// Bulut ortamında önceden kurulu Chromium kullanılır.
if (process.env.KT_BROWSER) {
  Config.setBrowserExecutable(process.env.KT_BROWSER);
}
