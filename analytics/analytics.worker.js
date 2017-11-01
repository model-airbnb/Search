const { checkForMessages } = require('../messageBus/index');
const elasticSearch = require('./elasticSearch');

const MAX_WORKERS = process.argv[2] || 10;
const ES_INDEX = 'searchevents';
const ES_TYPE_QUERY = 'query';
const ES_TYPE_RESULTS = 'results';
const ES_TYPE_PERFORMANCE = 'performancelog';
const SLEEP_MS = 2000;

const processSearchEvents = (id) => {
  const taskTimeStart = Date.now();
  let messages;
  checkForMessages()
    .then((messageBatch) => {
      messages = messageBatch.map(message => message.payload);
      const searchQueries = messages.map(message =>
        Object.assign({ searchEventId: message.searchEventId }, message.request));
      elasticSearch.bulkInsertDocuments(ES_INDEX, ES_TYPE_QUERY, searchQueries);
    })
    .then(() => {
      const searchResults = messages.map(message =>
        Object.assign({ searchEventId: message.searchEventId, timestamp: message.request.timestamp }, message.results));
      elasticSearch.bulkInsertDocuments(ES_INDEX, ES_TYPE_RESULTS, searchResults);
    })
    .then(() => {
      const searchResponseTimes = messages.map(message =>
        Object.assign({ searchEventId: message.searchEventId, timestamp: message.request.timestamp }, message.timeline));
      elasticSearch.bulkInsertDocuments(ES_INDEX, ES_TYPE_PERFORMANCE, searchResponseTimes);
    })
    .then(() => {
      setTimeout(processSearchEvents.bind(this, id), SLEEP_MS);
      console.log(`${id}, messages processed: ${messages.length}, time lapsed: ${Date.now() - taskTimeStart}`);
    })
    .catch(console.error);
};

for (let i = 1; i <= MAX_WORKERS; i += 1) {
  processSearchEvents(i);
}
