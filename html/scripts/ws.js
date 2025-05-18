(() => {
  const clientCountSpan = document.getElementById('client-count');
  const messagesDiv = document.getElementById('messages');
  const textareaField = document.getElementById('input-textarea');
  let originalTitle = document.title;
  let hasUnread = false;
  let ws = null; // 将 ws 变量改为可重新赋值
  let reconnectTimer = null;
  // 用于存储重连定时器

  // 创建 WebSocket 连接的函数
  function createWebSocket() {
    ws = new WebSocket(`wss://swlws.site/api-ws`);

    ws.onopen = () => {
      addMessage('🔌 已连接到服务器');

      // 清除重连定时器
      if (reconnectTimer) {
        clearInterval(reconnectTimer);
        reconnectTimer = null;
      }

      // 只在第一次访问时显示说明
      if (isFirstVisit) {
        addMessage('💡 说明：\n• 任意键聚焦输入框\n• 按 ESC 清空聊天记录');
        // 标记已访问
        localStorage.setItem('chatHasVisited', 'true');
      }
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'clientCount') {
        clientCountSpan.textContent = msg.count;
      } else if (msg.type === 'chat') {
        addMessage(`💬 ${msg.content}`);

        // 如果页面处于隐藏状态，显示提醒
        if (document.hidden) {
          hasUnread = true;
          document.title = '🌟' + originalTitle;
        }
      }
    };

    ws.onclose = () => {
      addMessage('❌ 已断开连接，正在尝试重连...');

      // 设置重连定时器
      if (!reconnectTimer) {
        reconnectTimer = setInterval(() => {
          if (ws.readyState === WebSocket.CLOSED) {
            createWebSocket();
          }
        }, 3000); // 每3秒尝试重连一次
      }
    };
  }

  // 检查是否是第一次访问
  const isFirstVisit = !localStorage.getItem('chatHasVisited');

  // 初始化连接
  createWebSocket();

  function sendMessage() {
    const text = textareaField.value.trim();
    if (!text) return;

    // 检查连接状态
    if (ws.readyState !== WebSocket.OPEN) {
      addMessage('❌ 已断开连接，请刷新页面重试');
      return;
    }

    const message = {
      type: 'chat',
      content: text,
    };
    ws.send(JSON.stringify(message));
    addMessage(`👤 ${text}`);
    textareaField.value = '';
  }

  function addMessage(text) {
    const div = document.createElement('div');

    // 创建消息内容元素
    const messageContent = document.createElement('span');
    messageContent.className = 'message-content';
    messageContent.textContent = text;

    // 创建时间元素
    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    timeSpan.textContent = `${hours}:${minutes}`;

    // 添加内容和时间到消息div
    div.appendChild(timeSpan);
    div.appendChild(messageContent);

    // 如果消息是自己发送的，添加data-self属性
    if (text.startsWith('👤')) {
      div.setAttribute('data-self', 'true');
    }

    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // 分发动画
    window.dispatchAnimation(text);
  }

  // 添加清空消息的函数
  function clearMessages() {
    messagesDiv.innerHTML = '';
  }

  // Enter 键发送消息
  textareaField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // 添加全局键盘事件监听器，当按下任意键时聚焦输入框
  document.addEventListener('keydown', (e) => {
    // 检测 ESC 键
    if (e.key === 'Escape') {
      clearMessages();
      return;
    }

    // 如果当前焦点不在输入框上，且不是在输入其他表单元素中
    if (
      document.activeElement !== textareaField &&
      !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
    ) {
      textareaField.focus();
    }
  });

  // 检查页面可见性变化
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // 页面重新激活时，恢复原始标题
      document.title = originalTitle;
      hasUnread = false;
    }
  });
})();
