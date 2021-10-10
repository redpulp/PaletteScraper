const { putVideo } = require('../utils/AWS')
const { OKResponse, badRequest, serverError, getError } = require('../utils/common')

exports.handler = async (event) => {
  const body = JSON.parse(event.body)
  if(body) {
    const videoBody = {
      ...body,
      uploaded: new Date().getTime()
    }
    const {error} = await getError(putVideo(videoBody))
    return error ?
      serverError(error) :
      OKResponse({message: 'Video successfully submitted'})
  } else {
    return badRequest('Please, provide an entry to submit')
  }
}
