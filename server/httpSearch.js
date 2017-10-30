const express = require('express');
const uniqid = require('uniqid');
const messageBus = require('./messageBus');
const { getStayBookendNights, getUniqueAvailableListings } = require('./helpers');

const createService = (inventoryStore) => {
  const service = express();

  service.get('/search/:visitId/:userId/:market/:checkin/:checkout/:limit*?', (req, res) => {
    const { market, limit } = req.params;
    const { firstNight, lastNight } = getStayBookendNights(req.params);
    inventoryStore.getAvailableListings(market, firstNight, lastNight, limit)
      .then((results) => {
        const listings = getUniqueAvailableListings(results);
        res.status(200).send(listings);
        messageBus.publishSearchEvent(uniqid(), req.params, listings);
      })
      .catch(console.error);
  });

  service.get('/search/:visitId/:userId/:market/:limit*?', (req, res) => {
    const { market, limit } = req.params;
    inventoryStore.getListings(market, limit)
      .then((listings) => {
        res.status(200).send(listings);
        messageBus.publishSearchEvent(uniqid(), req.params, listings);
      })
      .catch(console.error);
  });

  return service;
};

module.exports = createService;
