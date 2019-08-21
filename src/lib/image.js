import sharp from 'sharp';
import rp from 'request-promise-native';
import config from 'config';
import path from 'path';
import fs from 'fs';

sharp.cache(config.imageable.cache);
sharp.concurrency(config.imageable.concurrency);
sharp.counters(config.imageable.counters);
sharp.simd(config.imageable.simd);

export async function downloadImage (url) {
  return await rp.get(url, { encoding: null });
}

export async function identify (buffer, webpAccept) {
  try {
    const transformer = sharp(buffer);
    console.log(transformer)
    if (webpAccept) {
      transformer.webp({ loseless: true })
    }

    return transformer.metadata();
  } catch (err) {
    console.log(err);
  }
} 

export async function resize (buffer, width, height, webpAccept) {
  try {
    const transformer = sharp(buffer);

    if (width || height) {
      const options = {
        withoutEnlargement: true,
        fit: sharp.fit.inside
      }
      transformer.resize(width, height, options)
    }

    if (webpAccept) {
      // const filePath = path.join(process.cwd(), 'webp-cache', 'abc.webp');
      transformer.webp({ loseless: true })
      // transformer.webp({ loseless: true }).toFile(filePath);
      // return sharp(filePath).toBuffer()
    }

    return transformer.toBuffer();
  } catch (err) {
    console.log(err);
  }
}

export async function fit (buffer, width, height, webpAccept) {
  try {
    const transformer = sharp(buffer);

    if (width || height) {
      transformer.resize(width, height).crop();
    }

    if (webpAccept) {
      transformer.webp({ loseless: true })
    }

    return transformer.toBuffer();
  } catch (err) {
    console.log(err);
  }
}

export async function crop (buffer, width, height, x, y) {
  try {
    const transformer = sharp(buffer);

    if (width || height || x || y) {
      transformer.extract({ left: x, top: y, width, height });
    }

    return transformer.toBuffer();
  } catch (err) {
    console.log(err);
  }
}
