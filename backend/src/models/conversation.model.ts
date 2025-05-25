import {
    BelongsToManyAddAssociationsMixin, BelongsToManyHasAssociationMixin, CreationOptional,
    DataTypes, InferAttributes, InferCreationAttributes,
    Model, NonAttribute,
    Sequelize
} from 'sequelize';
import { User } from './user.model'; // Import User model for associations

class Conversation extends Model<InferAttributes<Conversation, {omit: 'participants'}>, InferCreationAttributes<Conversation, {omit: 'participants'}>> {
    declare id: CreationOptional<number>;
    declare name?: string;
    declare isGroup: boolean;

    declare readonly createdAt: CreationOptional<Date>;
    declare readonly updatedAt: CreationOptional<Date>;

    declare participants?: NonAttribute<User[]>;

    // These are the type declarations for Sequelize's magic methods
    declare addParticipants: BelongsToManyAddAssociationsMixin<User, User['id']>;
    declare hasParticipant: BelongsToManyHasAssociationMixin<User, User['id']>;
    // You might also want to declare other common ones for completeness, e.g.:
    // declare getParticipants: BelongsToManyGetAssociationsMixin<User>;
    // declare setParticipants: BelongsToManySetAssociationsMixin<User, User['id']>;
    // declare removeParticipant: BelongsToManyRemoveAssociationMixin<User, User['id']>;
    // declare removeParticipants: BelongsToManyRemoveAssociationsMixin<User, User['id']>;
    // declare countParticipants: BelongsToManyCountAssociationsMixin;
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
                allowNull: true,
            },
            isGroup: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            tableName: 'conversations',
            sequelize,
            timestamps: true,
        }
    );
};

export { Conversation, initConversationModel };