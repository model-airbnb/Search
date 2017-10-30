const sqs = require('./amazonSQS');

const TOPIC_SEARCH = 'search-availability';

module.exports.publishSearchEvent = (searchEventId, searchParams, searchResults) => {
  const {
    visitId, userId, market, checkin, checkout, roomType, limit,
  } = searchParams;

  const messagePayload = {
    searchEventId,
    searchRequest: {
      timestamp: new Date(),
      visitId,
      userId,
      market,
      checkIn: checkin ? new Date(checkin) : 'dateless',
      checkOut: checkout ? new Date(checkout) : 'dateless',
      roomType: roomType || 'any',
      limit: limit || 'no limit',
    },
    searchResults,
  };

  sqs.publish({ topic: TOPIC_SEARCH, payload: messagePayload });
};
