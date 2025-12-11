# Real-time Collaborative Coding Interview Platform

A full-stack web application that allows interviewers and candidates to write, execute, and collaborate on code in real-time.

## Features

- **Real-time Collaboration**: Code changes are synchronized instantly across all users in the same room.
- **Multi-Language Support**:
  - **JavaScript**: Browser-based execution (Sandboxed).
  - **Python**: Full execution via Pyodide (WASM).
  - **R**: Full execution via WebR (WASM).
  - **Java**: Syntax highlighting and templates.
- **Built-in Chat**: Real-time text messaging within the interview room.
- **No Backend Execution**: All code runs safely in the client's browser using WebAssembly.

## Tech Stack

- **Frontend**: React, Vite, Monaco Editor, Socket.io-client
- **Backend**: Express, Socket.io (Node.js)
- **Styling**: Vanilla CSS (Premium Dark Theme)

## Prerequisites

- Node.js (v16+)
- npm

## Getting Started

### 1. Installation

Clone the repository and install dependencies for both server and client.

```bash
# Setup Backend
cd collaborative-interview/server
npm install

# Setup Client
cd ../client
npm install
```

### 2. Running the Application

You need to run both the backend and frontend terminals.

**Terminal 1 (Backend):**
```bash
cd collaborative-interview/server
npm start
# OR using nodemon for dev
nodemon index.js
```
*Server runs on port 3000.*

**Terminal 2 (Frontend):**
```bash
cd collaborative-interview/client
npm run dev -- --host
```
*Client runs on port 5173.*

### 3. Usage

1. Open the Frontend URL (e.g., http://localhost:5173).
2. Click **"Create New Interview"**.
3. Share the Room URL with another user.
4. Start coding!

### 4. Running Tests

We have integration tests for the real-time server logic.

```bash
cd collaborative-interview/server
# Ensure the server is running in another terminal on port 3000!
npx mocha test/integration.test.js
```

## Codespaces / Cloud Config

If running in GitHub Codespaces or similar cloud IDEs:
1. Ensure both **Port 3000** and **Port 5173** are set to **Public** visibility.
2. The application automatically detects the correct backend proxy URL.
