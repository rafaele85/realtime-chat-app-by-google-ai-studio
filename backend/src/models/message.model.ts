import { DataTypes, Model, Sequelize, CreationOptional, NonAttribute, InferAttributes, InferCreationAttributes } from 'sequelize';
import {User} from "./user.model";

class Message extends Model<InferAttributes<Message, {omit: 'sender'}>, InferCreationAttributes<Message, {omit: 'sender'}>> {
    declare id: CreationOptional<number>;
    declare conversationId: number;
    declare senderId: number;
    declare content: string;

    declare readonly createdAt: CreationOptional<Date>;
    declare readonly updatedAt: CreationOptional<Date>;

    declare sender?: NonAttribute<User>;
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
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            tableName: 'messages',
            sequelize,
            timestamps: true,
        }
    );
};

export { Message, initMessageModel };