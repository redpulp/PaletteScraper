// Color format conversion
function valToHex(c) {
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

exports.rgbToHex = (r, g, b) =>  `#${valToHex(r)}${valToHex(g)}${valToHex(b)}`

// Sleep function that can be awaited
exports.delay = function (time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

// Format Gateway API response
const APIResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  },
  body: JSON.stringify(body)
})

exports.OKResponse = (body) => APIResponse(200, body)

exports.badRequest = (message) => APIResponse(400, {message})

exports.serverError = (message) => APIResponse(500, {message})

// Better error handling
exports.getError = async (promise) => {
  try {
    const data = await promise
    return [data, null]
  } catch (err) {
    console.error(err)
    return [null, err]
  }
}