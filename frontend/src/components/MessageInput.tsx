import React, { useState } from 'react';
import styles from './MessageInput.module.css'; // We'll create this CSS module

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    disabled: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
    const [messageContent, setMessageContent] = useState<string>('');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (messageContent.trim() && !disabled) {
            onSendMessage(messageContent.trim());
            setMessageContent(''); // Clear input after sending
        }
    };

    return (
        <form className={styles.messageInputContainer} onSubmit={handleSubmit}>
            <input
                type="text"
                className={styles.messageInputField}
                placeholder={disabled ? "Select a conversation to send messages" : "Type your message..."}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                disabled={disabled}
            />
            <button type="submit" className={styles.sendButton} disabled={disabled}>
                Send
            </button>
        </form>
    );
};

export { MessageInput };