const { inventoryInbox, checkForMessages } = require('../messageBus/index');
const inventoryDbConnection = require('./config').dbConnection;
const Inventory = require('./index');

const inventoryStore = new Inventory(inventoryDbConnection);

const MAX_WORKERS = process.argv[2] || 1;
const TOPIC_INVENTORY = 'Inventory';
const TOPIC_AVAILABILITY = 'Availability';
const UPDATE_TYPE_ADD = 'ADD';
const UPDATE_TYPE_REMOVE = 'REMOVE';
const SLEEP_MS = 2000;

const processInventoryUpdate = message => inventoryStore.addOrUpdateListing(message);

const processAvailabilityUpdate = (message) => {
  const availabilityUpdateHandlers = {
    [UPDATE_TYPE_ADD]: inventoryStore.addOrUpdateAvailability.bind(inventoryStore),
    [UPDATE_TYPE_REMOVE]: inventoryStore.deleteAvailability.bind(inventoryStore),
  };
  const availabilityUpdates = message.date.map((inventoryDate, index) => {
    const update = {
      listingId: message.listingId,
      inventoryDate,
      price: message.price[index],
    };
    return availabilityUpdateHandlers[message.updateType](update);
  });
  return Promise.all(availabilityUpdates);
};

const messageHandlers = {
  [TOPIC_INVENTORY]: processInventoryUpdate,
  [TOPIC_AVAILABILITY]: processAvailabilityUpdate,
};

const processInventoryEvents = (id) => {
  const taskTimeStart = Date.now();
  let messages;
  checkForMessages(inventoryInbox)
    .then((messageBatch) => {
      messages = messageBatch;
      const dbUpdates = messages.map(message =>
        messageHandlers[message.topic](message.payload) || Promise.resolve());
      return Promise.all(dbUpdates);
    })
    .then(() => {
      setTimeout(processInventoryEvents.bind(this, id), SLEEP_MS);
      console.log(`${id}, messages processed: ${messages.length}, time lapsed: ${Date.now() - taskTimeStart}`);
    })
    .catch(console.error);
};

for (let i = 1; i <= MAX_WORKERS; i += 1) {
  processInventoryEvents(i);
}
