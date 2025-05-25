import {
    BelongsToManyAddAssociationsMixin, BelongsToManyHasAssociationMixin,
    DataTypes,
    Model,
    Optional,
    Sequelize
} from 'sequelize';
import { User } from './user.model'; // Import User model for associations

interface ConversationAttributes {
    id: number;
    name?: string;
    isGroup: boolean;
}

interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id'> {}

class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
    declare id: number;
    declare name?: string;
    declare isGroup: boolean;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    declare addParticipants: BelongsToManyAddAssociationsMixin<User, User['id']>;
    declare hasParticipant: BelongsToManyHasAssociationMixin<User, User['id']>;
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
        },
        {
            tableName: 'conversations',
            sequelize,
            timestamps: true,
        }
    );
};

export { Conversation, initConversationModel };