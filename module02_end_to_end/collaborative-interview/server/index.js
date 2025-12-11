const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Add headers for SharedArrayBuffer support (Required for Pyodide & WebR)
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Store room state: { [roomId]: { code: string, language: string } }
const rooms = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);

        // Initialize room if not exists
        if (!rooms[roomId]) {
            rooms[roomId] = {
                code: '// Start coding...',
                language: 'javascript'
            };
        }

        // Send current room state to the user
        socket.emit('sync-code', rooms[roomId]);

        // Notify others in room (optional, for presence)
        socket.to(roomId).emit('user-joined', socket.id);
    });

    socket.on('code-change', ({ roomId, code }) => {
        if (rooms[roomId]) {
            rooms[roomId].code = code;
            // Broadcast to everyone else in the room
            socket.to(roomId).emit('code-change', code);
        }
    });

    socket.on('language-change', ({ roomId, language, template }) => {
        if (rooms[roomId]) {
            rooms[roomId].language = language;
            // If template provided, update code too
            if (template) {
                rooms[roomId].code = template;
                io.to(roomId).emit('code-change', template);
            }
            io.to(roomId).emit('language-change', language);
        }
    });

    socket.on('chat-message', ({ roomId, message, sender, senderName }) => {
        console.log(`📨 Chat message received - Room: ${roomId}, Sender: ${senderName} (${sender}), Message: "${message}"`);
        // Use io.in() instead of io.to() to include the sender as well
        io.in(roomId).emit('chat-message', { message, sender, senderName, timestamp: new Date() });
        console.log(`📤 Message broadcast to room ${roomId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Serve static files from React build (production)
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// SPA fallback - serve index.html for all non-API routes
// This must be AFTER all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
