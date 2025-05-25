import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './App.module.css';
import {fetchUsers, createUser, type User} from './api/users';
import {
    fetchConversations,
    createConversation,
    fetchMessages,
    sendMessage, type Conversation, type Message,
} from './api/conversations';
import { UserSelector } from './components/UserSelector';
import { ConversationList } from './components/ConversationList';
import { ChatWindow } from './components/ChatWindow';

// Define WebSocket event types to match backend
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

type WebSocketEvent = WebSocketMessageEvent | WebSocketConversationEvent;

const App: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [newUsername, setNewUsername] = useState<string>('');
    const [_loadingUsers, setLoadingUsers] = useState<boolean>(true);
    const [userError, setUserError] = useState<string | null>(null);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingConversations, setLoadingConversations] = useState<boolean>(true);
    const [conversationError, setConversationError] = useState<string | null>(null);
    const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
    const [messageError, setMessageError] = useState<string | null>(null);

    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    const ws = useRef<WebSocket | null>(null);

    // --- User Management ---
    const loadUsers = useCallback(async () => {
        setLoadingUsers(true);
        setUserError(null);
        try {
            const fetchedUsers = await fetchUsers();
            setUsers(fetchedUsers);
        } catch (err: any) {
            setUserError(err.message || 'Failed to load users');
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    const handleCreateUser = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newUsername.trim()) {
            setUserError('Username cannot be empty.');
            return;
        }

        setUserError(null);
        try {
            const createdUser = await createUser(newUsername);
            setUsers((prevUsers) => [...prevUsers, createdUser]);
            setNewUsername('');
        } catch (err: any) {
            setUserError(err.message || 'Failed to create user');
        }
    };

    // --- Conversation Management ---
    const loadConversations = useCallback(async () => {
        setLoadingConversations(true);
        setConversationError(null);
        try {
            const fetchedConversations = await fetchConversations();
            setConversations(fetchedConversations);
        } catch (err: any) {
            setConversationError(err.message || 'Failed to load conversations');
        } finally {
            setLoadingConversations(false);
        }
    }, []);

    const handleCreateConversation = useCallback(
        async (isGroup: boolean, participantIds: number[], name?: string) => {
            setConversationError(null);
            try {
                const newConv = await createConversation(isGroup, participantIds, name);
                // If it's an existing DM, the backend returns 200, so we just update the list
                setConversations((prev) => {
                    const existingIndex = prev.findIndex((c) => c.id === newConv.id);
                    if (existingIndex > -1) {
                        return prev.map((c, i) => (i === existingIndex ? newConv : c));
                    }
                    return [...prev, newConv];
                });
                setSelectedConversationId(newConv.id); // Select the newly created/found conversation
            } catch (err: any) {
                setConversationError(err.message || 'Failed to create conversation');
            }
        },
        []
    );

    const handleSelectConversation = useCallback(async (conversationId: number) => {
        setSelectedConversationId(conversationId);
        setLoadingMessages(true);
        setMessageError(null);
        try {
            const fetchedMessages = await fetchMessages(conversationId);
            setMessages(fetchedMessages);
        } catch (err: any) {
            setMessageError(err.message || 'Failed to load messages');
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    // --- Message Management ---
    const handleSendMessage = useCallback(
        async (content: string) => {
            if (!selectedConversationId || !currentUserId) {
                setMessageError('Please select a conversation and a user to send messages.');
                return;
            }
            setMessageError(null);
            try {
                // Message will be added via WebSocket broadcast, no need to update state here
                await sendMessage(selectedConversationId, currentUserId, content);
            } catch (err: any) {
                setMessageError(err.message || 'Failed to send message');
            }
        },
        [selectedConversationId, currentUserId]
    );

    // --- WebSocket Logic ---
    useEffect(() => {
        // Initialize WebSocket connection
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}/ws`;

        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log('WebSocket connected!');
        };

        ws.current.onmessage = (event) => {
            console.log('WebSocket message received:', event.data);
            try {
                const parsedEvent: WebSocketEvent = JSON.parse(event.data);
                if (parsedEvent.type === 'NEW_MESSAGE') {
                    // Only add message if it belongs to the currently selected conversation
                    if (parsedEvent.payload.conversationId === selectedConversationId) {
                        // Find the sender's full user object from our 'users' state
                        const senderUser = users.find(u => u.id === parsedEvent.payload.senderId);
                        if (senderUser) {
                            setMessages((prevMessages) => [
                                ...prevMessages,
                                { ...parsedEvent.payload, sender: senderUser }, // Add sender object
                            ]);
                        } else {
                            console.warn('Sender not found for new message:', parsedEvent.payload.senderId);
                        }
                    }
                } else if (parsedEvent.type === 'NEW_CONVERSATION') {
                    // Add new conversation to the list if it doesn't exist
                    setConversations((prev) => {
                        if (!prev.some((c) => c.id === parsedEvent.payload.id)) {
                            // Find full participant user objects
                            const fullParticipants = parsedEvent.payload.participants.map(p =>
                                users.find(u => u.id === p.id) || p // Use existing user object or fallback to payload data
                            ) as User[]; // Cast to User[]
                            return [...prev, { ...parsedEvent.payload, participants: fullParticipants }];
                        }
                        return prev;
                    });
                }
            } catch (parseError) {
                console.error('Failed to parse WebSocket message:', parseError);
            }
        };

        ws.current.onclose = () => {
            console.log('WebSocket disconnected.');
        };

        ws.current.onerror = (err) => {
            console.error('WebSocket error:', err);
        };

        // Clean up WebSocket connection on component unmount
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [selectedConversationId, users]); // Re-run if selectedConversationId or users change (for onmessage closure)

    // Load initial data
    useEffect(() => {
        loadUsers();
        loadConversations();
    }, [loadUsers, loadConversations]);

    // If selected conversation changes, load its messages
    useEffect(() => {
        if (selectedConversationId) {
            handleSelectConversation(selectedConversationId);
        } else {
            setMessages([]); // Clear messages if no conversation is selected
        }
    }, [selectedConversationId, handleSelectConversation]);

    const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId) ?? null;

    return (
        <div className={styles.appContainer}>
            <div className={styles.leftPanel}>
                <UserSelector users={users} selectedUserId={currentUserId} onSelectUser={setCurrentUserId} />

                <div className={styles.userCreationSection}>
                    <h2>Create New User</h2>
                    <form onSubmit={handleCreateUser}>
                        <input
                            type="text"
                            placeholder="Enter username"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className={styles.inputField}
                        />
                        <button type="submit" className={styles.button}>Add User</button>
                    </form>
                    {userError && <p className={styles.errorMessage}>{userError}</p>}
                </div>

                <ConversationList
                    conversations={conversations}
                    selectedConversationId={selectedConversationId}
                    onSelectConversation={handleSelectConversation}
                    onCreateConversation={handleCreateConversation}
                    users={users}
                    currentUserId={currentUserId}
                />
                {loadingConversations && <p>Loading conversations...</p>}
                {conversationError && <p className={styles.errorMessage}>{conversationError}</p>}
            </div>

            <div className={styles.rightPanel}>
                <ChatWindow
                    conversation={selectedConversation}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    currentUserId={currentUserId}
                />
                {loadingMessages && <p>Loading messages...</p>}
                {messageError && <p className={styles.errorMessage}>{messageError}</p>}
            </div>
        </div>
    );
};

export { App };