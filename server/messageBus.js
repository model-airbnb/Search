const sqs = require('./amazonSQS');

const TOPIC_SEARCH = 'search-availability';

module.exports.publishSearchEvent
  = (searchEventId, searchParams, searchResults, responseTimeline) => {
    const {
      visitId, userId, market, checkin, checkout, roomType, limit,
    } = searchParams;

    const messagePayload = {
      searchEventId,
      searchRequest: {
        timestamp: responseTimeline.start.timestamp,
        visitId,
        userId,
        market,
        checkIn: checkin || 'dateless',
        checkOut: checkout || 'dateless',
        roomType: roomType || 'any',
        limit: limit || 'no limit',
      },
      searchResults,
      responseTimeline,
    };

    sqs.publish({ topic: TOPIC_SEARCH, payload: messagePayload });
  };
