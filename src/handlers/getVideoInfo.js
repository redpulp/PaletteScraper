const { getVideo } = require('../utils/AWS')
const { badRequest, OKResponse } = require('../utils/common')

exports.handler = async (event) => {
  const { id } = event?.queryStringParameters
  if(id) {
    const result = await getVideo(id)
    return OKResponse(result)
  } else {
    return badRequest('No id detected')
  }
}
