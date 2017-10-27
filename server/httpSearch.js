const express = require('express');

const createService = (inventoryStore) => {
  const service = express();

  service.get('/search/:market', (req, res) => {
    const { market } = req.params;
    inventoryStore.getListings(market)
      .then((listings) => {
        res.status(200).send(listings);
      })
      .catch(console.error);
  });

  service.get('/search/:market/:limit', (req, res) => {
    const { market, limit } = req.params;
    inventoryStore.getListings(market, limit)
      .then((listings) => {
        res.status(200).send(listings);
      })
      .catch(console.error);
  });

  service.get('/search/:market/:checkin/:checkout/:limit', (req, res) => {
    const {
      market, checkin, checkout, limit,
    } = req.params;
    inventoryStore.getAvailableListings(market, checkin, checkout, limit)
      .then((listings) => {
        res.status(200).send(listings);
      })
      .catch(console.error);
  });

  return service;
};

module.exports = createService;
