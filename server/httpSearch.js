const express = require('express');
const uniqid = require('uniqid');
const recommendationStore = require('../recommendationStore/model');
const messageBus = require('../messageBus/index');
const {
  OperationLog, fetchListings, fetchCoefficients, sortListings,
  HTTP_REQUEST, FETCH_LISTINGS, FETCH_SCORING, SORT_LISTINGS,
} = require('./helpers');

const createService = (inventoryStore) => {
  const service = express();

  service.get('/search/:userId/:market/:checkIn/:checkOut/:limit*?', (req, res) => {
    const log = new OperationLog(HTTP_REQUEST);
    log.startTimer([FETCH_LISTINGS, FETCH_SCORING]);
    Promise.all([
      fetchListings(req.params, inventoryStore, log),
      fetchCoefficients(req.params, recommendationStore, log)
    ])
      .then(([inventory, scoring]) => {
        log.startTimer([SORT_LISTINGS]);
        const listings = sortListings(inventory, scoring);
        log.stopTimer([SORT_LISTINGS]);
        res.status(200).send(listings);
        log.stopTimer([HTTP_REQUEST]);
        messageBus.publishSearchEvent(uniqid(), req.params, listings, log.get());
      })
      .catch(console.error);
  });

  service.get('/search/:userId/:market/:limit*?', (req, res) => {
    const log = new OperationLog(HTTP_REQUEST);
    const { market, limit } = req.params;
    inventoryStore.getListings(market, limit)
      .then((listings) => {
        res.status(200).send(listings);
        log.stopTimer([HTTP_REQUEST]);
        messageBus.publishSearchEvent(uniqid(), req.params, listings, log.get());
      })
      .catch(console.error);
  });

  return service;
};

module.exports = createService;
