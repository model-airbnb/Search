const express = require('express');
const uniqid = require('uniqid');
const messageBus = require('./amazonSQS');

const getStayBookendNights = (params) => {
  const lastNight = new Date(params.checkout);
  lastNight.setDate(lastNight.getDate() - 1);
  return { firstNight: params.checkin, lastNight: lastNight.toJSON().split('T')[0] };
};

const searchQueryMessage = (params) => {
  const {
    visitId, userId, market, checkin, checkout, roomType,
  } = params;

  const searchQueryId = uniqid('search-');
  const messagePayload = {
    searchQueryId,
    timestamp: new Date(),
    visitId,
    userId,
    market,
    checkIn: new Date(checkin),
    checkOut: new Date(checkout),
    roomType: roomType || 'any',
  };

  return { searchQueryId, messagePayload };
};

const createService = (inventoryStore) => {
  const service = express();

  service.get('/search/:visitId/:userId/:market/:checkin/:checkout/:limit*?', (req, res) => {
    const { market, limit } = req.params;
    const { firstNight, lastNight } = getStayBookendNights(req.params);
    const { messagePayload } = searchQueryMessage(req.params);
    inventoryStore.getAvailableListings(market, firstNight, lastNight, limit)
      .then((listings) => {
        res.status(200).send(listings);
      })
      .catch(console.error);
    messageBus.publish({ payload: messagePayload }, 'searchQuery');
  });

  service.get('/search/:visitId/:userId/:market/:limit*?', (req, res) => {
    const { market, limit } = req.params;
    inventoryStore.getListings(market, limit)
      .then((listings) => {
        res.status(200).send(listings);
      })
      .catch(console.error);
  });

  return service;
};

module.exports = createService;
