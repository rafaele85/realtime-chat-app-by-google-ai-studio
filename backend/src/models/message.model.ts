import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface MessageAttributes {
    id: number;
    conversationId: number; // Foreign key to Conversation
    senderId: number;       // Foreign key to User (sender)
    content: string;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'id'> {}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
    declare id: number;
    declare conversationId: number;
    declare senderId: number;
    declare content: string;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

const initMessageModel = (sequelize: Sequelize) => {
    Message.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            conversationId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'conversations', // Refers to the 'conversations' table
                    key: 'id',
                },
            },
            senderId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'users', // Refers to the 'users' table
                    key: 'id',
                },
            },
            content: {
                type: DataTypes.STRING(1000), // Max 1000 characters for message content
                allowNull: false,
            },
        },
        {
            tableName: 'messages',
            sequelize,
            timestamps: true,
        }
    );
};

export { Message, initMessageModel };