const mongoose = require('../../common/database')();
const Schema = mongoose.Schema;
const parkSchema = new Schema({
    name: {type: String, required: true, unique: true},
    address: {type: String, required: true, unique: true},
    parkId: {type: String, required: true, unique: true},
    deviceId: {
        type: mongoose.Types.ObjectId,
        ref: "devices"
    }
})

const ParksSchema = mongoose.model("park_list", parkSchema, "park_list");
module.exports = ParksSchema;