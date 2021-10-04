"use strict";
const fs = require('fs')

const { delay, getError } = require('./common')

const puppeteer = require('puppeteer-extra')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin())

const ColorThief = require('colorthief')
const convert = require('color-convert')

// Puppeteer
const chromium = require('chrome-aws-lambda')
const puppeteerExtra = puppeteer.addExtra(chromium.puppeteer)

const videoFrame = '#movie_player > div.html5-video-container > video'

//An improvised selector detection function
const doesElementExist = async (page, selector) => {
  try {
    await page.waitForSelector(selector, {timeout: 100})
    return true
  } catch(_) {
    return false
  }
}

const agreeToCookies = async (page) => {
  const iAgree = '#content > div.body.style-scope.ytd-consent-bump-v2-lightbox > div.footer.style-scope.ytd-consent-bump-v2-lightbox > div.buttons.style-scope.ytd-consent-bump-v2-lightbox > ytd-button-renderer:nth-child(2)'
  try {
    //Accepting cookies from google
    await page.waitForSelector(iAgree)
    await page.click(iAgree)
    console.info("getColors.agreeToCookies", 'OK')
  } catch (err) {
    console.error("getColors.agreeToCookies", err)
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

const denyYoutubeMusic = async (page) => {
  const denyMusicSelector = '#dismiss-button > a'

  //Removing YouTube Music pop-up
  const denyMusicElement = await doesElementExist(page, denyMusicSelector)
  if(denyMusicElement) {
    await page.click(denyMusicSelector)
    console.info("getColors.denyYoutubeMusic", 'POP-UP FOUND')
  } else {
    console.info("getColors.denyYoutubeMusic", 'POP-UP NOT FOUND')
  }
}

const getColors = async ({ headless, videoId, local=true }) => {
  let browser
  if(local) {
    browser = await puppeteer.launch({
      headless,
      args: ['--mute-audio']
    })
  } else {
    browser = await puppeteerExtra.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    })
  }
  const page = await browser.newPage()
  await page.goto(`https://www.youtube.com/watch?v=${videoId}`, {
    waitUntil: 'domcontentloaded'
  })

  await agreeToCookies(page)
  await removeAds(page)
  await denyYoutubeMusic(page)

  await page.waitForSelector(videoFrame)
  const frame = await page.$(videoFrame)
  
  let palettes = []

  //Creating temporary screenshots folder
  const folderPath = `${__dirname}/pics`
  fs.mkdir(folderPath,
    err => {if (err?.code !== 'EEXIST' && err) console.error(err)}
  )

  for (let i = 0; i < 10; i++) {
    // Skip to next video section
    frame.type(`${i}`)
    // Let the video load to get rid of loading icon
    await delay(3500)
    // Get screenshot
    const imagePath = `${folderPath}/${i}.png`
    await frame.screenshot({path: imagePath})
    
    // Get screenshot's palette in RGB values
    const [palette, err] = await getError(ColorThief.getPalette(imagePath))

    if (err) console.error(err)
    else palettes = [...palettes, palette.map(convert.rgb.hsl)]
  }

  //Deleting temp folder
  fs.rmdir(folderPath, {recursive: true}, 
    err => {if (err) console.error(err)}
  )

  browser.close()
  return palettes
}

module.exports = getColors
