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
        roomType: roomType || 'any',
        limit: limit || 'no limit',
      },
      searchResults,
      responseTimeline,
    };

    if (checkin && checkout) {
      messagePayload.searchRequest.checkIn = checkin;
      messagePayload.searchRequest.checkOut = checkout;
    }

    sqs.publish({ topic: TOPIC_SEARCH, payload: messagePayload });
  };
