const sqs = require('./amazonSQS');

const TOPIC_SEARCH = 'search';
const MVP_MARKET = 'San Francisco';

module.exports.searchInbox = sqs.queues.searchInbox;
module.exports.inventoryInbox = sqs.queues.inventoryInbox;
module.exports.recommendationInbox = sqs.queues.recommendationInbox;

module.exports.publishSearchEvent = (searchEventId, params, results, timeline) => {
  const {
    userId, market, checkIn, checkOut, roomType, limit,
  } = params;

  const messagePayload = {
    searchEventId,
    timestamp: timeline.httpSearchRequest.timestamp,
    request: {
      userId,
      market,
      roomType: roomType || 'any',
      limit: limit || 'no limit',
    },
    results,
    timeline,
  };
  if (checkIn && checkOut) {
    messagePayload.request.checkIn = checkIn;
    messagePayload.request.checkOut = checkOut;
  }

  sqs.publish({ topic: TOPIC_SEARCH, payload: messagePayload }, market === MVP_MARKET);
};

module.exports.checkForMessages = inbox =>
  sqs.poll(inbox)
    .then((messages) => {
      if (messages.length === 0) return [];
      const messageBodies = messages.map(message => JSON.parse(message.Body));
      sqs.done(inbox, messages);
      return messageBodies;
    })
    .catch(console.error);
