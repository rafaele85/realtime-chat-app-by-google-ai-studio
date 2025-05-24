import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { User } from '../models/user.model'; // Import the User model

// Define an interface for the request body when creating a user
interface CreateUserRequestBody {
    username: string;
}

// Define the Fastify plugin for user routes
// We use a named export for the plugin function
const userRoutes = async (server: FastifyInstance, options: FastifyPluginOptions) => {

    // Route to get all users
    server.get('/users', async (_request, reply) => {
        try {
            const users = await User.findAll(); // Fetch all users from the database
            return reply.send(users); // Send the users as a response
        } catch (error) {
            server.log.error('Error fetching users:', error);
            return reply.status(500).send({ message: 'Failed to fetch users' });
        }
    });

    // Route to create a new user
    server.post<{ Body: CreateUserRequestBody }>('/users', async (request, reply) => {
        const { username } = request.body;

        if (!username) {
            return reply.status(400).send({ message: 'Username is required' });
        }

        try {
            // Check if user already exists
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                return reply.status(409).send({ message: 'User with this username already exists' });
            }

            // Create the new user
            const newUser = await User.create({ username });
            return reply.status(201).send(newUser); // Respond with the created user and 201 status
        } catch (error) {
            server.log.error('Error creating user:', error);
            return reply.status(500).send({ message: 'Failed to create user' });
        }
    });
};

// Export the plugin function
export { userRoutes };