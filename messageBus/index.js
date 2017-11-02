const sqs = require('./amazonSQS');

const TOPIC_SEARCH = 'search';
const MVP_MARKET = 'San Francisco';

module.exports.publishSearchEvent = (searchEventId, params, results, timeline) => {
  const {
    visitId, userId, market, checkin, checkout, roomType, limit,
  } = params;

  const messagePayload = {
    searchEventId,
    timestamp: timeline.httpSearchRequest.timestamp,
    request: {
      visitId,
      userId,
      market,
      roomType: roomType || 'any',
      limit: limit || 'no limit',
    },
    results,
    timeline,
  };
  if (checkin && checkout) {
    messagePayload.request.checkIn = checkin;
    messagePayload.request.checkOut = checkout;
  }

  sqs.publish({ topic: TOPIC_SEARCH, payload: messagePayload }, market === MVP_MARKET);
};

module.exports.checkForMessages = () =>
  sqs.poll()
    .then((messages) => {
      if (messages.length === 0) return [];
      const messageBodies = messages.map(message => JSON.parse(message.Body));
      sqs.done(messages);
      return messageBodies;
    })
    .catch(console.error);
