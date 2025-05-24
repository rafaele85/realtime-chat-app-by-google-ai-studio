import React from 'react';
import styles from './App.module.css'; // Import CSS Modules

const App: React.FC = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Hello from Messenger Chat Frontend!</h1>
            <p>This is our React application.</p>
        </div>
    );
};

export { App }; // Prefer named exports