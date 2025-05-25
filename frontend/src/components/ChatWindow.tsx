import React, { useEffect, useRef } from 'react';
import { MessageInput } from './MessageInput';
import styles from './ChatWindow.module.css';
import type {Conversation, Message} from "../api/conversations.ts"; // We'll create this CSS module

interface ChatWindowProps {
    conversation: Conversation | null;
    messages: Message[];
    onSendMessage: (content: string) => void;
    currentUserId: number | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
                                                   conversation,
                                                   messages,
                                                   onSendMessage,
                                                   currentUserId,
                                               }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    if (!conversation) {
        return (
            <div className={styles.chatWindowContainer}>
                <div className={styles.noConversationSelected}>
                    Select a conversation to start chatting.
                </div>
            </div>
        );
    }

    const getConversationTitle = (conv: Conversation, userId: number | null) => {
        if (conv.isGroup) {
            return conv.name;
        }
        // For DMs, show the other participant's name
        const otherParticipant = conv.participants.find(p => p.id !== userId);
        return otherParticipant ? otherParticipant.username : 'Self Chat';
    };

    return (
        <div className={styles.chatWindowContainer}>
            <div className={styles.chatHeader}>
                <h3>{getConversationTitle(conversation, currentUserId)}</h3>
                <p className={styles.participants}>
                    Participants: {conversation.participants.map(p => p.username).join(', ')}
                </p>
            </div>
            <div className={styles.messagesContainer}>
                {messages.length === 0 ? (
                    <p className={styles.noMessages}>No messages yet. Be the first to send one!</p>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`${styles.messageItem} ${
                                message.senderId === currentUserId ? styles.myMessage : styles.otherMessage
                            }`}
                        >
                            <div className={styles.messageSender}>
                                {message.sender.username}
                            </div>
                            <div className={styles.messageContent}>
                                {message.content}
                            </div>
                            <div className={styles.messageTimestamp}>
                                {new Date(message.createdAt).toLocaleTimeString()}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} /> {/* Scroll target */}
            </div>
            <MessageInput onSendMessage={onSendMessage} disabled={currentUserId === null} />
        </div>
    );
};

export { ChatWindow };