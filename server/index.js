require("dotenv").config();
const express = require('express');
const mysql = require('mysql2');
const cors = require("cors"); // 跨域请求 cross-origin requests
const PORT = process.env.PORT || 4000;


// Create Express app. instance
const app = express();

app.use(cors());

const usersRoutes = require('./modules/Users/routes');
const appRoutes = require('./modules/APPs/routes');
const tableRoutes = require('./modules/Views/routes');

app.use('/api/Users', usersRoutes);
app.use('/api/APPs', appRoutes);
app.use('/api/Views', tableRoutes);


// Create MySQL connection 未完成
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});


// Connect to MySQL database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');

  //start server
  app.listen(PORT, () => {
    console.log(`The server set up at port: ${PORT}`);
  });
});