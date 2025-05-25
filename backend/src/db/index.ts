import { Sequelize } from 'sequelize';
import path from 'path';
import { initUserModel } from '../models/user.model';
import { initConversationModel } from '../models/conversation.model';
import { initMessageModel } from '../models/message.model';
import { defineAssociations } from '../models/associations'; // Import the defineAssociations function

// Determine the database file path
const dbPath = path.resolve(__dirname, '..', '..', 'data', 'database.sqlite');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false, // Set to true to see SQL queries in console
});

// Function to connect to the database and initialize models
const connectDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Initialize models FIRST
        initUserModel(sequelize);
        initConversationModel(sequelize);
        initMessageModel(sequelize);

        // THEN define associations after all models are initialized
        defineAssociations();
        console.log('Sequelize models and associations initialized.');

        // We will use migrations for schema changes, so no sequelize.sync() here.
        // await sequelize.sync({ alter: true });
        // console.log('Database models synced.');

    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

// Export the sequelize instance and the connectDb function
export { sequelize, connectDb };