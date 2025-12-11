# End-to-End Application Development

In this homework, we'll build an end-to-end application with AI.

You can use any tool you want: ChatGPT, Claude, GitHub Copilot, Codex, Cursor, Antigravity, etc.

With chat-based applications you will need to copy code back-and-forth, so we recommend that you use an AI assistant in your IDE with agent mode.

We will implement a platform for online coding interviews.

The app should be able to do the following:

- Create a link and share it with candidates
- Allow everyone who connects to edit code in the code panel
- Show real-time updates to all connected users
- Support syntax highlighting for multiple languages
- Execute code safely in the browser

You can choose any technologies you want. For example:

- Frontend: React + Vite
- Backend: Express.js

We recommend using JavaScript for frontend, because with other technologies, some of the homework requirements may be difficult to implement.

But you can experiment with alternatives, such as Streamlit.

You don't need to know these technologies for doing this homework.


## Question 1: Initial Implementation

Ask AI to implement both frontend and backend - in one prompt.

Note: you can also follow the same path as in the videos and make it in 3 steps:

1. Frontend
2. OpenAPI specs
3. Backend

What's the initial prompt you gave to AI to start the implementation?

Copy and paste it in the homework form.

Answer:
I want to build real-time collaborative coding interview platform. It must have the following features: - Create a link and share it with candidates - Allow everyone who connects to edit code in the code panel - Show real-time updates to all connected users - Support syntax highlighting for multiple languages - Execute code safely in the browser And if possible, implement also the following two "bonuses" bonus 1: Built-in Chat Panel; a small text chat box on the side or bottom of the editor. bonus 2: Language Switching with Template Starter Code; A dropdown that lets users switch languages, and loads a minimal starter code snippet (e.g., def main(): for Python, or public class Main {} for Java). Create both frontend and backend. Use react and vite for frontend and express.js for backend

## Question 2: Integration Tests

Maybe at this point your application will already function. Maybe not. But it's always a good idea to cover it with tests.

We usually do it even before trying to run the application because it helps to resurface all the problems with implementation.

Ask AI to write integration tests that check that the interaction between client and server works.

Also it's a good idea to ask it to start creating a `README.md` file with all the commands for running and testing your application.

What's the terminal command you use for executing tests?
Answer
npx mocha test/integration.test.js --exit

Answer
Summary of Integration Tests
Here is what we have tested and verified:

Code Synchronization (should sync code changes...)
Verified: When Client A types code, Client B receives the exact same code instantly.
Result: ✅ Passed
Real-time Chat (should chat between two clients)
Verified: When Client A sends a chat message, Client B receives it with the correct text.
Result: ✅ Passed
Language Switching (should sync language changes...)
Verified: When Client A selects a new language (e.g., Python), Client B's editor updates to that language AND loads the correct starter template.
Result: ✅ Passed
These tests confirm the "Shared Real-time State" is working for all core features. Code execution is handled locally by the browser (verified manually via the UI), but the coordination of that state is handled and verified by the server tests.

## Question 3: Running Both Client and Server

Now let's make it possible to run both client and server at the same time. Use `concurrently` for that.

What's the command you have in `package.json` for `npm dev` for running both?


## Question 4: Syntax Highlighting

Let's now add support for syntax highlighting for JavaScript and Python.

Which library did AI use for it?



## Question 5: Code Execution

Now let's add code execution.

For security reasons, we don't want to execute code directly on the server. Instead, let's use WASM to execute the code only in the browser.

Which library did AI use for compiling Python to WASM?


## Question 6: Containerization

Now let's containerize our application. Ask AI to help you create a Dockerfile for the application. Put both backend and frontend in one container.

What's the base image you used for your Dockerfile?


## Question 7: Deployment

Now let's deploy it. Choose a service to deploy your application.

Which service did you use for deployment?


## Homework URL

Commit your code to GitHub. You can create a repository for this course. Within the repository, create a folder, e.g. "02-coding-interview", where you put the code.

Use the link to this folder in the homework submission form.

Don't forget to commit your code at every step. You can create an `AGENTS.md` file with the instructions for AI to help you with git commands.


## Tip

You can copy-paste the homework description into the AI system of your choice. But make sure you understand (and follow) all the steps in the response.


## Submission

Submit your homework here: https://courses.datatalks.club/ai-dev-tools-2025/homework/hw2


## Learning in Public

We encourage everyone to share what they learned. 

Don't worry about being perfect. Everyone starts somewhere, and people love following genuine learning journeys!

### Recording a Demo Video

Consider recording a short demo video of your application in action! This makes your post much more engaging and helps others see what you've built.

You can use:
- Screen recording tools like OBS Studio, QuickTime, or Windows Game Bar
- Loom for quick and shareable recording
- Snapping Tool on Windowns
  
Keep it short (30-90 seconds) and show:
- Creating a coding session link
- Multiple users editing code simultaneously
- Real-time updates across browsers
- Code execution in action

Upload your video to LinkedIn, Twitter/X, or YouTube and share the link!

### Example post for LinkedIn:

```
🚀 Week 2 of AI Dev Tools Zoomcamp by @DataTalksClub complete!

Just built a real-time collaborative coding interview platform using AI assistants!

Today I learned how to:

- ✅ Build full-stack applications with AI (frontend + backend)
- ✅ Implement real-time collaboration with WebSockets
- ✅ Add syntax highlighting for multiple languages
- ✅ Execute code safely in the browser with WASM
- ✅ Containerize and deploy the application

Here's my repo: <LINK>
Demo video: <VIDEO_LINK>

Following along with this amazing course - who else is building with AI?

You can sign up here: https://github.com/DataTalksClub/ai-dev-tools-zoomcamp/
```

### Example post for Twitter/X:


```
🤖 Built a collaborative coding platform with AI!

🔗 Shareable links
⚡ Real-time collaboration
🎨 Syntax highlighting
🚀 Browser code execution

My repo: <LINK>
Demo: <VIDEO_LINK>

Join me: https://github.com/DataTalksClub/ai-dev-tools-zoomcamp/
```
