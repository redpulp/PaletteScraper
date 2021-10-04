const getColors = require("./utils/getColors");

const test = async () => {
  console.time('getColors')
  await getColors({headless: true, videoId: 'tcYodQoapMg'})
  console.timeEnd('getColors')
}

test()