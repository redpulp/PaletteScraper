'use strict';
// Node libraries
const fs = require('fs');
// Internal modules
const {
  delay,
  doesElementExist,
  getInfo,
  agreeToCookies,
  removeAds,
  denyYoutubeMusic,
} = require('./scrapeUtils');

// External libraries
const ColorThief = require('colorthief');
const convert = require('color-convert');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

const getColors = async ({ headless, videoId, localFileSystem = false }) => {
  // Combining Puppeteer-extra with chrome-aws-lambda
  const { addExtra } = require('puppeteer-extra');
  const chromium = require('chrome-aws-lambda');
  const puppeteerExtra = addExtra(chromium.puppeteer);
  puppeteerExtra.use(AdblockerPlugin());

  const browser = await puppeteerExtra.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    defaultViewport: { width: 1280, height: 720 },
    headless,
  });

  const page = await browser.newPage();
  await page.goto(`https://www.youtube.com/watch?v=${videoId}`, {
    waitUntil: 'domcontentloaded',
  });

  await agreeToCookies(page);
  await removeAds(page);
  await denyYoutubeMusic(page);

  // Checking validity of video ID provided
  const videoErrorSelector = '#player-error-message-container';
  const isVideoError = await doesElementExist(page, videoErrorSelector);
  if (isVideoError) {
    browser.close();
    return { scrapingError: 'This video could not be rendered' };
  }

  try {
    const metadata = await getInfo(page);

    const videoFrame = '#movie_player > div.html5-video-container > video';
    const frame = await page.$(videoFrame);

    let palettes = [];

    //Creating temporary screenshots folder
    const folderPath = localFileSystem ? `${__dirname}/tmp` : `/tmp/${videoId}`;
    fs.mkdir(folderPath, (err) => {
      if (err?.code !== 'EEXIST' && err) console.error(err);
    });

    for (let i = 1; i < 10; i++) {
      // Skip to next video section
      frame.type(`${i}`);

      // Let the video load to get rid of loading icon
      await delay(350);

      // Get screenshot
      const imagePath = `${folderPath}/${i}.png`;
      await frame.screenshot({ path: imagePath });

      // Get screenshot's palette in RGB values
      try {
        const palette = await ColorThief.getPalette(imagePath);

        const convertedPalettes = palette
          .map(convert.rgb.hsl)
          .map((hsl) => ({ h: hsl[0], s: hsl[1], l: hsl[2] }));

        palettes = [...palettes, convertedPalettes];
      } catch (err) {
        console.error('Palette Extraction Error: ', err);
      }
    }

    // Deleting temp folder
    fs.rmdir(folderPath, { recursive: true }, (err) => {
      if (err) console.error(err);
    });

    browser.close();
    return { videoInfo: { palettes, metadata } };
  } catch (err) {
    browser.close();
    return { scrapingError: err };
  }
};

module.exports = getColors;
