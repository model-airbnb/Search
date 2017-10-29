const uniqid = require('uniqid');
const SQS = require('./amazonSQS');

const messageBus = new SQS();

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

  messageBus.publish({ topic: 'SearchRequest', payload: messagePayload });
};
