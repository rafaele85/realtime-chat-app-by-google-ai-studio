import fastify from 'fastify';
import { connectDb } from './db'; // Import the connectDb function

// Create a Fastify instance
const server = fastify({
    logger: true,
});

// Define a simple root route
server.get('/', async (_request, _reply) => {
    return { message: 'Hello from Messenger Chat Backend!' };
});

// Define the port and host
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Start the server function
const start = async () => {
    try {
        // 1. Connect to the database first
        await connectDb();

        // 2. Then start the Fastify server
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