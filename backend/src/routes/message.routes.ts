import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Message } from '../models/message.model';
import { User } from '../models/user.model';
import { Conversation } from '../models/conversation.model';

// Request body for sending a message
interface SendMessageBody {
    senderId: number;
    content: string;
}

const messageRoutes = async (server: FastifyInstance, options: FastifyPluginOptions) => {

    // POST /api/conversations/:conversationId/messages - Send a new message
    server.post<{ Params: { conversationId: string }, Body: SendMessageBody }>(
        '/conversations/:conversationId/messages',
        async (request, reply) => {
            const conversationId = parseInt(request.params.conversationId, 10);
            const { senderId, content } = request.body;

            if (isNaN(conversationId) || !senderId || !content || content.trim() === '') {
                return reply.status(400).send({ message: 'Invalid conversation ID, sender ID, or empty content.' });
            }

            try {
                // 1. Verify conversation exists
                const conversation = await Conversation.findByPk(conversationId);
                if (!conversation) {
                    return reply.status(404).send({ message: 'Conversation not found.' });
                }

                // 2. Verify sender exists and is a participant of the conversation
                const sender = await User.findByPk(senderId);
                if (!sender) {
                    return reply.status(404).send({ message: 'Sender not found.' });
                }

                const isParticipant = await conversation.hasParticipant(sender); // Sequelize magic method
                if (!isParticipant) {
                    return reply.status(403).send({ message: 'Sender is not a participant of this conversation.' });
                }

                // 3. Create the message
                const newMessage = await Message.create({
                    conversationId,
                    senderId,
                    content,
                });

                // Fetch the message with sender details for the response
                const createdMessage = await Message.findByPk(newMessage.id, {
                    include: [{
                        model: User,
                        as: 'sender',
                        attributes: ['id', 'username'],
                    }],
                });

                return reply.status(201).send(createdMessage);

            } catch (error) {
                server.log.error('Error sending message:', error);
                return reply.status(500).send({ message: 'Failed to send message.' });
            }
        }
    );

    // GET /api/conversations/:conversationId/messages - Get messages for a conversation
    server.get<{ Params: { conversationId: string } }>(
        '/conversations/:conversationId/messages',
        async (request, reply) => {
            const conversationId = parseInt(request.params.conversationId, 10);

            if (isNaN(conversationId)) {
                return reply.status(400).send({ message: 'Invalid conversation ID.' });
            }

            try {
                // Optional: Verify conversation exists and current user is a participant
                const conversation = await Conversation.findByPk(conversationId);
                if (!conversation) {
                    return reply.status(404).send({ message: 'Conversation not found.' });
                }
                // TODO: In a real app, add logic here to check if the requesting user is a participant

                const messages = await Message.findAll({
                    where: { conversationId },
                    include: [{
                        model: User,
                        as: 'sender',
                        attributes: ['id', 'username'],
                    }],
                    order: [['createdAt', 'ASC']], // Order messages by creation time
                });

                return reply.send(messages);
            } catch (error) {
                server.log.error(`Error fetching messages for conversation ${conversationId}:`, error);
                return reply.status(500).send({ message: 'Failed to fetch messages.' });
            }
        }
    );
};

export { messageRoutes };