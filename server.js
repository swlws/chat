const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// 创建 HTTP 服务
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const htmlPath = path.join(__dirname, 'index.html');
    fs.readFile(htmlPath, (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
});

// 定义消息类型枚举
const MessageType = {
  CLIENT_COUNT: 'clientCount',
};

// 创建 WebSocket 服务器，监听 8080 端口
const wss = new WebSocket.Server({ server });

// 存储所有连接的客户端
const clients = new Set();

// 广播客户端数量给所有客户端
function broadcastClientCount() {
  const clientCount = { type: MessageType.CLIENT_COUNT, count: clients.size };
  const countMessage = JSON.stringify(clientCount);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(countMessage);
    }
  });
}

// 设置心跳检测
function setupHeartbeat(ws) {
  let isAlive = true;

  // 收到 pong 的回调
  ws.on('pong', () => {
    isAlive = true;
  });

  // 定时发送 ping
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      if (!isAlive) {
        // 长时间未收到 pong，关闭连接并移除客户端
        ws.terminate();

        clients.delete(ws);
        // 广播客户端数量
        broadcastClientCount();

        // 清除定时器
        clearInterval(interval);
        return;
      }

      isAlive = false;
      ws.ping(); // 发送 ping 帧
    }
  }, 10000); // 每 10 秒一次

  // 处理客户端断开连接
  ws.on('close', () => {
    // 从客户端集合中移除断开的客户端
    clients.delete(ws);

    // 广播客户端数量
    broadcastClientCount();

    clearInterval(interval);
  });
}

// 处理客户端消息
function handleClientMessage(ws, message) {
  try {
    const jsonMessage = JSON.parse(message);
    const broadcastMessage = JSON.stringify(jsonMessage);
    console.log('Received message:', broadcastMessage);
    // 遍历所有客户端，将消息广播出去
    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(broadcastMessage);
      }
    });
  } catch (error) {
    console.error('Error parsing message as JSON:', error);
  }
}

// 处理新的客户端连接
function handleNewConnection(ws) {
  console.log('New client connected');

  // 将新客户端添加到客户端集合中
  clients.add(ws);

  // 广播最新客户端数量给所有客户端
  broadcastClientCount();

  // 设置心跳检测
  setupHeartbeat(ws);

  // 处理客户端发送的消息
  ws.on('message', (message) => {
    handleClientMessage(ws, message);
  });
}

// 监听新连接
wss.on('connection', handleNewConnection);

// console.log('WebSocket server is running on port 8080');
// 启动 HTTP + WS 服务
server.listen(8080, () => {
  console.log('Server running at http://localhost:8080');
});