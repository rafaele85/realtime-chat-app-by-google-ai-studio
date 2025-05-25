import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Conversation } from '../models/conversation.model';
import { User } from '../models/user.model';
import {Op, QueryTypes} from 'sequelize';
import {sequelize} from "../db"; // Import Op for Sequelize operators

// Request body for creating a conversation
interface CreateConversationBody {
    name?: string; // Optional for group chats
    isGroup: boolean;
    participantIds: number[]; // Array of user IDs to include in the conversation
}

const conversationRoutes = async (server: FastifyInstance, _options: FastifyPluginOptions) => {

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
                const sortedParticipantIds = participantIds.sort((a, b) => a - b);
                const [user1Id, user2Id] = sortedParticipantIds;

                const query = `
                  SELECT
                      c.id
                  FROM
                      conversations AS c
                  JOIN
                      UserConversations AS uc1 ON c.id = uc1.conversationId
                  JOIN
                      UserConversations AS uc2 ON c.id = uc2.conversationId
                  WHERE
                      c.isGroup = 0
                      AND uc1.userId = :user1Id
                      AND uc2.userId = :user2Id
                      AND uc1.userId != uc2.userId
                      AND (SELECT COUNT(*) FROM UserConversations WHERE conversationId = c.id) = 2;
                `;

                const results = await sequelize.query(query, {
                    replacements: {user1Id, user2Id},
                    type: QueryTypes.SELECT,
                    model: Conversation,
                    mapToModel: true,
                });

                const existingConversation = results && results.length > 0 ? results[0] : null;

                if (existingConversation) {
                    const fullExistingConversation = await Conversation.findByPk(existingConversation.id, {
                        include: [{
                            model: User,
                            as: 'participants',
                            attributes: ['id', 'username'],
                            through: {attributes: []}
                        }]
                    });
                    return reply.status(200).send(fullExistingConversation);
                }
            }
            // Create the conversation
            const conversation = await Conversation.create({
                name: isGroup ? name : undefined, // Name only for group chats
                isGroup,
            });

            // Add participants to the conversation
            await conversation.addParticipants(participantIds);

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