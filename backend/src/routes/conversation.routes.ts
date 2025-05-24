import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Conversation } from '../models/conversation.model';
import { User } from '../models/user.model';
import {Op, Sequelize} from 'sequelize'; // Import Op for Sequelize operators

// Request body for creating a conversation
interface CreateConversationBody {
    name?: string; // Optional for group chats
    isGroup: boolean;
    participantIds: number[]; // Array of user IDs to include in the conversation
}

const conversationRoutes = async (server: FastifyInstance, options: FastifyPluginOptions) => {

    // POST /api/conversations - Create a new conversation
    server.post<{ Body: CreateConversationBody }>('/conversations', async (request, reply) => {
        const { name, isGroup, participantIds } = request.body;

        if (!participantIds || participantIds.length < 1) {
            return reply.status(400).send({ message: 'Participant IDs are required.' });
        }

        if (!isGroup && participantIds.length !== 2) {
            return reply.status(400).send({ message: 'Direct messages require exactly two participants.' });
        }

        if (isGroup && (!name || name.trim() === '')) {
            return reply.status(400).send({ message: 'Group chats require a name.' });
        }

        try {
            // Find all participants
            const participants = await User.findAll({
                where: {
                    id: {
                        [Op.in]: participantIds,
                    },
                },
            });

            if (participants.length !== participantIds.length) {
                return reply.status(404).send({ message: 'One or more participants not found.' });
            }

            // For direct messages, check if a conversation between these two users already exists
            if (!isGroup) {
                const existingConversation = await Conversation.findOne({
                    where: { isGroup: false },
                    include: [{
                        model: User,
                        as: 'participants',
                        where: { id: { [Op.in]: participantIds } },
                        through: { attributes: [] } // Don't fetch join table attributes
                    }],
                    group: ['Conversation.id'], // Group by conversation ID
                    having: Sequelize.literal(`COUNT(DISTINCT participants.id) = ${participantIds.length}`) // Ensure exactly 2 participants
                });

                if (existingConversation) {
                    // If an existing DM is found, return it instead of creating a new one
                    return reply.status(200).send(existingConversation);
                }
            }

            // Create the conversation
            const conversation = await Conversation.create({
                name: isGroup ? name : undefined, // Name only for group chats
                isGroup,
            });

            // Add participants to the conversation
            await conversation.addParticipants(participants);

            // Fetch the conversation with participants for the response
            const createdConversation = await Conversation.findByPk(conversation.id, {
                include: [{
                    model: User,
                    as: 'participants',
                    attributes: ['id', 'username'], // Only include necessary user attributes
                    through: { attributes: [] } // Don't include join table attributes
                }]
            });

            return reply.status(201).send(createdConversation);

        } catch (error) {
            server.log.error('Error creating conversation:', error);
            return reply.status(500).send({ message: 'Failed to create conversation.' });
        }
    });

    // GET /api/conversations - Get all conversations (for now, later filter by current user)
    server.get('/conversations', async (_request, reply) => {
        try {
            const conversations = await Conversation.findAll({
                include: [{
                    model: User,
                    as: 'participants',
                    attributes: ['id', 'username'],
                    through: { attributes: [] }
                }]
            });
            return reply.send(conversations);
        } catch (error) {
            server.log.error('Error fetching conversations:', error);
            return reply.status(500).send({ message: 'Failed to fetch conversations.' });
        }
    });

    // GET /api/conversations/:id - Get a single conversation by ID
    server.get<{ Params: { id: string } }>('/conversations/:id', async (request, reply) => {
        const conversationId = parseInt(request.params.id, 10);

        if (isNaN(conversationId)) {
            return reply.status(400).send({ message: 'Invalid conversation ID.' });
        }

        try {
            const conversation = await Conversation.findByPk(conversationId, {
                include: [{
                    model: User,
                    as: 'participants',
                    attributes: ['id', 'username'],
                    through: { attributes: [] }
                }]
            });

            if (!conversation) {
                return reply.status(404).send({ message: 'Conversation not found.' });
            }

            return reply.send(conversation);
        } catch (error) {
            server.log.error(`Error fetching conversation ${conversationId}:`, error);
            return reply.status(500).send({ message: 'Failed to fetch conversation.' });
        }
    });
};

export { conversationRoutes };