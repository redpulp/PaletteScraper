const { getVideo } = require('../utils/AWS')
const { badRequest, OKResponse, getError } = require('../utils/common')

exports.handler = async (event) => {
  const { id } = event?.queryStringParameters
  if(id) {
    const {result, error} = await getError(getVideo(id))
    return error ? serverError(error) : OKResponse(result.Items)
  } else {
    return badRequest('No id detected')
  }
}
