const getColors = require('../src/utils/getColors');
jest.setTimeout(60000);

test('Checking consistency between headless and headful mode', async () => {
  jest.setTimeout(60000);
  const headlessRes = await getColors({
    headless: true,
    videoId: 'tcYodQoapMg',
    localFileSystem: true,
  });
  const headfulRes = await getColors({
    headless: false,
    videoId: 'tcYodQoapMg',
    localFileSystem: true,
  });
  // headlessRes.map()
  expect(headlessRes).toEqual(headfulRes);
});
