const getColors = require("../utils/getColors")
const AWS = require('aws-sdk');
const {unmarshall} = AWS.DynamoDB.Converter

exports.handler = async (event) => {
  console.log('records', event.Records)
  for(const record of event.Records) {
    if(record.eventName === 'INSERT') {
      const newImage = unmarshall(record.dynamodb.NewImage)
      console.log(newImage)
      const {palettes, error} = await getColors({
        headless: true,
        videoId: newImage.id,
        local: false
      })
      console.log({palettes, error})
    }
  }
}