const express = require('express');
const path = require('path');
const logger = require('morgan');
//Access the.env file
const dotenv = require('dotenv')
dotenv.config()
// Route auto loading, but not used actually. We manually required in each files.
const mount = require('mount-routes')
//token resolution
const  expressJWT  = require('express-jwt')

const {sendResultResponse} = require("./utils/responseFrom")
//Import routing file
const loginRouter = require('./routes/api/login');
const appRouter = require('./routes/api/app');
const userRouter = require('./routes/api/user');
const viewRouter = require('./routes/api/view');
const googleRouter = require('./routes/api/google');

const app = express();

app.use(logger('dev'));
app.use(express.json()); // 用json传file 
app.use(express.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));

// The path usage can be printed and the path represented by table true shows the routing table on the printer table
// mount(app, path.join(process.cwd(), '/routes'), true)

//Check token
app.use(expressJWT({ secret: process.env["SIGN_KEY"],algorithms: ['HS256'],credentialsRequired: true }).unless({path: ["/login"]}));
app.use((err, req, res, next) => {
  //Check whether the fault is caused by Token resolution failure
  if (err.name == 'UnauthorizedError') {
    return res.json((sendResultResponse('',401, process.env["TOKEN_ERROR_NULL"])))
  }
  res.json(sendResultResponse('',500, process.env["SYSTEM_FAIL"]))
})

//routes
app.use('/', loginRouter);
app.use('/app', appRouter);
app.use('/user', userRouter);
app.use('/view', viewRouter);
app.use('/google', googleRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
