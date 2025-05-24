import React, { useState, useEffect } from 'react';
import styles from './App.module.css';
import { fetchUsers, createUser, type User } from './api/users'; // Import API functions and User type

const App: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [newUsername, setNewUsername] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Function to load users from the backend
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

    // useEffect to fetch users when the component mounts
    useEffect(() => {
        loadUsers();
    }, []); // Empty dependency array means this runs once on mount

    // Handler for creating a new user
    const handleCreateUser = async (event: React.FormEvent) => {
        event.preventDefault(); // Prevent default form submission
        if (!newUsername.trim()) {
            setError('Username cannot be empty.');
            return;
        }

        setError(null); // Clear previous errors
        try {
            const createdUser = await createUser(newUsername);
            setUsers((prevUsers) => [...prevUsers, createdUser]); // Add new user to the list
            setNewUsername(''); // Clear the input field
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