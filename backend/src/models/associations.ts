import { User } from './user.model';
import { Conversation } from './conversation.model';
import { Message } from './message.model';

const defineAssociations = () => {
    // User and Message: A user sends many messages, a message belongs to one user
    User.hasMany(Message, {
        foreignKey: 'senderId',
        as: 'sentMessages', // Alias for when fetching messages sent by a user
    });
    Message.belongsTo(User, {
        foreignKey: 'senderId',
        as: 'sender', // Alias for when fetching the sender of a message
    });

    // Conversation and Message: A conversation has many messages, a message belongs to one conversation
    Conversation.hasMany(Message, {
        foreignKey: 'conversationId',
        as: 'messages', // Alias for when fetching messages in a conversation
    });
    Message.belongsTo(Conversation, {
        foreignKey: 'conversationId',
        as: 'conversation', // Alias for when fetching the conversation of a message
    });

    // User and Conversation (Many-to-Many): A user can be in many conversations, a conversation can have many users
    // This will create a join table (e.g., UserConversations)
    User.belongsToMany(Conversation, {
        through: 'UserConversations', // Name of the join table
        foreignKey: 'userId',
        otherKey: 'conversationId',
        as: 'conversations', // Alias for when fetching conversations a user is part of
    });
    Conversation.belongsToMany(User, {
        through: 'UserConversations', // Name of the join table
        foreignKey: 'conversationId',
        otherKey: 'userId',
        as: 'participants', // Alias for when fetching participants of a conversation
    });
};

export { defineAssociations };