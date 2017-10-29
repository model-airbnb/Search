const uniqid = require('uniqid');
const sqs = require('./amazonSQS');

module.exports.publishSearchRequest = (params) => {
  const {
    visitId, userId, market, checkin, checkout, roomType, limit,
  } = params;

  const searchQueryId = uniqid('search-');
  const messagePayload = {
    searchQueryId,
    timestamp: new Date(),
    visitId,
    userId,
    market,
    checkIn: checkin ? new Date(checkin) : 'dateless',
    checkOut: checkout ? new Date(checkout) : 'dateless',
    roomType: roomType || 'any',
    limit: limit || 'no limit',
  };

  sqs.publish({ topic: 'SearchRequest', payload: messagePayload });
};
