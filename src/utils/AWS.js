const AWS = require('aws-sdk');
const client = new AWS.DynamoDB.DocumentClient();

exports.getVideo = async (id) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: 'id = :videoid',
    ExpressionAttributeValues: {
      ':videoid': id,
    },
  };
  return await client.query(params).promise();
};

exports.putVideo = async (body) => {
  const params = {
    Item: body,
    TableName: process.env.TABLE_NAME,
  };
  return await client.put(params).promise();
};

exports.updateScrapedVideo = async (video, body) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      id: video.id,
      uploaded: video.uploaded,
    },
    UpdateExpression: 'set #p = :p, #s = :s, #m = :m',
    ExpressionAttributeNames: {
      '#p': 'palettes',
      '#s': 'scraped',
      '#m': 'metadata',
    },
    ExpressionAttributeValues: {
      ':p': body.palettes,
      ':m': body.metadata,
      ':s': 'x',
    },
  };
  return await client.update(params).promise();
};
