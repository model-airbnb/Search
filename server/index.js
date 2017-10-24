const express = require('express');
const inventoryDbConnection = require('../inventoryLocalStore/config').dbConnection;
const Inventory = require('../inventoryLocalStore/index');

const service = express();
const server = require('http').Server(service);

const inventoryStore = new Inventory(inventoryDbConnection);

const port = process.env.PORT || 4568;

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

server.listen(port, () => {
  console.log(`Model Airbnb Search service running on port ${port}`);
});
