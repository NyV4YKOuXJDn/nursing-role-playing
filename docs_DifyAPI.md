# Dify API 文档摘要 - 护理教学剧本杀项目专用

## 基础信息
- **基础 URL**: http://www.hulichatbot.xyz/v1
- **App ID**: app-Im8dDaMyg4Av8Y1rfcTPYCO6
- **API Key**: app-Im8dDaMyg4Av8Y1rfcTPYCO6 (在Dify中，API Key与App ID是相同的标识符)
- **鉴权方式**: API-Key (通过 Authorization Header)
  ```
  Authorization: Bearer app-Im8dDaMyg4Av8Y1rfcTPYCO6
  ```
- **重要提示**: 强烈建议将API-Key存储在后端，不要暴露在客户端

## 项目核心API

### 1. 对话相关API（关键功能）

#### 发送对话消息 (POST /chat-messages)
- **流式输出模式**（项目核心需求）:
  ```javascript
  const response = await fetch(`https://www.hulichatbot.xyz/v1/chat-messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer app-Im8dDaMyg4Av8Y1rfcTPYCO6'
    },
    body: JSON.stringify({
      inputs: {},  // 可包含场景选择
      query: userMessage,
      response_mode: 'streaming',  // 使用流式输出
      user: userId,
      conversation_id: conversationId // 首次对话可为空，系统会返回新的conversation_id
    })
  });
  
  // 处理流式响应
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const text = decoder.decode(value);
    const lines = text.split('\n\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.substring(6));
        
        // 处理不同类型的消息
        if (data.event === 'message') {
          // 处理常规消息片段
          result += data.answer || '';
          // 实时更新UI
        } else if (data.event === 'message_end') {
          // 消息结束，包含元数据
          console.log('消息完成', data.metadata);
        }
      }
    }
  }
  ```

#### 处理不同类型的消息
针对护理教学剧本杀项目，我们需要处理三种主要类型的消息：

1. **背景介绍类消息**：系统发送的场景背景、角色描述等信息
   ```javascript
   if (data.event === 'message' && isBackgroundInfo(data.answer)) {
     // 使用特殊样式显示背景信息
     displayBackgroundInfo(data.answer);
   }
   ```

2. **多人对话类消息**：模拟不同角色的对话内容
   ```javascript
   if (data.event === 'message' && isDialogue(data.answer)) {
     // 解析对话内容，识别说话的角色
     const { role, content } = parseDialogue(data.answer);
     // 根据角色不同显示不同样式
     displayDialogue(role, content);
   }
   ```

3. **总结评估类消息**：对学生表现的评价和建议
   ```javascript
   if (data.event === 'message' && isEvaluation(data.answer)) {
     // 使用评估样式显示
     displayEvaluation(data.answer);
   }
   ```

#### 停止响应 (POST /chat-messages/:task_id/stop)
当需要中断当前生成时：
```javascript
const stopResponse = await fetch(`https://www.hulichatbot.xyz/v1/chat-messages/${taskId}/stop`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer app-Im8dDaMyg4Av8Y1rfcTPYCO6'
  },
  body: JSON.stringify({
    user: userId
  })
});
```

### 2. 会话管理

#### 获取会话历史消息 (GET /messages)
```javascript
const historyResponse = await fetch(`https://www.hulichatbot.xyz/v1/messages?conversation_id=${conversationId}&user=${userId}`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer app-Im8dDaMyg4Av8Y1rfcTPYCO6'
  }
});

const history = await historyResponse.json();
// 处理历史消息
```

#### 获取会话列表 (GET /conversations)
```javascript
const conversationsResponse = await fetch(`https://www.hulichatbot.xyz/v1/conversations?user=${userId}`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer app-Im8dDaMyg4Av8Y1rfcTPYCO6'
  }
});

const conversations = await conversationsResponse.json();
// 显示会话列表
```

### 3. 护理场景应用实现建议

1. **场景选择**：使用inputs参数传递选定的场景
   ```javascript
   {
     inputs: {
       scene: "急诊护理", // 或 "ICU护理"、"产科护理" 等
       difficulty: "简单" // 或 "中等"、"困难"
     }
   }
   ```

2. **角色识别**：前端解析大模型返回的文本，区分不同角色的对话
   ```javascript
   function parseDialogue(text) {
     // 示例：通过文本格式识别角色
     // "护士：你好，请问有什么不舒服？"
     const match = text.match(/^([\u4e00-\u9fa5]+)：(.+)$/);
     if (match) {
       return {
         role: match[1], // 角色名称
         content: match[2] // 对话内容
       };
     }
     return { role: "系统", content: text };
   }
   ```

3. **评估反馈**：在场景结束后提供评估
   ```javascript
   // 当检测到对话完成时，请求评估
   const evaluationResponse = await fetch(`https://www.hulichatbot.xyz/v1/chat-messages`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer app-Im8dDaMyg4Av8Y1rfcTPYCO6'
     },
     body: JSON.stringify({
       query: "请对我在这个场景中的表现进行评估",
       conversation_id: conversationId,
       response_mode: 'streaming',
       user: userId
     })
   });
   ```

## 事件类型

在流式输出中，需要处理的主要事件类型：

- `message`: LLM返回文本块，核心内容展示
- `message_end`: 消息结束事件，标志流式返回结束
- `error`: 错误事件，需要妥善处理

## 安全建议
1. API-Key应保存在后端，避免在前端暴露
2. 设置正确的CORS，确保API请求安全
3. 用户标识需保证应用内唯一 