const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const db = () => {
    mongoose.connect('mongodb+srv://dotienthang248:Wl799UJKcWxqvg1K@cluster0.kihgreh.mongodb.net/?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    });
    return mongoose; 
};
module.exports = db;