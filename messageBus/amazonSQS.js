const AWS = require('aws-sdk');
const config = require('./aws.config');

AWS.config.update({
  accessKeyId: process.env.SQS_ACCESS_KEY || config.accessKey,
  secretAccessKey: process.env.SQS_SECRET_KEY || config.secretKey,
});

const sqs = new AWS.SQS({ region: process.env.SQS_REGION || config.region });

const MAX_NUMBER_OF_MESSAGES_TO_RECEIVE = 10;
const MESSAGE_VISIBILITY_TIMEOUT = 10;
const subscribers = [
  config.queue,
];

module.exports.publish = (message) => {
  subscribers.forEach((subscriber) => {
    const sqsParams = {
      QueueUrl: subscriber,
      MessageBody: JSON.stringify(message),
    };
    sqs.sendMessage(sqsParams, (err) => {
      if (err) throw err;
    });
  });
};

module.exports.poll = () => {
  const sqsParams = {
    QueueUrl: config.queue,
    AttributeNames: ['All'],
    MaxNumberOfMessages: MAX_NUMBER_OF_MESSAGES_TO_RECEIVE,
    VisibilityTimeout: MESSAGE_VISIBILITY_TIMEOUT,
  };
  return new Promise((resolve, reject) => {
    sqs.receiveMessage(sqsParams, (err, data) => {
      if (err) reject(err);
      else resolve(data.Messages);
    });
  });
};

module.exports.done = (messages) => {
  const entries = messages.map(message => (
    { Id: message.MessageId, ReceiptHandle: message.ReceiptHandle }
  ));
  const sqsParams = {
    QueueUrl: config.queue,
    Entries: entries,
  };
  sqs.deleteMessageBatch(sqsParams, (err) => {
    if (err) throw err;
  });
};
