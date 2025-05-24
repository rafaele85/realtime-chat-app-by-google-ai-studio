import fastify from 'fastify';

// Create a Fastify instance
const server = fastify({
    logger: true, // Enable logging for better development experience
});

// Define a simple root route
// Use _request and _reply to indicate that these parameters are intentionally unused in this specific handler
server.get('/', async (_request, _reply) => {
    return { message: 'Hello from Messenger Chat Backend!' };
});

// Define the port and host
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all available network interfaces

// Start the server
const start = async () => {
    try {
        await server.listen({ port: PORT, host: HOST });
        console.log(`Server listening on http://${HOST}:${PORT}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

// Export the start function for external use (e.g., in package.json scripts)
export { start };

// If this file is run directly, start the server
if (require.main === module) {
    start();
}