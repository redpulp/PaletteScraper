const { getColors } = require("../src/getColors");
jest.setTimeout(60000)

test('Checking consistency between headless and headful mode', async () => {
  const headlessRes = await getColors({headless: true})
  const headfulRes = await getColors({headless: false})
  // headlessRes.map()
  expect( headlessRes ).toEqual( headfulRes )
})