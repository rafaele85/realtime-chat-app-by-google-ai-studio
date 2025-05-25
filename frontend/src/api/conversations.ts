import { type User } from './users'; // Import User type

// Define Conversation interface to match backend model
interface Conversation {
    id: number;
    name?: string;
    isGroup: boolean;
    createdAt: string;
    updatedAt: string;
    participants: User[]; // Participants are User objects
}

// Define Message interface to match backend model
interface Message {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    sender: User; // Sender is a User object
}

// Function to fetch all conversations
const fetchConversations = async (): Promise<Conversation[]> => {
    try {
        const response = await fetch('/api/conversations');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const conversations: Conversation[] = await response.json();
        return conversations;
    } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
    }
};

// Function to create a new conversation
const createConversation = async (
    isGroup: boolean,
    participantIds: number[],
    name?: string
): Promise<Conversation> => {
    try {
        const response = await fetch('/api/conversations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, isGroup, participantIds }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const newConversation: Conversation = await response.json();
        return newConversation;
    } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
    }
};

// Function to fetch messages for a specific conversation
const fetchMessages = async (conversationId: number): Promise<Message[]> => {
    try {
        const response = await fetch(`/api/conversations/${conversationId}/messages`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const messages: Message[] = await response.json();
        return messages;
    } catch (error) {
        console.error(`Error fetching messages for conversation ${conversationId}:`, error);
        throw error;
    }
};

// Function to send a message
const sendMessage = async (
    conversationId: number,
    senderId: number,
    content: string
): Promise<Message> => {
    try {
        const response = await fetch(`/api/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ senderId, content }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const newMessage: Message = await response.json();
        return newMessage;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

export { fetchConversations, createConversation, fetchMessages, sendMessage, type Conversation, type Message };