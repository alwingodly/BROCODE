require('dotenv').config()
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const { v4: uuidv4 } = require("uuid");
const nocache = require("nocache");
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');
const connectDB = require('./db/mongoose');
const bodyParser = require('body-parser')
const app = express();

// Connect to MongoDB
connectDB();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layout/layout');

// Middleware
app.use(logger('dev'));
app.use(bodyParser.json())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);
app.use(nocache());
app.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
  })
);
// Routes
app.use('/admin', adminRouter);
app.use('/', usersRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Server port
const port = process.env.PORT || 3300;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
