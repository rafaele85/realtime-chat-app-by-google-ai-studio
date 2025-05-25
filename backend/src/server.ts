import fastify from 'fastify';
import { connectDb } from './db';
import { userRoutes } from './routes/user.routes';
import { conversationRoutes } from './routes/conversation.routes';
import { messageRoutes } from './routes/message.routes';
import websocket from '@fastify/websocket'; // Import @fastify/websocket directly
import { connectedClients } from './plugins/websocket.plugin';
import {WebSocket} from "ws"; // Import connectedClients set

// Create a Fastify instance
const server = fastify({
    logger: true,
});

// Define a simple root route
server.get('/', async (_request, _reply) => {
    return { message: 'Hello from Messenger Chat Backend!' };
});

// Register routes with '/api' prefix
server.register(userRoutes, { prefix: '/api' });
server.register(conversationRoutes, { prefix: '/api' });
server.register(messageRoutes, { prefix: '/api' });

// Register the @fastify/websocket plugin directly
// This adds the 'ws' decorator and enables WebSocket routes
server.register(websocket); // No prefix here, as we'll define a specific route below

// Define the WebSocket connection route
// This route will handle incoming WebSocket connections to ws://localhost:3001/ws
server.get('/ws', { websocket: true }, (connection /* SocketStream */, _request /* FastifyRequest */) => {
    server.log.info('Client connected to WebSocket');
    const socket = (connection as unknown as {socket: WebSocket}).socket; // The raw WebSocket object

    connectedClients.add(socket); // Add to our global set of connected clients

    socket.on('message', (message: string) => {
        server.log.info(`Received message from client: ${message}`);
        // In a real app, you might parse this message and act on it
        // For now, we're only broadcasting from the server
    });

    socket.on('close', (code: number, reason: string) => {
        server.log.info(`Client disconnected from WebSocket: Code ${code}, Reason: ${reason}`);
        connectedClients.delete(socket); // Remove from set on close
    });

    socket.on('error', (error: {message: string}) => {
        server.log.error(`WebSocket error: ${error.message}`);
        connectedClients.delete(socket); // Remove from set on error
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