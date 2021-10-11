const getColors = require("../utils/getColors")
const AWS = require('aws-sdk');
const { updateScrapedVideo } = require("../utils/AWS");
const { unmarshall } = AWS.DynamoDB.Converter

exports.handler = async (event) => {
  for(const record of event.Records) {
    if(record.eventName === 'INSERT') {
      const newImage = unmarshall(record.dynamodb.NewImage)
      const {palettes, scrapingError} = await getColors({
        headless: true,
        videoId: newImage.id
      })
      if(scrapingError) {
        console.error(scrapingError)
        return
      } else {
        try{
          const updatedVideo = await updateScrapedVideo(newImage, {palettes})
          console.log('Video successfully scraped', updatedVideo)
        } catch(err) {
          console.error(err)
        }
      }
    }
  }
}