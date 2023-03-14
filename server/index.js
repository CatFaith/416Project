const express = require('express');
const mysql = require('mysql');

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'yourusername',
  password: 'yourpassword',
  database: 'yourdatabase'
});

// Connect to MySQL database
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database!');
});

// Create Express app. instance
const app = express();

// Defining basic routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start server
app.listen(3000, () => {
  console.log('Server listening on port 3000!');
});