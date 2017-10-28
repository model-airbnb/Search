const express = require('express');

const getStayBookendNights = (params) => {
  const lastNight = new Date(params.checkout);
  lastNight.setDate(lastNight.getDate() - 1);
  return { firstNight: params.checkin, lastNight: lastNight.toJSON().split('T')[0] };
};

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

  service.get('/search/:market/:checkin/:checkout', (req, res) => {
    const { market } = req.params;
    const { firstNight, lastNight } = getStayBookendNights(req.params);
    inventoryStore.getAvailableListings(market, firstNight, lastNight)
      .then((listings) => {
        res.status(200).send(listings);
      })
      .catch(console.error);
  });

  service.get('/search/:market/:checkin/:checkout/:limit', (req, res) => {
    const { market, limit } = req.params;
    const { firstNight, lastNight } = getStayBookendNights(req.params);
    inventoryStore.getAvailableListings(market, firstNight, lastNight, limit)
      .then((listings) => {
        res.status(200).send(listings);
      })
      .catch(console.error);
  });

  return service;
};

module.exports = createService;
