const mongoose = require('./config');

const inventoryScoringSchema = mongoose.Schema({
  rules: {
    market: String,
    checkIn: String,
    checkOut: String,
    roomType: String,
  },
  coefficients: {
    price: Number,
  },
});

const keys = {
  'rules.market': 1, 'rules.checkIn': 1, 'rules.checkOut': 1, 'rules.roomType': 1,
};
inventoryScoringSchema.index(keys, { unique: true });

const inventoryScoring = mongoose.model('InventoryScoring', inventoryScoringSchema);

module.exports.updateInventoryScoring = (doc) => {
  const filter = {
    'rules.market': doc.rules.market,
    'rules.checkIn': doc.rules.checkIn,
    'rules.checkOut': doc.rules.checkOut,
    'rules.roomType': doc.rules.roomType,
  };
  return new Promise((resolve, reject) => {
    inventoryScoring.update(filter, doc, { upsert: true }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};
