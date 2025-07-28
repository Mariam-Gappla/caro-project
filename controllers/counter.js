
const orderCounter = require('../models/counter');

const getNextOrderNumber = async (name) => {
  const counter = await orderCounter.findOneAndUpdate(
    {name},
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return counter.seq;
};

module.exports = getNextOrderNumber;
