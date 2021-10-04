const { putVideo } = require('../utils/AWS')
const { OKResponse, badRequest, serverError } = require('../utils/common')

exports.handler = async (event) => {
  const { body } = JSON.parse(event.body)
  if(body) {
    const [result, error] = await getError(putVideo(event.body))
    return error ? serverError(error) : OKResponse(result)
  } else {
    return badRequest('Please, provide an entry to submit')
  }
}
