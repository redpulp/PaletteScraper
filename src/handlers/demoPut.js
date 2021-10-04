const { putVideo } = require('../utils/AWS')
const { OKResponse, badRequest, serverError } = require('../utils/common')

exports.demoHandler = async (event, context) => {
  const { body } = JSON.parse(event.body)
  if(body) {
    const [result, error] = await getError(putVideo(event.body))
    if(error) {
      return serverError(error)
    } else {
      return OKResponse(result)
    }
  } else {
    return badRequest('Please, provide an entry to submit')
  }
}
