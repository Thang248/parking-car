const UsersModel = require('../models/users')

const index = async (req, res) => {
    const userId = req.session.userId
    if (userId) {
        res.render('home')
    } else {
        res.redirect('/login')
    }
}
module.exports = {
    index: index,
}