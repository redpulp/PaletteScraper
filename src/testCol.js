const getColors = require("./utils/getColors");

const test = async () => {
  const response = await getColors({headless: false, videoId: 'tcYodQoapMg', convertToHex: true})
  console.log(response)
}

test()