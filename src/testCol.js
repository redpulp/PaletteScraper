const getColors = require('./utils/getColors');

const test = async () => {
  console.time('getColors');
  await getColors({
    headless: false,
    videoId: 'DiItGE3eAyQ',
    localFileSystem: true,
  });
  console.timeEnd('getColors');
};

test();
