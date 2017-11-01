const http = require('http');
const fs = require('fs');
const { getRandomUser, getRandomMarket, getRandomDateRange } = require('./helpers');

const SEARCH_FREQUENCY_IN_MS = 3000;
const QUERY_LIMIT = 25;
const LOG_FILE = `${__dirname}/searchRequests.log`;

const generateSearchRequest = () => {
  /* ----- RANDOM SEARCH PARAMS GENERATION BEGIN ----- */
  const userVisits = {};
  const userId = getRandomUser();

  // Visit Ids track the visits for each user. They start at 1 for every user and
  // increment with each successive visit, and are therefore not unique across all
  // users.
  userVisits[userId] = (userVisits[userId] || 0) + 1;
  const visitId = userVisits[userId];

  const market = getRandomMarket();

  let { checkIn, checkOut } = getRandomDateRange();
  [checkIn] = checkIn.toISOString().split('T');
  [checkOut] = checkOut.toISOString().split('T');
  /* ----- RANDOM SEARCH PARAMS GENERATION END ----- */

  const serverUrl = process.env.HTTP_SERVER_URL || 'http://localhost:4568';

  const searchRequest = `${serverUrl}/search/${visitId}/${userId}/${market}/${checkIn}/${checkOut}/${QUERY_LIMIT}`;
  http.get(searchRequest, () => {
    fs.appendFile(LOG_FILE, `${searchRequest}\n`, (err) => {
      if (err) throw err;
    });
  })
    .on('error', console.error);
};

setInterval(generateSearchRequest, Math.floor(Math.random() * SEARCH_FREQUENCY_IN_MS));
