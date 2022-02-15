const { putVideo, getVideo } = require('../utils/AWS');
const { OKResponse, badRequest, serverError } = require('../utils/common');

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  if (body) {
    const videoBody = {
      ...body,
      uploaded: new Date().getTime(),
    };
    const existingVideo = await getVideo(body.id);
    if (existingVideo?.Count > 0) {
      return badRequest('This video already exists');
    } else {
      try {
        await putVideo(videoBody);
        return OKResponse({ message: 'Video successfully submitted' });
      } catch (err) {
        return serverError(err);
      }
    }
  } else {
    return badRequest('Please, provide an entry to submit');
  }
};
