import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import CodeEditor from './components/CodeEditor';
import ChatPanel from './components/ChatPanel';
import OutputPanel from './components/OutputPanel';
import useCodeExecution from './hooks/useCodeExecution';

// Automatically detect environment. 
// In Codespaces, if we are on https://<name>-5173.preview... 
// The backend is likely at https://<name>-3000.preview...


// Boilerplates
const TEMPLATES = {
    javascript: `// JavaScript Starter
function main() {
  console.log("Hello from Collaborative Interview!");
}

main();`,
    python: `# Python Starter
def main():
    print("Hello from Collaborative Interview!")

main()`,
    r: `# R Starter
print("Hello from R!")
summary(cars)`,
    java: `// Java Starter (Browser Edit Only)
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`
};

export default function EditorRoom() {
    const { roomId } = useParams();
    const [socket, setSocket] = useState(null);

    const [code, setCode] = useState('// Loading...');
    const [language, setLanguage] = useState('javascript');
    const [messages, setMessages] = useState([]);

    const { runCode, output, isLoading } = useCodeExecution();

    useEffect(() => {
        const s = io();
        setSocket(s);

        s.emit('join-room', roomId);

        s.on('connect', () => {
            console.log('Socket connected:', s.id);
        });

        s.on('sync-code', (roomState) => {
            setCode(roomState.code);
            setLanguage(roomState.language);
        });

        s.on('code-change', (newCode) => {
            setCode(newCode);
        });

        s.on('language-change', (lang) => {
            setLanguage(lang);
        });

        s.on('chat-message', (msg) => {
            console.log('📨 Received chat message:', msg);
            console.log('   My socket ID:', s.id);
            console.log('   Sender ID:', msg.sender);
            console.log('   Is it me?', msg.sender === s.id);
            setMessages((prev) => {
                const newMessage = {
                    text: msg.message,
                    sender: msg.sender,
                    senderName: msg.senderName, // Add sender name
                    timestamp: msg.timestamp,
                    isMe: msg.sender === s.id
                };
                console.log('   Adding message:', newMessage);
                console.log('   Previous messages count:', prev.length);
                return [...prev, newMessage];
            });
        });

        return () => {
            s.disconnect();
        };
    }, [roomId]);

    // Debug: Log when messages change
    useEffect(() => {
        console.log('💬 Messages state updated. Count:', messages.length, 'Messages:', messages);
    }, [messages]);

    const handleCodeChange = (newCode) => {
        setCode(newCode); // Update local (not strictly needed if fast enough, but good for UI responsiveness)
        if (socket) {
            socket.emit('code-change', { roomId, code: newCode });
        }
    };

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        const template = TEMPLATES[newLang];
        // Optimistic update: Set code immediately
        if (template) {
            setCode(template);
        }

        if (socket) {
            socket.emit('language-change', { roomId, language: newLang, template });
        }
    };

    const handleRun = () => {
        runCode(code, language);
    };

    const handleSendMessage = (text) => {
        if (socket && socket.connected) {
            const username = localStorage.getItem('username') || 'Anonymous';
            console.log('📤 Sending message:', text);
            console.log('   Room ID:', roomId);
            console.log('   Sender (socket.id):', socket.id);
            console.log('   Username:', username);
            console.log('   Socket connected:', socket.connected);
            socket.emit('chat-message', {
                roomId,
                message: text,
                sender: socket.id,
                senderName: username
            });
            console.log('   Message emitted successfully');
        } else {
            console.warn('⚠️ Socket not connected, cannot send message');
            console.warn('   Socket exists:', !!socket);
            console.warn('   Socket connected:', socket?.connected);
        }
    };

    return (
        <div className="room-container">
            <div className="editor-section">
                <div className="toolbar">
                    <div style={{ fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        Room: {roomId}
                        <button
                            className="btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Room link copied to clipboard!');
                            }}
                        >
                            Copy Link
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <select className="input" value={language} onChange={handleLanguageChange}>
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="r">R (WebR)</option>
                            <option value="java">Java (Edit Only)</option>
                        </select>

                        <button className="btn" onClick={handleRun} disabled={isLoading}>
                            {isLoading ? 'Running...' : 'Run Code'}
                        </button>
                    </div>
                </div>

                <CodeEditor
                    code={code}
                    onChange={handleCodeChange}
                    language={language === 'r' ? 'r' : language} // Monaco supports 'r'
                />
            </div>

            <div className="sidebar-section">
                <OutputPanel output={output} />
                <ChatPanel messages={messages} onSendMessage={handleSendMessage} />
            </div>
        </div>
    );
}
