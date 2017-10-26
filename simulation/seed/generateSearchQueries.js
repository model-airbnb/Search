const elasticSearch = require('../../analytics/elasticSearch');

const ES_INDEX = 'searchqueries';
const DATASET_SIZE = 10000000;
const BATCH_SIZE = 10000;
const SEARCH_START_DATE_OFFSET = 50;
const SEARCH_QUERY_ID_START = 5000000;
const VISIT_ID_START = 1;
const USER_ID_RANGE = 100000;
const SEARCH_FREQUENCY_IN_MS = 1000;
const MAX_DAYS_UNTIL_TRAVEL = 45;
const MAX_LENGTH_OF_STAY = 7;
const markets = [
  'San Francisco', 'Seattle', 'Sydney', 'New York', 'Toronto', 'Paris',
  'London', 'Hong Kong', 'Amsterdam', 'Montreal',
];
const roomTypes = ['any', 'Entire home/apt', 'Private room', 'Shared room'];

/* ----- HELPER FUNCTIONS BEGIN ----- */

const incrementIdFrom = (startId) => {
  let id = startId;
  return () => {
    id += 1;
    return id;
  };
};

const getRandomUser = () =>
  Math.ceil(Math.random() * USER_ID_RANGE);

const countTimeFrom = (now) => {
  const timestamp = now;
  return () => {
    const timeLapsed = Math.ceil(Math.random() * SEARCH_FREQUENCY_IN_MS);
    timestamp.setMilliseconds(timestamp.getMilliseconds() + timeLapsed);
    return timestamp.toJSON();
  };
};

const getRandomMarket = () =>
  markets[Math.floor(Math.random() * markets.length)];

const getRandomDateRange = () => {
  const daysUntilTravel = Math.ceil(Math.random() * MAX_DAYS_UNTIL_TRAVEL);
  const lengthOfStay = Math.ceil(Math.random() * MAX_LENGTH_OF_STAY);
  const checkIn = new Date();
  const checkOut = new Date();
  checkIn.setDate(checkIn.getDate() + daysUntilTravel);
  checkOut.setDate(checkOut.getDate() + daysUntilTravel + lengthOfStay);
  return { checkIn, checkOut };
};

const getRandomRoomType = () =>
  roomTypes[Math.floor(Math.random() * roomTypes.length)];

/* ----- HELPER FUNCTIONS END ----- */

const searchStartDate = new Date();
searchStartDate.setDate(searchStartDate.getDate() - SEARCH_START_DATE_OFFSET);
const nextSearchTimestamp = countTimeFrom(searchStartDate);
const nextSearchQueryId = incrementIdFrom(SEARCH_QUERY_ID_START);
const nextVisitId = incrementIdFrom(VISIT_ID_START);

const generateQueryBatch = () => {
  const queries = [];
  for (let i = 0; i < BATCH_SIZE; i += 1) {
    const { checkIn, checkOut } = getRandomDateRange();
    const query = {
      searchQueryId: nextSearchQueryId(),
      timestamp: nextSearchTimestamp(),
      visitId: nextVisitId(),
      userId: getRandomUser(),
      market: getRandomMarket(),
      checkIn,
      checkOut,
      roomType: getRandomRoomType(),
    };
    queries.push(query);
  }
  return elasticSearch.bulkInsertDocuments(ES_INDEX, 'dated', queries);
};

let async = elasticSearch.deleteIndex(ES_INDEX);
for (let i = 0; i < DATASET_SIZE / BATCH_SIZE; i += 1) {
  async = async.then(generateQueryBatch)
    .then(() => {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`${i * BATCH_SIZE}/${DATASET_SIZE} search queries indexed`);
    });
}
async.then(() => {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`${DATASET_SIZE} search queries indexed`);
  process.stdout.write('\nSearch query generation and indexing COMPLETE');
});
