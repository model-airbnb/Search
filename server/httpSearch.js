const express = require('express');
const messageBus = require('./messageBus');

const getStayBookendNights = (params) => {
  const lastNight = new Date(params.checkout);
  lastNight.setDate(lastNight.getDate() - 1);
  return { firstNight: params.checkin, lastNight: lastNight.toJSON().split('T')[0] };
};

const createService = (inventoryStore) => {
  const service = express();

  const publishSearchRequest = (req, res, next) => {
    messageBus.publishSearchRequest(req.params);
    next();
  };

  service.get('/search/:visitId/:userId/:market/:checkin/:checkout/:limit*?', publishSearchRequest, (req, res) => {
    const { market, limit } = req.params;
    const { firstNight, lastNight } = getStayBookendNights(req.params);
    inventoryStore.getAvailableListings(market, firstNight, lastNight, limit)
      .then((listings) => {
        res.status(200).send(listings);
      })
      .catch(console.error);
  });

  service.get('/search/:visitId/:userId/:market/:limit*?', publishSearchRequest, (req, res) => {
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
