import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { v4 as uuidv4 } from 'uuid'; 
// Actually I didn't install uuid. I'll use a helper function.

function randomID() {
    return Math.random().toString(36).substring(2, 8);
}

export default function LandingPage() {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const createRoom = () => {
        if (!username.trim()) {
            alert('Please enter your name first!');
            return;
        }
        localStorage.setItem('username', username);
        const id = randomID();
        navigate(`/room/${id}`);
    };

    const joinRoom = (e) => {
        e.preventDefault();
        if (!username.trim()) {
            alert('Please enter your name first!');
            return;
        }
        if (roomId.trim()) {
            localStorage.setItem('username', username);
            navigate(`/room/${roomId}`);
        }
    };

    return (
        <div className="landing-container">
            <div className="glass-card">
                <h1 style={{ margin: 0, textAlign: 'center', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', fontSize: '2rem' }}>
                    CodeSwitch
                </h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    Real-time collaborative coding environment
                </p>

                <input
                    type="text"
                    className="input"
                    placeholder="Enter your name"
                    style={{ width: '100%' }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <button onClick={createRoom} className="btn" style={{ width: '100%', fontSize: '1.1rem' }}>
                    Create New Interview
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                    <span>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                </div>

                <form onSubmit={joinRoom} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        className="input"
                        placeholder="Enter Room ID"
                        style={{ flex: 1 }}
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                    />
                    <button type="submit" className="btn" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                        Join
                    </button>
                </form>
            </div>
        </div >
    );
}
