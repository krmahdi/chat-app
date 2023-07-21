const express = require('express');
const { sequelize } = require('./model'); // Import the Sequelize instance
const connectToDB = require('./db'); // Import the function to connect to the database

const app = express();
const port = 3000; // You can use any port you prefer

// Middleware to parse incoming JSON data
app.use(express.json());

// Import your Sequelize models
const db = require('./model');

// Define your routes here (if you have any)

// Test endpoint to check if the server is running
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Function to start the server and connect to the database
const startServer = async () => {
  try {
    // Connect to the database
    await connectToDB();

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.log('Error starting the server:', error);
  }
};

// Call the function to start the server and connect to the database
startServer();
