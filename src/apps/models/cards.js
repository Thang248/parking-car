const mongoose = require('../../common/database')();
const moment = require('moment');
const Schema = mongoose.Schema;
const cardSchema = new Schema({
    full_name: {type: String, required: true},
    id: {type: String, required: true},
    role: {type: String, required: true},
    license: {type: String},
    status: Boolean,
    activeAt: {type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss')},
    is_parking: {type: Boolean, default: false}
}, {
    timestamps: true,
    toJSON: { getters: true }
})
cardSchema.path('activeAt').get(function(value) {
    if (typeof value !== 'undefined' && value !== null) {
      return value.toLocaleString();
    }
  });

const CardsModel = mongoose.model("cards", cardSchema, "cards");
module.exports = CardsModel;