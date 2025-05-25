import React, {useEffect, useRef, useState} from 'react';
import styles from './App.module.css';
import {createUser, fetchUsers, type User} from './api/users';

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
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const ws = useRef<WebSocket | null>(null);

    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedUsers = await fetchUsers();
            setUsers(fetchedUsers);
        } catch (err: any) {
            setError(err.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.hostname}:5173/ws`; // Backend WS port is 3001

        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log('WebSocket connected!');
        };

        ws.current.onmessage = (event) => {
            console.log('WebSocket message received:', event.data);
            try {
                const parsedEvent: WebSocketEvent = JSON.parse(event.data);
                if (parsedEvent.type === 'NEW_MESSAGE') {
                    // For now, we'll just log new messages.
                    // Later, we'll display them in a specific conversation.
                    console.log('New message received:', parsedEvent.payload);
                    // TODO: Update specific conversation's messages
                } else if (parsedEvent.type === 'NEW_CONVERSATION') {
                    // Add new conversation to the list if we were displaying them
                    console.log('New conversation received:', parsedEvent.payload);
                    // TODO: Add new conversation to a list of conversations
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
    }, []);


    // Handler for creating a new user
    const handleCreateUser = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newUsername.trim()) {
            setError('Username cannot be empty.');
            return;
        }

        setError(null);
        try {
            const createdUser = await createUser(newUsername);
            setUsers((prevUsers) => [...prevUsers, createdUser]);
            setNewUsername('');
        } catch (err: any) {
            setError(err.message || 'Failed to create user');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Messenger Chat App</h1>

            {/* User Creation Form */}
            <div className={styles.formSection}>
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
                {error && <p className={styles.errorMessage}>{error}</p>}
            </div>

            {/* User List Display */}
            <div className={styles.userListSection}>
                <h2>Existing Users</h2>
                {loading ? (
                    <p>Loading users...</p>
                ) : users.length === 0 ? (
                    <p>No users found. Create one above!</p>
                ) : (
                    <ul className={styles.userList}>
                        {users.map((user) => (
                            <li key={user.id} className={styles.userItem}>
                                {user.username} (ID: {user.id})
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export { App };