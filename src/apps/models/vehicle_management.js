const mongoose = require('../../common/database')();
const moment = require('moment');
const Schema = mongoose.Schema;
const vehicleSchema = new Schema({
    image_in: {
        type: String,
    },
    image_out: {
        type: String,
    },
    parking_id: {
        type: mongoose.Types.ObjectId,
        ref: "park_list"
    },
    card_id: {
        type: mongoose.Types.ObjectId,
        ref: "cards"
    },
    timeIn: {type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss')},
    timeOut: {type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss')}
}, {
    timestamps: true,
    toJSON: { getters: true }
})
vehicleSchema.path('timeIn').get(function(value) {
    if (typeof value !== 'undefined' && value !== null) {
      return value.toLocaleString();
    }
  });
  vehicleSchema.path('timeOut').get(function(value) {
    if (typeof value !== 'undefined' && value !== null) {
      return value.toLocaleString();
    }
  });

const CardsModel = mongoose.model("vehicles", vehicleSchema, "vehicles");
module.exports = CardsModel;