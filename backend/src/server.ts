import fastify from 'fastify';
import { connectDb } from './db';
import { userRoutes } from './routes/user.routes'; // Import user routes

// Create a Fastify instance
const server = fastify({
    logger: true,
});

// Define a simple root route (keep it for now)
server.get('/', async (_request, _reply) => {
    return { message: 'Hello from Messenger Chat Backend!' };
});

// Register user routes
// The prefix '/api' means all routes in userRoutes will be prefixed with /api
// e.g., /users becomes /api/users
server.register(userRoutes, { prefix: '/api' });

// Define the port and host
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Start the server function
const start = async () => {
    try {
        await connectDb(); // Connect to the database and initialize models
        await server.listen({ port: PORT, host: HOST });
        console.log(`Server listening on http://${HOST}:${PORT}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

export { start };

if (require.main === module) {
    start();
}