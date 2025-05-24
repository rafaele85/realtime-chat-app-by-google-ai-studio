import { Sequelize } from 'sequelize';
import path from 'path';

// Determine the database file path
// In development, it will be in the project root.
// In production (after build), it will be in the 'dist' folder.
const dbPath = path.resolve(__dirname, '..', '..', 'data', 'database.sqlite');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath, // Path to the SQLite database file
    logging: false, // Set to true to see SQL queries in console
});

// Function to connect to the database
const connectDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1); // Exit the process if database connection fails
    }
};

// Export the sequelize instance and the connectDb function
export { sequelize, connectDb };