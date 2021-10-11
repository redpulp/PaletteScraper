const getColors = require("./utils/getColors");

const test = async () => {
  console.time('getColors')
  const result = await getColors({
    headless: true,
    videoId: 'tcYodQoapMg',
    localFileSystem: true
  })
  console.timeEnd('getColors')
  console.log(result.palettes[0])
}

test()