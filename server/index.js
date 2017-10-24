const inventoryDbConnection = require('../inventoryLocalStore/config').dbConnection;
const Inventory = require('../inventoryLocalStore/index');

const inventoryStore = new Inventory(inventoryDbConnection);
const service = require('./httpSearch')(inventoryStore);
const server = require('http').Server(service);

const port = process.env.PORT || 4568;

server.listen(port, () => {
  console.log(`Model Airbnb Search service running on port ${port}`);
});
