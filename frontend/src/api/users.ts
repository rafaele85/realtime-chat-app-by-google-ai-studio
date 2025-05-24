// Define the User interface to match our backend model
interface User {
    id: number;
    username: string;
    createdAt: string; // Dates are typically strings from API, can be converted to Date objects
    updatedAt: string;
}

// Function to fetch all users
const fetchUsers = async (): Promise<User[]> => {
    try {
        const response = await fetch('/api/users'); // This hits our Vite proxy, which forwards to backend
        if (!response.ok) {
            // Handle HTTP errors
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const users: User[] = await response.json();
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error; // Re-throw to be handled by the component
    }
};

// Function to create a new user
const createUser = async (username: string): Promise<User> => {
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const newUser: User = await response.json();
        return newUser;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export { fetchUsers, createUser, type User };