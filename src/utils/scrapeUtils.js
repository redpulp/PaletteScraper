const delay = function (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
};

const doesElementExist = async (page, selector) => {
  try {
    await page.waitForSelector(selector, { timeout: 100 });
    return true;
  } catch (_) {
    return false;
  }
};

const getInfo = async (page) => {
  const moreButtonSelector = '#more > yt-formatted-string';
  const moreButton = await doesElementExist(page, moreButtonSelector);
  if (moreButton) await page.click(moreButtonSelector);

  const elements = await page.evaluate(() => {
    const titleSelector = '#title > yt-formatted-string';
    const infoSelector = '#content > yt-formatted-string';

    const selectedFields = ['Song', 'Artist', 'Album'];
    const boilerPlateTags = [
      'Music in this video',
      'Learn more',
      'Listen ad-free with YouTube Premium',
    ];

    const contentExtractor = (selector) =>
      Array.from(document.querySelectorAll(selector)).map(
        (el) => el.textContent
      );

    const titles = contentExtractor(titleSelector).filter((el) => !!el);
    const info = contentExtractor(infoSelector).filter(
      (el) => !boilerPlateTags.includes(el)
    );
    return titles.reduce(
      (acc, cur, i) => ({
        ...acc,
        ...(selectedFields.includes(cur) ? { [cur]: info[i] } : {}),
      }),
      {}
    );
  });

  return elements;
};

const agreeToCookies = async (page) => {
  const iAgreeSelector =
    '#content > div.body.style-scope.ytd-consent-bump-v2-lightbox > div.footer.style-scope.ytd-consent-bump-v2-lightbox > div.buttons.style-scope.ytd-consent-bump-v2-lightbox > ytd-button-renderer:nth-child(2)';

  await delay(2000);

  //Accepting cookies from google
  const iAgreeElement = await doesElementExist(page, iAgreeSelector);

  if (iAgreeElement) {
    await page.click(iAgreeSelector);
    console.info('getColors.agreeToCookies', 'COOKIES POP-UP FOUND');
  } else {
    console.info('getColors.agreeToCookies', 'COOKIES POP-UP NOT FOUND');
  }
};

const removeAds = async (page) => {
  const adModule = (layer) =>
    `#player-overlay\\:${layer} > div.ytp-ad-player-overlay-instream-info`;

  await delay(3000);
  let adLayer = undefined;
  let adSelector = '';

  //Searching ad layer with different selectors
  for (let i = 0; i < 10; i++) {
    adSelector = adModule(i + 1);
    adLayer = await doesElementExist(page, adSelector);
    if (adLayer) break;
  }
  if (adLayer) {
    //Checking if ad layer is still present
    while (adLayer) {
      await delay(5000);
      adLayer = await doesElementExist(page, adSelector);
    }
    console.info('getColors.removeAds', 'AD FOUND');
  } else {
    console.info('getColors.removeAds', 'AD NOT FOUND');
  }
};

const denyYoutubeMusic = async (page) => {
  const denyMusicSelector = '#dismiss-button > a';

  //Removing YouTube Music pop-up
  const denyMusicElement = await doesElementExist(page, denyMusicSelector);
  if (denyMusicElement) {
    await page.click(denyMusicSelector);
    console.info('getColors.denyYoutubeMusic', 'YT MUSIC POP-UP FOUND');
  } else {
    console.info('getColors.denyYoutubeMusic', 'POP-UP NOT FOUND');
  }
};

module.exports = {
  delay,
  doesElementExist,
  getInfo,
  agreeToCookies,
  removeAds,
  denyYoutubeMusic,
};
