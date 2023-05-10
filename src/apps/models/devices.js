const mongoose = require('../../common/database')();
const Schema = mongoose.Schema;
const deviceShema = new Schema({
    id: {type: String, required: true, unique: true},
    name: {type: String, required: true, unique: true},
    parkId: {
        type: mongoose.Types.ObjectId,
        ref: "park_list"
    },
    isActivate: {type: Boolean, default: false}
})

const DevicesSchema = mongoose.model("devices", deviceShema, "devices");
module.exports = DevicesSchema;