const getColors = require('./utils/getColors');

const test = async () => {
  console.time('getColors');
  const info = await getColors({
    headless: process.argv.includes('--headless'),
    videoId: 'VPLCk-FTVvw',
    localFileSystem: true,
  });
  console.timeEnd('getColors');

  console.log('Scraped Metadata', info?.videoInfo?.metadata);
  console.log('Scraped Palettes', info?.videoInfo?.palettes);
};

test();
