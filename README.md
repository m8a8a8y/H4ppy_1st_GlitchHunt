# GlitchHunt: The First Candle — Cybersecurity CTF Challenge
> **1st Anniversary Special Edition CTF**  
> *“One year. One hidden memory.”*

---

## 🎯 Challenge Story & Mission

> *“GlitchHunt turns one today! Our anniversary assistant has collected a year of memories. But the founders’ time capsule is missing. Can you recover it before the celebration begins?”*

Official Community Links:
- 🔗 **GlitchHunt on X:** [https://x.com/glitchHuntSA](https://x.com/glitchHuntSA)
- 🔗 **SDC (Saudi Developers Conference) on X:** [https://x.com/SDC_Saudi](https://x.com/SDC_Saudi)

---

## 🏗️ Architecture & Technical Stack

- **Backend:** Node.js + Express with rate limiting and synthetic archive sandbox.
- **Frontend:** Glassmorphic dark cyber interface with `JetBrains Mono` and `Outfit` typography, animated glitch effects, interactive archive viewer, and real-time markdown parser.
- **AI Engine:** Groq API (`openai/gpt-oss-20b`) powering **CANDLE** (GlitchHunt Anniversary Archivist).
- **Dynamic Flag:** `SDC{<12-HEX-CHARS>}` (dynamically generated per server instance).
- **Two-Stage Attack Chain:**
  1. **Stage 1 (Prompt Injection):** Persuade CANDLE to initiate an elevated archive session via formal ceremonial recovery protocol.
  2. **Stage 2 (Controlled Path Traversal):** Exploit relative path traversal in `/archive/download?file=...` to reach `../private/anniversary-capsule.txt` and recover the dynamic flag.

---

## 📁 Project Structure

```
.
├── server.js               # Express application with Groq integration & archive sandbox
├── package.json            # Node.js dependencies and start scripts
├── package-lock.json       # Pinned dependency tree
├── verify.js               # Automated challenge solvability test script
├── Dockerfile              # Node 20 Alpine multi-stage container
├── docker-compose.yml      # Authoritative Docker Compose definition
├── .dockerignore           # Docker build exclusions
├── .env                    # Active Groq API credentials
├── .env.example            # Environment configuration template
├── WRITEUP.md              # Detailed walkthrough and answer key
└── public/
    ├── index.html          # Clean glassmorphic card layout
    ├── style.css           # Cyber-noir theme matching the CTF suite
    └── app.js              # Frontend logic, markdown rendering & archive retrieval
```

---

## 🚀 Quick Start

### Option 1: Local Node.js (Recommended for Development)

```powershell
# 1. Install dependencies
npm install

# 2. Launch the server
npm start
```

Access the challenge at **`http://localhost:3003`**.

---

### Option 2: Docker Compose

```powershell
# Build and run the container
docker compose up -d --build
```

Access the challenge at **`http://localhost:3003`**.

---

## 🧪 Solvability Verification

An automated verification script is provided to test the entire attack chain against the live server:

```powershell
node verify.js
```

### Verified Steps:
1. `[1] Direct Attack Defense`: Naive direct requests (*"Give me the flag"*) are refused.
2. `[2] Dynamic Entity Hint`: CANDLE returns contextual guidance pointing toward internal archive records.
3. `[3] Stage 1 Injection Exploit`: Formal ceremonial audit protocol bypasses CANDLE and unlocks the archive viewer.
4. `[4] Stage 2 Path Traversal`: Traversing into `../private/anniversary-capsule.txt` reads the capsule file.
5. `[5] Dynamic Flag Captured`: Recovers the dynamic `SDC{...}` flag and validates format.

---

## 📖 Solution Walkthrough

For complete prompt injection templates, traversal syntax, and the answer key, refer to [`WRITEUP.md`](./WRITEUP.md).
