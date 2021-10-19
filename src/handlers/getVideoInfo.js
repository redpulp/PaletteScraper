const { getVideo } = require('../utils/AWS')
const { badRequest, OKResponse } = require('../utils/common')

exports.handler = async (event) => {
  const { id } = event?.queryStringParameters
  if(id) {
    try{
      const result = await getVideo(id)
      return OKResponse(result.Items)
    } catch(err) {
      return serverError(err)
    }
  } else {
    return badRequest('No id detected')
  }
}
