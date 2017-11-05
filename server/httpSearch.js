const express = require('express');
const uniqid = require('uniqid');
const recommendationStore = require('../recommendationStore/model');
const messageBus = require('../messageBus/index');
const {
  OperationLog, fetchListings, fetchCoefficients, sortListings,
} = require('./helpers');

const log = new OperationLog('httpSearchRequest');

const createService = (inventoryStore) => {
  const service = express();

  service.get('/search/:userId/:market/:checkIn/:checkOut/:limit*?', (req, res) => {
    Promise.all([
      fetchListings(req.params, inventoryStore, log),
      fetchCoefficients(req.params, recommendationStore)
    ])
      .then(([inventory, scoring]) => {
        const listings = sortListings(inventory, scoring);
        res.status(200).send(listings);
        log.add('httpSearchResponse');
        messageBus.publishSearchEvent(uniqid(), req.params, listings, log.getLog());
      })
      .catch(console.error);
  });

  service.get('/search/:userId/:market/:limit*?', (req, res) => {
    const { market, limit } = req.params;
    log.add('dbFetch');
    inventoryStore.getListings(market, limit)
      .then((listings) => {
        log.add('dbResults');
        res.status(200).send(listings);
        log.add('httpSearchResponse');
        messageBus.publishSearchEvent(uniqid(), req.params, listings, log.getLog());
      })
      .catch(console.error);
  });

  return service;
};

module.exports = createService;
