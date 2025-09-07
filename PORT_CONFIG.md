# 🔌 SEMANTEST Port Configuration

**CRITICAL**: All components MUST use port **8084**

## ✅ Current Configuration

| Component | Port | Status |
|-----------|------|--------|
| Server (Fran) | `ws://localhost:8084/ws` | ✅ RUNNING |
| Extension (Wences) | `ws://localhost:8084/ws` | ✅ UPDATED |
| CLI (Elena) | `http://localhost:8084` | ✅ ALIGNED |

## 🚀 Quick Test Commands

### Test Server Connection
```bash
# Test if server is running
curl http://localhost:8084/health

# Test WebSocket
wscat -c ws://localhost:8084/ws

# Or in Chrome DevTools Console:
new WebSocket('ws://localhost:8084/ws')
```

### Extension Connection Test
```javascript
// Paste in Chrome DevTools Console on ChatGPT page:
const testWS = new WebSocket('ws://localhost:8084/ws');
testWS.onopen = () => console.log('✅ Connected!');
testWS.onerror = (e) => console.error('❌ Error:', e);
```

## 📝 Environment Variables

Add to your `.env` file:
```bash
SEMANTEST_WS_PORT=8084
SEMANTEST_WS_URL=ws://localhost:8084/ws
SEMANTEST_API_URL=http://localhost:8084
```

## 🔧 If You Need to Change Ports

### Option 1: Change Server Port (Fran)
```javascript
// server.js
const PORT = process.env.SEMANTEST_WS_PORT || 8084;
```

### Option 2: Change Extension Port (Wences)
```javascript
// websocket-client.js
this.url = process.env.SEMANTEST_WS_URL || 'ws://localhost:8084/ws';
```

## ⚠️ Common Issues

### Connection Refused
- Check server is running: `npm run server`
- Check port not in use: `lsof -i :8084`

### CORS Issues
- Server should allow origin: `https://chat.openai.com`

### WebSocket Upgrade Failed
- Ensure proper WebSocket headers in server

---

**REMEMBER: Port 8084 for everything!**