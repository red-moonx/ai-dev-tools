import { useState, useEffect, useRef } from 'react';

export default function ChatPanel({ messages, onSendMessage }) {
    const [input, setInput] = useState('');
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        // Scroll messages to bottom when new messages arrive
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSendMessage(input);
        setInput('');
    };

    return (
        <div className="chat-panel">
            <div className="panel-header">Chat</div>
            <div className="chat-messages" ref={messagesContainerRef}>
                {messages.map((msg, i) => (
                    <div key={i} className={`message-wrapper ${msg.isMe ? 'mine' : 'theirs'}`}>
                        <div className="message-header">
                            <span className="sender-name">
                                {msg.senderName || (msg.isMe ? 'You' : `User ${msg.sender.substr(0, 4)}`)}
                            </span>
                            <span className="message-time">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className={`message-bubble ${msg.isMe ? 'mine' : ''}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>
            <form className="chat-input-form" onSubmit={handleSubmit}>
                <input
                    className="input"
                    style={{ flex: 1 }}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit" className="btn" style={{ padding: '0.6rem' }}>
                    Send
                </button>
            </form>
        </div>
    );
}
