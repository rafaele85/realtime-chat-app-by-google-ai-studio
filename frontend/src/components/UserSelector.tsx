import React from 'react';
import { type User } from '../api/users';
import styles from './UserSelector.module.css'; // We'll create this CSS module

interface UserSelectorProps {
    users: User[];
    selectedUserId: number | null;
    onSelectUser: (userId: number | null) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({ users, selectedUserId, onSelectUser }) => {
    return (
        <div className={styles.userSelectorContainer}>
            <h3>Select Current User:</h3>
            <select
                className={styles.userSelect}
                value={selectedUserId || ''}
                onChange={(e) => onSelectUser(e.target.value ? parseInt(e.target.value, 10) : null)}
            >
                <option value="">-- Select a User --</option>
                {users.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.username} (ID: {user.id})
                    </option>
                ))}
            </select>
            {selectedUserId && (
                <p className={styles.selectedUserText}>
                    Selected: <strong>{users.find(u => u.id === selectedUserId)?.username}</strong>
                </p>
            )}
        </div>
    );
};

export { UserSelector };