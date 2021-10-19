// Sleep function that can be awaited
exports.delay = function (time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

//An improvised selector detection function
exports.doesElementExist = async (page, selector) => {
  try {
    await page.waitForSelector(selector, {timeout: 100})
    return true
  } catch(_) {
    return false
  }
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
