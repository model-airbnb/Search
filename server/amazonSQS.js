const AWS = require('aws-sdk');
const config = require('./aws.config');

AWS.config.update({
  accessKeyId: process.env.SQS_ACCESS_KEY || config.accessKey,
  secretAccessKey: process.env.SQS_SECRET_KEY || config.secretKey,
});

const sqs = new AWS.SQS({ region: process.env.SQS_REGION || config.region });

const queues = {
  searchQuery: 'https://sqs.us-west-1.amazonaws.com/766255721592/modelAirbnb-searchQueries',
};

module.exports.publish = (message, name) => {
  const sqsParams = {
    MessageBody: JSON.stringify(message),
    QueueUrl: queues[name],
  };

  sqs.sendMessage(sqsParams, (err) => {
    if (err) throw err;
  });
};
