import { Sequelize } from 'sequelize';
import path from 'path';
import { initUserModel } from '../models/user.model'; // Import user model init

// Determine the database file path
const dbPath = path.resolve(__dirname, '..', '..', 'data', 'database.sqlite');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
});

// Function to connect to the database and initialize models
const connectDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Initialize models
        initUserModel(sequelize);
        // Add other model initializations here as you create them

        // Sync models (This is okay for initial setup/development, but migrations are preferred for schema changes)
        // await sequelize.sync({ alter: true }); // Use alter: true carefully in production!
        // console.log('Database models synced.');

    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

// Export the sequelize instance and the connectDb function
export { sequelize, connectDb };