const mongoose = require('../../common/database')();
const Schema = mongoose.Schema;
const userSchema = new Schema({
    full_name: String,
    user_name: String,
    password: String,
})

const UsersModel = mongoose.model("users", userSchema, "users");
module.exports = UsersModel;