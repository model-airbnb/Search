const http = require('http');
const { getRandomUser, getRandomMarket, getRandomDateRange } = require('./helpers');

const MAX_CONCURRENT_REQUESTS = process.argv[2] || 20;
const SEARCH_FREQUENCY_MS = 1000;
const QUERY_LIMIT = 25;
const serverUrl = process.env.HTTP_SERVER_URL || 'http://localhost:4568';

const randomWait = () => Math.floor(Math.random() * SEARCH_FREQUENCY_MS);

const generateSearchRequest = (id) => {
  /* ----- RANDOM SEARCH PARAMS GENERATION BEGIN ----- */
  const userId = getRandomUser();

  const market = getRandomMarket();

  let { checkIn, checkOut } = getRandomDateRange();
  [checkIn] = checkIn.toISOString().split('T');
  [checkOut] = checkOut.toISOString().split('T');
  /* ----- RANDOM SEARCH PARAMS GENERATION END ----- */

  const searchRequest = `${serverUrl}/search/${userId}/${market}/${checkIn}/${checkOut}/${QUERY_LIMIT}`;
  const requestTimeStart = Date.now();
  http.get(searchRequest, (res) => {
    res.on('data', () => {});
    res.on('end', () => {
      setTimeout(generateSearchRequest.bind(this, id), randomWait());
      console.log(`${id}, status code: ${res.statusCode}, time lapsed: ${Date.now() - requestTimeStart}`);
    });
  }).on('error', console.error);
};

for (let i = 1; i <= MAX_CONCURRENT_REQUESTS; i += 1) {
  generateSearchRequest(i);
}
