const sqs = require('./amazonSQS');

const TOPIC_SEARCH = 'search';

const publishSearchEvent = (searchEventId, params, results, timeline) => {
  const {
    visitId, userId, market, checkin, checkout, roomType, limit,
  } = params;

  const messagePayload = {
    searchEventId,
    request: {
      timestamp: timeline.start.timestamp,
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

  sqs.publish({ topic: TOPIC_SEARCH, payload: messagePayload });
};

const checkForMessages = topic =>
  sqs.poll()
    .then((messages) => {
      const relevantMessages = messages.filter(message => JSON.parse(message.Body).topic === topic);
      sqs.done(relevantMessages);
      return relevantMessages;
    })
    .catch(console.error);

module.exports = {
  TOPIC_SEARCH,
  publishSearchEvent,
  checkForMessages,
};
