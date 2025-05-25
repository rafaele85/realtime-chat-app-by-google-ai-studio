import React, {useState} from 'react';
import { type Conversation } from '../api/conversations';
import styles from './ConversationList.module.css';
import type {User} from "../api/users.ts"; // We'll create this CSS module

interface ConversationListProps {
    conversations: Conversation[];
    selectedConversationId: number | null;
    onSelectConversation: (conversationId: number) => void;
    onCreateConversation: (isGroup: boolean, participantIds: number[], name?: string) => void;
    users: User[]; // Pass users to allow creating new conversations
    currentUserId: number | null; // Current user for creating DMs
}

const ConversationList: React.FC<ConversationListProps> = ({
                                                               conversations,
                                                               selectedConversationId,
                                                               onSelectConversation,
                                                               onCreateConversation,
                                                               users,
                                                               currentUserId,
                                                           }) => {
    const [newDmUserId, setNewDmUserId] = useState<number | null>(null);
    const [newGroupName, setNewGroupName] = useState<string>('');
    const [newGroupParticipantIds, setNewGroupParticipantIds] = useState<number[]>([]);

    const handleCreateDm = () => {
        if (currentUserId && newDmUserId && currentUserId !== newDmUserId) {
            onCreateConversation(false, [currentUserId, newDmUserId]);
            setNewDmUserId(null);
        } else {
            alert('Please select another user for a direct message and ensure you are logged in.');
        }
    };

    const handleCreateGroup = () => {
        if (currentUserId && newGroupName.trim() && newGroupParticipantIds.length >= 1) {
            onCreateConversation(true, [currentUserId, ...newGroupParticipantIds], newGroupName);
            setNewGroupName('');
            setNewGroupParticipantIds([]);
        } else {
            alert('Please provide a group name, select at least one participant, and ensure you are logged in.');
        }
    };

    return (
        <div className={styles.conversationListContainer}>
            <h2>Conversations</h2>

            {/* Create New Conversation Section */}
            <div className={styles.createConversationSection}>
                <h3>Start New Conversation</h3>
                {currentUserId ? (
                    <>
                        {/* Create Direct Message */}
                        <div className={styles.createDm}>
                            <h4>Direct Message</h4>
                            <select
                                className={styles.selectUser}
                                value={newDmUserId || ''}
                                onChange={(e) => setNewDmUserId(e.target.value ? parseInt(e.target.value, 10) : null)}
                            >
                                <option value="">Select User for DM</option>
                                {users
                                    .filter((user) => user.id !== currentUserId) // Exclude current user
                                    .map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.username}
                                        </option>
                                    ))}
                            </select>
                            <button className={styles.createButton} onClick={handleCreateDm}>Create DM</button>
                        </div>

                        {/* Create Group Chat */}
                        <div className={styles.createGroup}>
                            <h4>Group Chat</h4>
                            <input
                                type="text"
                                placeholder="Group Name"
                                className={styles.inputField}
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                            />
                            <select
                                multiple
                                className={styles.selectUsersMultiple}
                                value={newGroupParticipantIds.map(String)} // Convert numbers to strings for select value
                                onChange={(e) =>
                                    setNewGroupParticipantIds(
                                        Array.from(e.target.selectedOptions, (option) => parseInt(option.value, 10))
                                    )
                                }
                            >
                                {users
                                    .filter((user) => user.id !== currentUserId) // Exclude current user
                                    .map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.username}
                                        </option>
                                    ))}
                            </select>
                            <button className={styles.createButton} onClick={handleCreateGroup}>Create Group</button>
                        </div>
                    </>
                ) : (
                    <p>Please select a user to create conversations.</p>
                )}
            </div>

            {/* List of Conversations */}
            <ul className={styles.conversationList}>
                {conversations.length === 0 ? (
                    <p>No conversations yet. Start one!</p>
                ) : (
                    conversations.map((conv) => (
                        <li
                            key={conv.id}
                            className={`${styles.conversationItem} ${
                                conv.id === selectedConversationId ? styles.selected : ''
                            }`}
                            onClick={() => onSelectConversation(conv.id)}
                        >
                            {conv.isGroup ? (
                                <>
                                    <strong>{conv.name}</strong> (Group)
                                </>
                            ) : (
                                <>
                                    {conv.participants
                                        .filter((p) => p.id !== currentUserId)
                                        .map((p) => p.username)
                                        .join(', ')}
                                    {conv.participants.length === 1 && currentUserId === conv.participants[0].id && "(Self Chat)"}
                                    {conv.participants.length === 0 && "(Empty DM)"}
                                </>
                            )}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export { ConversationList };