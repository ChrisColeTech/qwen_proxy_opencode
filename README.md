# Qwen OpenAI-Compatible Proxy

A fully functional Node.js proxy server that provides an OpenAI-compatible API interface for Qwen AI. Use any OpenAI-compatible client to chat with Qwen models!

## Project Status

**Active Development - Roocode Integration**

This project now includes **backend-v2**, a specialized version with automatic tool call wrapping for Roocode compatibility. See [backend-v2/README.md](backend-v2/README.md) for details.

## Current Version

### Roocode Integration (`backend-v2/`)
Specialized OpenAI-compatible proxy with intelligent tool call wrapping for Roocode AI coding assistant.

**Port:** 8001
**Use case:** Roocode AI coding assistant
**Status:** Active development - solving streaming XML parsing challenge

**Note:** This is currently the only backend. The original generic proxy was replaced by this Roocode-specific implementation.

## Features

✅ **Working & Tested** - Successfully proxies requests to Qwen AI
✅ **OpenAI API Compatible** - Drop-in replacement for OpenAI endpoints
✅ **Streaming & Non-Streaming** - Supports both response modes
✅ **Automatic Multi-turn Conversations** - Works with ANY OpenAI client, no modifications needed!
✅ **Smart Session Tracking** - Automatically matches conversation history to continue chats
✅ **Tool Calling Support** - Full OpenAI function calling compatibility with XML transformation (85-95% reliability)
✅ **Proper Error Handling** - Qwen errors transformed to OpenAI format
✅ **Auto Port Management** - Kills port before starting
🚧 **Roocode Tool Call Wrapping** - In development (backend-v2)

## 🖥️ Desktop App Available!

**NEW:** We now have an Electron desktop application that makes managing the proxy much easier!

**Features:**
- Beautiful admin dashboard with dark theme
- System tray integration (runs in background)
- Embedded browser for Qwen login (no DevTools needed!)
- Automatic cookie extraction
- One-click start/stop proxy server
- Token expiration monitoring with notifications
- Cross-platform (Windows, macOS, Linux)

**Quick Start:**
```bash
npm run electron        # Launch the desktop app
npm run build:win       # Build Windows installer
npm run build:mac       # Build macOS installer
npm run build:linux     # Build Linux AppImage
```

**Documentation:** See [docs/ELECTRON.md](docs/ELECTRON.md) for full details.

---

## Quick Start (CLI Mode)

### 1. Installation

```bash
npm install
```

### 2. Get Your Qwen Credentials

You need two things from your browser while logged into chat.qwen.ai:

**A. Get bx-umidtoken:**
1. Open DevTools (F12) → Network tab
2. Make any request on chat.qwen.ai
3. Find request header `bx-umidtoken`
4. Copy the token value

**B. Get Cookies (MOST IMPORTANT - includes auth token):**
1. Open DevTools (F12) → Application/Storage tab
2. Navigate to Cookies → https://chat.qwen.ai
3. Copy the entire cookie string, especially make sure you have the `token` cookie (JWT)

The `token` cookie is **critical** - without it you'll hit rate limits as an unauthenticated user.

### 3. Configure Environment

Create `.env` file:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Qwen API Configuration
QWEN_BASE_URL=https://chat.qwen.ai
QWEN_TOKEN=<your-bx-umidtoken>
QWEN_COOKIES=<your-full-cookie-string-from-browser>

# Logging
LOG_LEVEL=info
```

**Example cookies (get your own - these are expired):**
```
QWEN_COOKIES=x-ap=na-vancouver-pop; aui=8d852373-d39f-4863-93ea-a9c2eba797b3; token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; acw_tc=0a03e58617614886302738719e3f7ec...
```

### 4. Start Server

```bash
cd backend-v2
npm start
```

Server starts on `http://localhost:8001`

## Usage

### Using cURL

```bash
# List models
curl http://localhost:8001/v1/models

# Chat completion
curl -X POST http://localhost:8001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer any-key" \
  -d '{
    "model": "qwen3-max",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

### Using OpenAI SDK

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:8001/v1',
  apiKey: 'any-key', // Not validated, but required by SDK
});

const response = await client.chat.completions.create({
  model: 'qwen3-max',
  messages: [
    { role: 'user', content: 'Explain quantum computing' }
  ],
});

console.log(response.choices[0].message.content);
```

### Streaming

```javascript
const stream = await client.chat.completions.create({
  model: 'qwen3-max',
  messages: [{ role: 'user', content: 'Write a poem' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

### Multi-turn Conversations

**🎉 Just Works™ - No modifications needed!** The proxy automatically tracks conversation history using an intelligent session store:

```javascript
// First message
const response1 = await client.chat.completions.create({
  model: 'qwen3-max',
  messages: [
    { role: 'user', content: 'Hi, my name is Alice' }
  ],
});

// Continue conversation - just include the full history!
// The proxy automatically recognizes this as the same conversation
const response2 = await client.chat.completions.create({
  model: 'qwen3-max',
  messages: [
    { role: 'user', content: 'Hi, my name is Alice' },
    { role: 'assistant', content: response1.choices[0].message.content },
    { role: 'user', content: 'What is my name?' }
  ],
});

// Keep going - works with any length conversation!
const response3 = await client.chat.completions.create({
  model: 'qwen3-max',
  messages: [
    { role: 'user', content: 'Hi, my name is Alice' },
    { role: 'assistant', content: response1.choices[0].message.content },
    { role: 'user', content: 'What is my name?' },
    { role: 'assistant', content: response2.choices[0].message.content },
    { role: 'user', content: 'Tell me a joke' }
  ],
});
```

**How it works:**
- The proxy uses SHA256 hashing of conversation history to automatically match and continue conversations
- Sessions are kept in memory for 1 hour of inactivity
- Works with **any** OpenAI-compatible client (no custom fields needed!)
- No server-side database required

### Tool Calling (Function Calling)

**✅ FULLY SUPPORTED** - The proxy now supports OpenAI-compatible tool calling with automatic transformation!

**How it works:**
1. **Request**: OpenAI `tools` definitions → Transformed to XML format in system prompt
2. **Response**: Qwen XML tool calls → Parsed back to OpenAI `tool_calls` format
3. **Tool Results**: OpenAI `role: "tool"` messages → Transformed to `role: "user"` for Qwen

**Example:**

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:3000/v1',
  apiKey: 'any-key',
});

// Define tools
const tools = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get the current weather for a location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city and state, e.g. San Francisco, CA'
          },
          unit: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
            description: 'Temperature unit'
          }
        },
        required: ['location']
      }
    }
  }
];

// Step 1: Send request with tools
const response = await client.chat.completions.create({
  model: 'qwen3-max',
  messages: [
    { role: 'user', content: 'What is the weather in Boston?' }
  ],
  tools: tools,
});

// Step 2: Check if model wants to call a tool
if (response.choices[0].finish_reason === 'tool_calls') {
  const toolCall = response.choices[0].message.tool_calls[0];
  console.log('Tool:', toolCall.function.name);
  console.log('Args:', JSON.parse(toolCall.function.arguments));

  // Step 3: Execute the tool (your code)
  const weatherData = getWeather(JSON.parse(toolCall.function.arguments));

  // Step 4: Send tool result back
  const finalResponse = await client.chat.completions.create({
    model: 'qwen3-max',
    messages: [
      { role: 'user', content: 'What is the weather in Boston?' },
      response.choices[0].message, // Assistant's tool call
      {
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(weatherData)
      }
    ],
    tools: tools,
  });

  console.log(finalResponse.choices[0].message.content);
}
```

**Streaming Support:**

```javascript
const stream = await client.chat.completions.create({
  model: 'qwen3-max',
  messages: [{ role: 'user', content: 'Read the README file' }],
  tools: tools,
  stream: true,
});

for await (const chunk of stream) {
  // Tool calls are streamed incrementally
  const delta = chunk.choices[0]?.delta;
  if (delta?.tool_calls) {
    console.log('Tool call chunk:', delta.tool_calls);
  }
}
```

**Important Notes:**
- Tool definitions are injected **only on the first message** of a conversation (when `parentId === null`)
- Qwen maintains context including tools via server-side `parent_id` chain
- Supports both streaming and non-streaming modes
- **One tool per message** (RooCode convention for better reliability)
- **Reliability: 85-95%** - Qwen models understand and use tools but may occasionally return text instead
- Type conversion: `"true"` → `true`, `"42"` → `42` (automatic)
- Enable/disable via `ENABLE_TOOL_CALLING=true` in `.env` (default: enabled)

**Advanced: Manual chat_id (optional)**

For advanced use cases, you can manually manage `qwen_chat_id`:

```javascript
// Extract chat_id from response
const chatId = response1.qwen_chat_id;

// Manually pass chat_id
const response2 = await fetch('http://localhost:8001/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'qwen3-max',
    messages: [...],
    qwen_chat_id: chatId  // Optional manual override
  })
});
```

## Available Models

Use actual Qwen model names:

- `qwen3-max` - Best reasoning and capabilities
- `qwen3-coder-plus` - Code generation and analysis
- `qwen3-vl-plus` - Vision and multimodal tasks
- And more...

Get full list: `GET /v1/models`

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  OpenAI Client  │ ──────> │  Qwen Proxy     │ ──────> │  Qwen API       │
│  (Any App)      │ <────── │  (This Server)  │ <────── │  chat.qwen.ai   │
└─────────────────┘         └─────────────────┘         └─────────────────┘
    Standard                    Translation                 Proprietary
    OpenAI API                  Layer                       Qwen API
```

### Backend-v2 Architecture (Roocode)

```
┌─────────────────┐         ┌─────────────────────────────┐         ┌─────────────────┐
│    Roocode      │ ──────> │  Qwen Proxy v2              │ ──────> │  Qwen API       │
│  (Coding AI)    │         │  ┌───────────────────────┐  │         │  chat.qwen.ai   │
│                 │         │  │ StreamingXMLParser    │  │         │                 │
│  Expects XML    │ <────── │  │ (Intelligent Wrapper) │  │ <────── │  Returns Text   │
│  Tool Calls     │         │  └───────────────────────┘  │         │  or XML         │
└─────────────────┘         └─────────────────────────────┘         └─────────────────┘
```

**Key Challenge:** Roocode requires every response to be an XML tool call, but Qwen sometimes returns plain text. Backend-v2 uses a specialized streaming XML parser to intelligently wrap plain text without buffering or double-wrapping tool calls.

## Technical Details

### Project Structure

```
qwen_proxy/
├── backend-v2/               # Roocode-compatible proxy (Port 8001)
│   ├── src/
│   │   ├── index.js          # Express server with tool call wrapping
│   │   ├── streamTransformer.js  # XML tool call detection & wrapping
│   │   ├── services/
│   │   │   ├── qwen-client.js    # Qwen API client
│   │   │   └── transformer.js    # Message format transformations
│   │   ├── utils/
│   │   │   ├── session-store.js  # Hash-based session tracking
│   │   │   ├── logger.js         # Logging utilities
│   │   │   └── uuid.js           # ID generation
│   │   ├── middleware/       # (placeholder for future middleware)
│   │   └── routes/           # (placeholder for future routes)
│   ├── test/
│   │   └── roocode-test.js   # Comprehensive test suite
│   ├── TEST_RESULTS.md       # Test results & analysis
│   ├── DIAGNOSTIC_REPORT.md  # Technical debugging details
│   ├── FINDINGS.md           # Investigation findings
│   └── package.json          # Backend-v2 dependencies
├── frontend/                 # React + TypeScript dashboard
│   ├── src/
│   │   ├── components/       # UI components (shadcn/ui)
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts (theme, etc.)
│   │   ├── services/         # API services
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/            # Utility functions
│   └── package.json          # Frontend dependencies
├── electron/                 # Electron desktop app
│   ├── main.js               # Main process
│   ├── preload.js            # Preload script (IPC bridge)
│   ├── dist/                 # Compiled TypeScript
│   └── package.json          # Electron dependencies
├── docs/
│   ├── 00-API_REFERENCE.md           # API documentation
│   ├── 01-ELECTRON.md                # Electron app guide
│   ├── IMPLEMENTATION_GUIDE.md       # Implementation details
│   ├── STREAM_TRANSFORMATION_SOLUTION.md  # Streaming solution docs
│   ├── roo/
│   │   └── system_prompt.json        # Roocode's system prompt
│   ├── payloads/                     # Example API requests/responses
│   │   ├── completion/
│   │   ├── models/
│   │   ├── new_chat/
│   │   └── tools/
│   ├── tasks/                        # Development task tracking
│   └── v1/                           # Legacy documentation
├── package.json              # Root workspace configuration
└── README.md                 # This file
```

**Note:** There is no `backend/` directory. The project currently has only `backend-v2` which serves as the Roocode-compatible proxy. The original backend was replaced by backend-v2.

### Dependencies

- **express** - Web server
- **axios** - HTTP client for Qwen API
- **winston** - Logging
- **uuid** - ID generation
- **dotenv** - Environment variables

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/v1/models` | List available Qwen models |
| POST | `/v1/chat/completions` | Create chat completion (streaming or non-streaming) |

## Challenges We Solved

### 1. Stateful vs Stateless API Design

**Problem:** Qwen requires chat sessions (`chat_id`) while OpenAI clients send full conversation history. Standard OpenAI SDKs don't know about `chat_id`.

**Solution:**
- Implemented hash-based session store using SHA256
- Automatically matches conversation history to existing `chat_id`
- Works transparently with **any** OpenAI client - no modifications needed!
- Sessions expire after 1 hour of inactivity

### 2. Message Deduplication

**Problem:** OpenAI clients send the full conversation history, but Qwen rejects requests with too many messages for existing chats.

**Solution:**
- Extract only new messages after the last assistant response
- Qwen receives minimal payload while maintaining conversation context
- Reduces API payload size and avoids "too many messages" errors

### 3. Alibaba Cloud WAF

**Problem:** Qwen's API is protected by Alibaba Cloud WAF, which blocked our requests with captcha pages.

**Solution:**
- Added browser-like `User-Agent` header
- Included all cookies from authenticated browser session
- Most critical: The `token` cookie (JWT) for authentication

### 4. Parent ID Validation

**Problem:** Qwen validates that message `parent_id` exists in the conversation tree.

**Solution:**
- Always use `parent_id: null` for simplicity
- Let Qwen handle message threading internally via `chat_id`

### 5. Guest vs Authenticated Rate Limits

**Problem:** Without proper authentication, hit severe rate limits ("You've reached the daily usage limit").

**Solution:**
- Discovered that the `token` cookie (JWT) is required for authenticated access
- Guest users (without token): Very limited requests
- Authenticated users (with token): Normal usage limits

### 6. Roocode Tool Call Wrapping (Backend-v2 - In Progress)

**Problem:** Roocode requires every response to be an XML tool call, but Qwen sometimes returns plain text. Simple buffering defeats streaming, and simple pass-through doesn't meet Roocode's requirements.

**Current Status:** Developing specialized streaming XML parser module that can:
- Parse XML in real-time without defeating streaming
- Detect tool tags as they arrive in chunks
- Wrap plain text in `<attempt_completion>` tags
- Never double-wrap existing tool calls
- Handle mixed responses (text before tool call)

**See:** [backend-v2/STREAMING_XML_PARSER_PLAN.md](backend-v2/STREAMING_XML_PARSER_PLAN.md) for detailed architecture plan.

## Troubleshooting

### Tool calls not working

**Symptom:** Model returns text instead of tool calls

**Possible causes:**
1. Using a less capable model (e.g., qwen3-base)
   - **Fix:** Use `qwen3-max` or `qwen3-coder-plus` for best tool calling performance

2. Tool calling disabled via environment variable
   - **Fix:** Check `.env` has `ENABLE_TOOL_CALLING=true` (default)

3. Natural variation in model behavior (85-95% reliability)
   - **Fix:** This is expected - retry or rephrase the request

4. Tools not defined in first message
   - **Fix:** Include `tools` parameter in the first message of a conversation

**Debug steps:**
1. Check server logs for `[QwenToOpenAI] Tool call detected` messages
2. Verify tools are in the correct OpenAI format
3. Test with a direct tool request: "Use the read_file tool to read README.md"
4. Try a more explicit system prompt mentioning available tools

### Tool results not sent correctly

**Symptom:** Error after sending tool results

**Fix:** Ensure tool result messages use `role: "tool"` not `role: "user"`:
```javascript
// Correct
{
  role: 'tool',
  tool_call_id: 'call_123',
  content: 'Tool result here'
}

// Incorrect
{
  role: 'user',
  content: 'Tool result here'
}
```

The proxy automatically transforms `role: "tool"` to `role: "user"` for Qwen.

### "Rate limit" error

**Symptom:**
```json
{
  "error": {
    "message": "You've reached the upper limit for today's usage."
  }
}
```

**Cause:** Missing or expired `token` cookie in `QWEN_COOKIES`

**Fix:**
1. Log into chat.qwen.ai in your browser
2. Get fresh cookies from DevTools → Application → Cookies
3. Make sure the `token` cookie is included
4. Update `.env` with the new cookie string

### Empty response content

**Symptom:** Response has empty `content` field

**Check:** Look at server logs for actual Qwen error (Bad_Request, parent_id not exist, etc.)

**Common causes:**
- Invalid parent_id (fixed in current version)
- Expired cookies
- Invalid model name

### WAF Captcha Page

**Symptom:** Server logs show HTML captcha page instead of JSON

**Cause:** Missing User-Agent or cookies

**Fix:** Already handled in current version - check that cookies are set in `.env`

### Roocode Tool Calls Printed as Text (Backend-v2)

**Symptom:** Roocode displays XML tool calls as text instead of executing them:
```
<read_file><args><file><path>README.md</path></file></args></read_file>
```

**Cause:** StreamTransformer is wrapping tool calls inside `<attempt_completion>` tags, preventing execution.

**Status:** In active development - see backend-v2/STREAMING_XML_PARSER_PLAN.md for solution architecture.

## Limitations

1. **Token Usage** - Qwen doesn't provide token counts, so usage stats are estimated
2. **Cookie Expiration** - JWT token expires, need to refresh cookies periodically (or use Electron app!)
3. **Single User** - Currently supports one set of credentials
4. **Tool Calling Reliability** - 85-95% success rate:
   - ✅ Full OpenAI-compatible tool calling with XML transformation
   - ✅ Automatic type conversion (string → boolean/number)
   - ⚠️ Qwen models may occasionally return text instead of tool calls
   - ⚠️ More capable models (qwen3-max, qwen3-coder-plus) have higher success rates
   - ℹ️ One tool per message for best reliability (RooCode convention)
5. **No Vision** - Multimodal inputs not yet transformed
6. **🚧 Roocode Integration** - Backend-v2 in active development

## Future Enhancements

- [x] ~~Auto-refresh expired cookies~~ - ✅ Implemented in Electron app!
- [x] ~~CLI tool for easy testing~~ - ✅ Electron desktop app available!
- [~] **Tool Calling / Function Calling** - ⚠️ Pass-through support added, waiting for Qwen API to support execution
- [~] **Roocode Integration** - 🚧 Backend-v2 in active development
- [ ] Streaming XML Parser for real-time tool detection
- [ ] Multi-user token management
- [ ] Vision model support (image inputs)
- [ ] Rate limiting
- [ ] Caching layer
- [ ] Docker support

## License

MIT

## Contributing

Issues and pull requests welcome!
