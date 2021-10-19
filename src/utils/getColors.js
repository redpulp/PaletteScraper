"use strict";
// Node libraries
const fs = require('fs')
// Internal modules
const { delay, doesElementExist } = require('./common')
// External libraries
const ColorThief = require('colorthief')
const convert = require('color-convert')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')

const agreeToCookies = async (page) => {
  const iAgreeSelector = '#content > div.body.style-scope.ytd-consent-bump-v2-lightbox > div.footer.style-scope.ytd-consent-bump-v2-lightbox > div.buttons.style-scope.ytd-consent-bump-v2-lightbox > ytd-button-renderer:nth-child(2)'
  await delay(2000)
  
  //Accepting cookies from google
  const iAgreeElement = await doesElementExist(page, iAgreeSelector)
  if(iAgreeElement) {
    await page.click(iAgreeSelector)
    console.info("getColors.agreeToCookies", 'COOKIES POP-UP FOUND')
  } else {
    console.info("getColors.agreeToCookies", 'COOKIES POP-UP NOT FOUND')
  }
}

const removeAds = async (page) => {
  const adModule = layer => `#player-overlay\\:${layer} > div.ytp-ad-player-overlay-instream-info`
  
  await delay(3000)
  let adLayer = undefined
  let adSelector = ""
  //Searching ad layer with different selectors
  for (let i = 0; i < 10; i++) {
    adSelector = adModule(i + 1)
    adLayer = await doesElementExist(page, adSelector)
    if(adLayer) break
  }
  if(adLayer) {
    //Checking if ad layer is still present
    while(adLayer) {
      await delay(5000)
      adLayer = await doesElementExist(page, adSelector)
    }
    console.info("getColors.removeAds", 'AD FOUND')
  } else {
    console.info("getColors.removeAds", 'AD NOT FOUND')
  }
}

const getInfo = async (page) => {
  const moreButtonSelector = '#more > yt-formatted-string'
  const moreButton = await doesElementExist(page, moreButtonSelector)
  if(moreButton) await page.click(moreButtonSelector)

  const fieldSelector = '#collapsible > ytd-metadata-row-renderer'
  //THIS WORKS BUT THE INNER HTML MUST BE PARSED (???)
  const elements = await page.evaluate(() => {
    const desctiptionClass = 'style-scope ytd-metadata-row-container-renderer'
    const descriptions = Array.from(document.getElementsByClassName(desctiptionClass)).map(el => el.innerHTML)
    return descriptions
  })

  const titleSelector = '#title > yt-formatted-string'
  const infoSelector = '#content > yt-formatted-string'

  console.log({elements})
  return elements
}

const denyYoutubeMusic = async (page) => {
  const denyMusicSelector = '#dismiss-button > a'

  //Removing YouTube Music pop-up
  const denyMusicElement = await doesElementExist(page, denyMusicSelector)
  if(denyMusicElement) {
    await page.click(denyMusicSelector)
    console.info("getColors.denyYoutubeMusic", 'YT MUSIC POP-UP FOUND')
  } else {
    console.info("getColors.denyYoutubeMusic", 'POP-UP NOT FOUND')
  }
}

const getColors = async ({ headless, videoId, localFileSystem=false }) => {
  let browser
  
  // Combining Puppeteer-extra with chrome-aws-lambda
  const {addExtra} = require('puppeteer-extra')
  const chromium = require('chrome-aws-lambda')
  const puppeteerExtra = addExtra(chromium.puppeteer)
  puppeteerExtra.use(AdblockerPlugin())

  browser = await puppeteerExtra.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    defaultViewport: { width: 1280, height: 720 },
    headless
  })
  
  
  const page = await browser.newPage()
  await page.goto(`https://www.youtube.com/watch?v=${videoId}`, {
    waitUntil: 'domcontentloaded'
  })

  await agreeToCookies(page)
  await removeAds(page)
  await denyYoutubeMusic(page)

  // Checking validity of video ID provided
  const videoError = '#player-error-message-container'
  const isVideoError = await doesElementExist(page, videoError)
  if(isVideoError) {
    browser.close()
    return {scrapingError: "This video could not be rendered"}
  }

  const videoInfo = await getInfo(page)
  
  const videoFrame = '#movie_player > div.html5-video-container > video'
  const frame = await page.$(videoFrame)
  
  let palettes = []

  //Creating temporary screenshots folder
  const folderPath = localFileSystem ? `${__dirname}/tmp` : `/tmp/${videoId}`
  fs.mkdir(folderPath,
    err => {if (err?.code !== 'EEXIST' && err) console.error(err)}
  )

  throw 'HALP'
  
  for (let i = 0; i < 10; i++) {
    // Skip to next video section
    frame.type(`${i}`)
    // Let the video load to get rid of loading icon
    await delay(3500)
    // Get screenshot
    const imagePath = `${folderPath}/${i}.png`
    await frame.screenshot({path: imagePath})
    
    // Get screenshot's palette in RGB values
    try {
      const palette = await ColorThief.getPalette(imagePath)
      const convertedPalettes = palette
        .map(convert.rgb.hsl)
        .map(hsl => ({h: hsl[0], s: hsl[1], l: hsl[2]}))
      palettes = [...palettes, convertedPalettes]
    } catch(err) {
      console.error(err)
    }
  }

  // Deleting temp folder
  fs.rmdir(folderPath, {recursive: true}, 
    err => {if (err) console.error(err)}
  )

  browser.close()
  return {palettes}
}

module.exports = getColors
