import { msdfGenerator, CHARSET_ALPHABET } from 'msdf-generator';

msdfGenerator({
  fontID: 'myfont',
  charset: CHARSET_ALPHABET,
  textureSize: 256,
  ttfFile: './fonts/AveriaSerifLibre-Light.ttf',
  output: './fonts/output'
});
