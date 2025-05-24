import fastify from 'fastify';
import { connectDb } from './db';
import { userRoutes } from './routes/user.routes';
import { conversationRoutes } from './routes/conversation.routes'; // New import
import { messageRoutes } from './routes/message.routes';         // New import

// Create a Fastify instance
const server = fastify({
    logger: true,
});

// Define a simple root route (keep it for now)
server.get('/', async (_request, _reply) => {
    return { message: 'Hello from Messenger Chat Backend!' };
});

// Register routes with '/api' prefix
server.register(userRoutes, { prefix: '/api' });
server.register(conversationRoutes, { prefix: '/api' }); // Register conversation routes
server.register(messageRoutes, { prefix: '/api' });     // Register message routes

// Define the port and host
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const HOST = process.env.HOST || '0.0.0.0'; // Use 0.0.0.0 for broader access, or 127.0.0.1 if preferred

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