const { expect } = require("chai");
const { io } = require("socket.io-client");
const server = require("../index"); // This might need refactoring if index.js starts server immediately

// We need to ensure we can start/stop the server or just connect to the running one.
// Since index.js starts on port 3000 automatically when required, we might have port conflicts if we run this while the other one is running.
// BUT, for now let's assume valid integration test connects to localhost:3000 (if running) or starts one on a different port.
// Better approach: Modify index.js to export 'server' and 'io', and only listen if not in test mode, OR just connect to the already running server if we want "integration" with live env.
// Let's Connect to the RUNNING server on port 3000 for simplicity of this environment, OR spawn a new one on 3001.
// Let's spawn new one on 3001 to be safe and independent.

describe("Socket.io Integration Tests", function () {
    let client1, client2;
    const PORT = 3000; // Testing against standard port for now or we will get EADDRINUSE if we try to start another.
    // Actually, since the user is running the server, let's just connect to it!
    const SOCKET_URL = `http://localhost:${PORT}`;

    beforeEach((done) => {
        client1 = io(SOCKET_URL);
        client2 = io(SOCKET_URL);

        // Wait for connection
        let connected = 0;
        const onConnect = () => {
            connected++;
            if (connected === 2) done();
        };

        client1.on("connect", onConnect);
        client2.on("connect", onConnect);
    });

    afterEach(() => {
        client1.disconnect();
        client2.disconnect();
    });

    it("should sync code changes between two clients in the same room", function (done) {
        const roomId = "test-room-1";
        const newCode = "console.log('Test');";

        // join room
        client1.emit("join-room", roomId);
        client2.emit("join-room", roomId);

        // Give a bit of time for joins to process
        setTimeout(() => {
            // client1 sends code
            client1.emit("code-change", { roomId, code: newCode });
        }, 50);

        // client2 should receive it
        client2.on("code-change", (code) => {
            expect(code).to.equal(newCode);
            done();
        });
    });

    it("should chat between two clients", function (done) {
        const roomId = "test-room-chat";
        const msg = "Hello World";

        client1.emit("join-room", roomId);
        client2.emit("join-room", roomId);

        setTimeout(() => {
            client1.emit("chat-message", { roomId, message: msg, sender: client1.id });
        }, 50);

        client2.on("chat-message", (data) => {
            expect(data.message).to.equal(msg);
            // expect(data.sender).to.not.equal(client2.id); // Sender is client1
            done();
        });
    });

    it("should sync language changes between two clients", function (done) {
        const roomId = "test-room-lang";
        const newLang = "python";
        const boilerplate = "print('Hello')";

        client1.emit("join-room", roomId);
        client2.emit("join-room", roomId);

        setTimeout(() => {
            client1.emit("language-change", { roomId, language: newLang, template: boilerplate });
        }, 50);

        let codeUpdated = false;
        let langUpdated = false;

        const checkDone = () => {
            if (codeUpdated && langUpdated) done();
        };

        client2.on("language-change", (lang) => {
            expect(lang).to.equal(newLang);
            langUpdated = true;
            checkDone();
        });

        // Language change also triggers a code update (template loading)
        client2.on("code-change", (code) => {
            expect(code).to.equal(boilerplate);
            codeUpdated = true;
            checkDone();
        });
    });
});
