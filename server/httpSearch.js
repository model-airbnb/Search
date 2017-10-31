const express = require('express');
const uniqid = require('uniqid');
const messageBus = require('../messageBus/index');
const { OperationLog, getStayBookendNights, getUniqueAvailableListings } = require('./helpers');

const createService = (inventoryStore) => {
  const service = express();

  service.get('/search/:visitId/:userId/:market/:checkin/:checkout/:limit*?', (req, res) => {
    const request = new OperationLog('httpSearchRequest');
    const { market, limit } = req.params;
    const { firstNight, lastNight } = getStayBookendNights(req.params);
    request.log('dbFetch');
    inventoryStore.getAvailableListings(market, firstNight, lastNight, limit)
      .then((results) => {
        request.log('dbResults');
        const listings = getUniqueAvailableListings(results);
        res.status(200).send(listings);
        request.log('httpSearchResponse');
        messageBus.publishSearchEvent(uniqid(), req.params, listings, request.getLog());
      })
      .catch(console.error);
  });

  service.get('/search/:visitId/:userId/:market/:limit*?', (req, res) => {
    const request = new OperationLog('httpSearchRequest');
    const { market, limit } = req.params;
    request.log('dbFetch');
    inventoryStore.getListings(market, limit)
      .then((listings) => {
        request.log('dbResults');
        res.status(200).send(listings);
        request.log('httpSearchResponse');
        messageBus.publishSearchEvent(uniqid(), req.params, listings, request.getLog());
      })
      .catch(console.error);
  });

  return service;
};

module.exports = createService;
