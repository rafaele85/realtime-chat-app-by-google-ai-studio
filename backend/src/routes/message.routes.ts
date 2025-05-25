import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Message } from '../models/message.model';
import { User } from '../models/user.model';
import { Conversation } from '../models/conversation.model';
import { broadcast, WebSocketMessageEvent } from '../plugins/websocket.plugin'; // Ensure this is imported

// Request body for sending a message
interface SendMessageBody {
    senderId: number;
    content: string;
}

const messageRoutes = async (server: FastifyInstance, _options: FastifyPluginOptions) => {

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

                // Note: hasParticipant is declared in conversation.model.ts
                const isParticipant = await conversation.hasParticipant(sender);
                if (!isParticipant) {
                    return reply.status(403).send({ message: 'Sender is not a participant of this conversation.' });
                }

                // 3. Create the message
                const newMessage = await Message.create({
                    conversationId,
                    senderId,
                    content,
                });

                // Fetch the message with sender details for the response and broadcast
                const createdMessage = await Message.findByPk(newMessage.id, {
                    include: [{
                        model: User,
                        as: 'sender',
                        attributes: ['id', 'username'],
                    }],
                });

                // Broadcast the new message to all connected WebSocket clients
                if (createdMessage) {
                    const event: WebSocketMessageEvent = {
                        type: 'NEW_MESSAGE',
                        payload: {
                            id: createdMessage.id,
                            conversationId: createdMessage.conversationId,
                            senderId: createdMessage.senderId,
                            content: createdMessage.content,
                            createdAt: createdMessage.createdAt.toISOString(),
                            updatedAt: createdMessage.updatedAt.toISOString(),
                            sender: {
                                id: createdMessage.sender!.id,
                                username: createdMessage.sender!.username,
                            },
                        },
                    };
                    broadcast(event);
                }

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
                const conversation = await Conversation.findByPk(conversationId);
                if (!conversation) {
                    return reply.status(404).send({ message: 'Conversation not found.' });
                }

                const messages = await Message.findAll({
                    where: { conversationId },
                    include: [{
                        model: User,
                        as: 'sender',
                        attributes: ['id', 'username'],
                    }],
                    order: [['createdAt', 'ASC']],
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