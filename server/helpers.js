const SEARCH_START_DATE_OFFSET = 42;
const HTTP_REQUEST = 'httpSearchRequest';
const FETCH_LISTINGS = 'dbFetchListings';
const FETCH_SCORING = 'dbFetchCoefficients';
const SORT_LISTINGS = 'sortListings';

const backDateSearchTimestamp = () => {
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - SEARCH_START_DATE_OFFSET);
  return timestamp;
};

const getStayBookendNights = (params) => {
  const lastNight = new Date(params.checkOut);
  lastNight.setDate(lastNight.getDate() - 1);
  return { firstNight: params.checkIn, lastNight: lastNight.toJSON().split('T')[0] };
};

class OperationLog {
  constructor(event) {
    this.timeline = {
      [event]: { timestamp: backDateSearchTimestamp(), msTimeLapsed: 0 },
    };
  }

  startTimer(operations) {
    operations.forEach((operation) => {
      this.timeline[operation] = { timestamp: backDateSearchTimestamp(), msTimeLapsed: 0 };
    });
  }

  stopTimer(operations) {
    operations.forEach((operation) => {
      const eventLogEntry = this.timeline[operation];
      eventLogEntry.msTimeLapsed = backDateSearchTimestamp() - eventLogEntry.timestamp;
    });
  }

  get() {
    return this.timeline;
  }
}

module.exports.OperationLog = OperationLog;
module.exports.HTTP_REQUEST = HTTP_REQUEST;
module.exports.FETCH_LISTINGS = FETCH_LISTINGS;
module.exports.FETCH_SCORING = FETCH_SCORING;
module.exports.SORT_LISTINGS = SORT_LISTINGS;

module.exports.fetchListings = (searchParams, db, log) => {
  const { market, limit } = searchParams;
  const { firstNight, lastNight } = getStayBookendNights(searchParams);
  return db.getAvailableListings(market, firstNight, lastNight, limit)
    .then((results) => {
      log.stopTimer([FETCH_LISTINGS]);
      return results;
    });
};

module.exports.fetchCoefficients = (rule, db, log) =>
  db.getInventoryScoring(rule)
    .then((docs) => {
      log.stopTimer([FETCH_SCORING]);
      return docs.length > 0 ? docs[0].coefficients : { price: 0 };
    });

module.exports.sortListings = (inventory, scoring) => {
  const listings = inventory.map((listing, index) => {
    const {
      id, name, host_name, market, neighbourhood, room_type, average_rating, dates, prices,
    } = listing;

    const nightlyPrices = dates.map((date, i) => ({ date: date.toISOString().split('T')[0], price: prices[i] }));
    const averagePrice = nightlyPrices.reduce((sum, price) => sum + price) / nightlyPrices.length;

    return {
      listingId: id,
      listingName: name,
      hostName: host_name,
      market,
      neighbourhood,
      roomType: room_type,
      nightlyPrices,
      averageRating: average_rating,
      score: scoring.price ? averagePrice * scoring.price : index + 1,
    };
  });

  return listings.sort((a, b) => a.score - b.score);
};
