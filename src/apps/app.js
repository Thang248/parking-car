const express = require('express')
const app = express();
const ejs = require('ejs');
const config = require('config');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const cors = require('cors');

app.use('/static', express.static(config.get('app.static_folder')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('views', config.get('app.view_folder'))
app.set('view engine', config.get('app.view_engine'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())


//session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

global.loggedIn = null
app.use("*", (req, res, next) => {
  loggedIn = req.session.userId
  next()
})
app.use(
  cors({
    origin: 'http://localhost:3000',
    // Allow follow-up middleware to override this CORS for options
    preflightContinue: true,
  }),
);


//Router
const webRouter = require('../router/web');
app.use(webRouter);


module.exports = app;