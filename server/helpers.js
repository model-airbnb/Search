const SEARCH_START_DATE_OFFSET = 42;

const backDateSearchTimestamp = () => {
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - SEARCH_START_DATE_OFFSET);
  return timestamp;
};

class OperationLog {
  constructor(event) {
    this.timeline = {
      [event]: { timestamp: backDateSearchTimestamp(), msTimeLapsed: 0 },
    };
    this.lastOperation = this.timeline[event].timestamp;
  }

  log(operation) {
    this.timeline[operation] = {
      timestamp: backDateSearchTimestamp(),
      msTimeLapsed: backDateSearchTimestamp() - this.lastOperation,
    };
    this.lastOperation = this.timeline[operation].timestamp;
  }

  getLog() {
    return this.timeline;
  }
}

module.exports.OperationLog = OperationLog;

module.exports.getStayBookendNights = (params) => {
  const lastNight = new Date(params.checkout);
  lastNight.setDate(lastNight.getDate() - 1);
  return { firstNight: params.checkin, lastNight: lastNight.toJSON().split('T')[0] };
};

module.exports.getListings = dbResults =>
  dbResults.map((listing, index) => {
    const {
      id, name, host_name, market, neighbourhood, room_type, average_rating, dates, prices,
    } = listing;

    const nightlyPrices = dates.map((date, i) => (
      { date, price: prices[i] }
    ));

    return {
      listingId: id,
      listingName: name,
      hostName: host_name,
      market,
      neighbourhood,
      roomType: room_type,
      nightlyPrices,
      averageRating: average_rating,
      score: index + 1,
    };
  });
