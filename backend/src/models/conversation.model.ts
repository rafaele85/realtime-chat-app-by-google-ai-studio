import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { User } from './user.model'; // Import User model for associations

interface ConversationAttributes {
    id: number;
    name?: string; // Optional: for group chats, direct messages might not have a name
    isGroup: boolean; // True for group chats, false for direct messages
}

interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id'> {}

class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
    public id!: number;
    public name?: string;
    public isGroup!: boolean;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Associations (defined in init function)
    public getUsers!: () => Promise<User[]>;
    public addUsers!: (users: User[]) => Promise<void>;
    public setUsers!: (users: User[]) => Promise<void>;
    public countUsers!: () => Promise<number>;
    public hasUser!: (user: User) => Promise<boolean>;
    public hasUsers!: (users: User[]) => Promise<boolean>;
    public removeUser!: (user: User) => Promise<void>;
    public removeUsers!: (users: User[]) => Promise<void>;
}

const initConversationModel = (sequelize: Sequelize) => {
    Conversation.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true, // Name is optional
            },
            isGroup: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false, // Default to false (direct message)
            },
        },
        {
            tableName: 'conversations',
            sequelize,
            timestamps: true,
        }
    );
};

export { Conversation, initConversationModel };