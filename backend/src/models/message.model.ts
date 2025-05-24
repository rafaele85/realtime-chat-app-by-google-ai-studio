import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { User } from './user.model'; // Import User model for associations
import { Conversation } from './conversation.model'; // Import Conversation model for associations

interface MessageAttributes {
    id: number;
    conversationId: number; // Foreign key to Conversation
    senderId: number;       // Foreign key to User (sender)
    content: string;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'id'> {}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
    public id!: number;
    public conversationId!: number;
    public senderId!: number;
    public content!: string;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Associations (defined in init function)
    public getSender!: () => Promise<User>;
    public getConversation!: () => Promise<Conversation>;
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