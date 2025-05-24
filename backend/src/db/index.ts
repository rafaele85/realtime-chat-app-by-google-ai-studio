import { Sequelize } from 'sequelize';
import path from 'path';
import { initUserModel } from '../models/user.model';
import { initConversationModel } from '../models/conversation.model'; // New import
import { initMessageModel } from '../models/message.model';       // New import
import { defineAssociations } from '../models/associations';     // New import

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
        initConversationModel(sequelize); // Initialize Conversation model
        initMessageModel(sequelize);       // Initialize Message model

        // Define associations between models
        defineAssociations(); // Define relationships after all models are initialized

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