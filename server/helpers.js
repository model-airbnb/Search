class OperationLog {
  constructor(event) {
    this.timeline = {
      event,
      start: { timestamp: new Date(), msTimeLapsed: 0 },
    };
    this.lastOperation = this.timeline.start.timestamp;
  }

  log(operation) {
    this.timeline[operation] = {
      timestamp: new Date(),
      msTimeLapsed: Date.now() - this.lastOperation,
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

module.exports.getUniqueAvailableListings = (listingsByNight) => {
  const availableListings = [];
  const listingIndex = {};
  listingsByNight.forEach((listingByNight) => {
    if (listingIndex[listingByNight.listing_id] === undefined) {
      const {
        listing_id, name, host_name, market, neighbourhood, room_type, average_rating,
        inventory_date, price,
      } = listingByNight;
      listingIndex[listing_id] = availableListings.length;
      availableListings.push({
        listingId: listing_id,
        listingName: name,
        hostName: host_name,
        market,
        neighbourhood,
        roomType: room_type,
        nightlyPrices: [
          {
            date: inventory_date.toJSON().split('T')[0],
            price,
          },
        ],
        averageRating: average_rating,
        score: availableListings.length, // start with db search results order
      });
    } else {
      const index = [listingIndex[listingByNight.listing_id]];
      availableListings[index].nightlyPrices.push({
        date: listingByNight.inventory_date.toJSON().split('T')[0],
        price: listingByNight.price,
      });
    }
  });
  return availableListings;
};
