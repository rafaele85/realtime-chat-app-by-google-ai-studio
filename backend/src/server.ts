import fastify from 'fastify';
import { connectDb } from './db';
import { userRoutes } from './routes/user.routes';
import { conversationRoutes } from './routes/conversation.routes';
import { messageRoutes } from './routes/message.routes';
import websocket from '@fastify/websocket';
import { connectedClients } from './plugins/websocket.plugin';

// Create a Fastify instance
const server = fastify({
    logger: true,
});

// Register routes with '/api' prefix
server.register(userRoutes, { prefix: '/api' });
server.register(conversationRoutes, { prefix: '/api' });
server.register(messageRoutes, { prefix: '/api' });

server.register(websocket)

server.register(async (fastifyInstance) => {
    fastifyInstance.get('/ws', {websocket: true}, (socket) => {

        connectedClients.add(socket); // Add to our global set of connected clients

        socket.on('message', (message: string) => {
            console.log(`Received message from client: ${message}`);
        });

        socket.on('close', () => {
            connectedClients.delete(socket); // Remove from set on close
        });

        socket.on('error', () => {
            connectedClients.delete(socket); // Remove from set on error
        });
   });
});

// Define the port and host
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Start the server function
const start = async () => {
    try {
        await connectDb(); // Connect to the database and initialize models
        await server.listen({ port: PORT, host: HOST });
        console.log(`Server listening on http://${HOST}:${PORT}`);
        console.log(`WebSocket server listening on ws://${HOST}:${PORT}/ws`); // Inform about WS endpoint
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

export { start };

if (require.main === module) {
    start();
}