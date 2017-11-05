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

module.exports.updateInventoryScoring = (filter, doc) =>
  new Promise((resolve, reject) => {
    inventoryScoring.update(filter, doc, { upsert: true }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

module.exports.getInventoryScoring = filter =>
  new Promise((resolve, reject) => {
    inventoryScoring.find(filter, (err, doc) => {
      if (err) reject(err);
      else resolve(doc);
    });
  });
