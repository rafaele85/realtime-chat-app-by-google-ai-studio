import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App'; // Import App using named export

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);