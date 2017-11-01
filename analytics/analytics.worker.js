const { TOPIC_SEARCH, checkForMessages } = require('../messageBus/index');
const elasticSearch = require('./elasticSearch');

const ES_INDEX = 'searchEvents';
const ES_TYPE_QUERY = 'searchQuery';
const ES_TYPE_RESULTS = 'searchResults';
const ES_TYPE_PERFORMANCE = 'searchPerformance';
const SLEEP_IN_MS = 5000;

const processSearchEvents = () => {
  let messages;
  checkForMessages(TOPIC_SEARCH)
    .then((messageBatch) => {
      messages = messageBatch;
      const searchQueries = messages.map(message =>
        Object.assign({ searchEventId: message.Body.searchEventId }, message.Body.request));
      elasticSearch.bulkInsertDocuments(ES_INDEX, ES_TYPE_QUERY, searchQueries);
    })
    .then(() => {
      const searchResults = messages.map(message =>
        Object.assign({ searchEventId: message.Body.searchEventId }, message.Body.results));
      elasticSearch.bulkInsertDocuments(ES_INDEX, ES_TYPE_RESULTS, searchResults);
    })
    .then(() => {
      const searchResponseTimes = messages.map(message =>
        Object.assign({ searchEventId: message.Body.searchEventId }, message.Body.timeline));
      elasticSearch.bulkInsertDocuments(ES_INDEX, ES_TYPE_PERFORMANCE, searchResponseTimes);
    })
    .catch(console.error);
};

setInterval(processSearchEvents, SLEEP_IN_MS);
