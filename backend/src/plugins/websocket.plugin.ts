import { WebSocket } from 'ws'; // Import WebSocket type for clarity

// Define a type for the message event
interface WebSocketMessageEvent {
    type: 'NEW_MESSAGE';
    payload: {
        id: number;
        conversationId: number;
        senderId: number;
        content: string;
        createdAt: string;
        updatedAt: string;
        sender: {
            id: number;
            username: string;
        };
    };
}

// Define a type for the conversation event
interface WebSocketConversationEvent {
    type: 'NEW_CONVERSATION';
    payload: {
        id: number;
        name?: string;
        isGroup: boolean;
        createdAt: string;
        updatedAt: string;
        participants: {
            id: number;
            username: string;
        }[];
    };
}

// Union type for all possible WebSocket events
type WebSocketEvent = WebSocketMessageEvent | WebSocketConversationEvent;

// Store active WebSocket connections (moved here from plugin function)
// This needs to be accessible by the broadcast function and the connection handler
const connectedClients = new Set<WebSocket>();

// Function to broadcast a message to all connected clients
const broadcast = (event: WebSocketEvent) => {
    const message = JSON.stringify(event);
    for (const client of connectedClients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
};

// The websocketPlugin function is removed from here.
// We only export the broadcast function and types.
export { broadcast, WebSocketEvent, WebSocketMessageEvent, WebSocketConversationEvent, connectedClients }; // Export connectedClients too