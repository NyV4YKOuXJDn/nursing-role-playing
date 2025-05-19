# 护理教学剧本杀前端设计文档

## 1. 项目概述

### 1.1 背景介绍

护理教学剧本杀是一个基于Dify API的医学教育系统，旨在通过情境模拟和角色扮演的方式，帮助护理人员提升应急处理能力和临床决策能力。现有系统在功能上可以满足基本教学需求，但前端界面简陋，用户体验不佳，影响了教学效果和用户体验。

### 1.2 项目目标

开发一套基于Vue3+Vite的全新前端界面，提升用户体验，同时保持系统核心功能不变。主要解决以下问题：

1. 提供更直观、美观的用户界面
2. 增强多角色对话的视觉区分，改善信息层次结构
3. 优化用户交互体验，提供更友好的输入和操作方式
4. 提供场景剧本的流畅展示，包括更好的Markdown和JSON渲染

### 1.3 技术栈

- 框架：Vue 3
- 构建工具：Vite
- UI组件库：Element Plus
- HTTP客户端：Axios
- 状态管理：Pinia
- 路由：Vue Router
- Markdown渲染：Marked.js

## 2. 系统架构

### 2.1 架构图

```
+-------------------+     +-------------------+
|                   |     |                   |
|    前端应用        | <-> |    Dify API       |
|   (Vue3 + Vite)   |     |                   |
|                   |     |                   |
+-------------------+     +-------------------+
```

### 2.2 前端结构

```
护理教学剧本杀/
├── public/                 # 静态资源
├── src/
│   ├── assets/             # 项目资源文件(图片、字体等)
│   ├── components/         # 公共组件
│   │   ├── common/         # 通用组件
│   │   ├── home/           # 首页相关组件
│   │   └── chat/           # 聊天页面相关组件
│   ├── views/              # 页面视图
│   │   ├── Home.vue        # 首页(场景选择)
│   │   └── Chat.vue        # 聊天页面(对话交互)
│   ├── router/             # 路由配置
│   ├── store/              # 状态管理
│   ├── api/                # API请求
│   ├── utils/              # 工具函数
│   ├── styles/             # 全局样式
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── .env                    # 环境变量
├── vite.config.js          # Vite配置
└── package.json            # 项目依赖
```

## 3. 页面设计

### 3.1 首页设计

#### 3.1.1 功能描述

首页是用户进入系统的第一个页面，主要功能是让用户选择要进行的护理教学场景。

#### 3.1.2 UI设计

包含以下元素：
- 系统名称和Logo
- 简短的系统介绍
- 场景选择下拉框
- 开始按钮
- 渐变背景和现代化卡片设计
- 页脚信息

#### 3.1.3 交互流程

1. 用户进入首页
2. 从下拉框中选择一个护理教学场景
3. 点击"开始模拟训练"按钮
4. 系统跳转到聊天页面，并使用所选场景初始化对话

#### 3.1.4 可用场景限制

**重要说明**：经过测试发现，当前Dify API仅支持以下场景主题：
- 心肺复苏
- 静脉输液
- 儿童留置针（未在前端菜单中显示）

选择其他场景（如"伤口护理"、"糖尿病患者护理"、"老年患者护理"）会导致API返回400错误。

### 3.2 聊天页面设计

#### 3.2.1 功能描述

聊天页面是系统的核心交互界面，用户在这里与Dify API进行多轮对话，模拟护理场景中的角色扮演和应急处理。

#### 3.2.2 UI设计

包含以下元素：
- 页面顶部：场景名称、返回首页按钮、重置对话按钮
- 对话区域(占据页面主体)：
  - Markdown格式内容的格式化显示
  - JSON格式的多角色对话，每个角色有独特的样式
  - 用户输入的消息，右侧显示
- 交互按钮：
  - 首轮对话后的"请继续"按钮
  - 剧本结束时的"好的"按钮
- 页面底部：
  - 消息输入框
  - 发送按钮

#### 3.2.3 内容展示设计

对Dify API返回的内容采取以下展示策略：

1. Markdown内容：使用Marked.js格式化显示，支持标题、列表、代码块等
2. JSON格式内容：解析并显示为多角色对话，每个角色有独特的样式
   - 预设角色（医生、护士、旁白、提示）使用专门设计的样式
   - 动态生成的角色自动分配不同的颜色风格，基于角色名称的哈希值
3. 用户消息：右侧显示，使用独特的气泡样式

#### 3.2.4 交互功能增强

1. **键盘操作优化**：
   - 回车键发送消息
   - Ctrl+回车插入换行

2. **交互按钮**：
   - 第一轮对话结束后显示"请继续"按钮
   - 检测到"此剧本已结束"文本时显示"好的"按钮

3. **流式输出增强**：
   - Markdown内容实时流式显示
   - JSON内容结构化流式显示，保持格式

#### 3.2.5 角色样式设计

1. **预设角色样式**：
   - 医生：蓝色系气泡，左侧显示
   - 护士：绿色系气泡，左侧显示
   - 旁白：紫色系气泡，居中显示，使用加粗字体
   - 提示：黄色系气泡，居中显示，使用斜体

2. **动态角色样式**：
   - 自动为未预设的角色分配8种不同风格中的一种
   - 样式保持一致性（同一角色在整个对话中使用相同样式）

#### 3.2.6 关键组件

- `ChatHeader`: 聊天页面顶部组件，显示场景名称和功能按钮
- `MessageList`: 消息列表组件，展示所有对话内容
- `DynamicRoleMessage`: 动态角色消息组件，根据角色名称显示不同样式
- `UserMessage`: 用户消息组件，显示用户的输入
- `MessageInput`: 消息输入组件，支持回车发送和Ctrl+回车换行

## 4. API集成

### 4.1 Dify API集成

#### 4.1.1 API基本信息

- API地址：https://www.hulichatbot.xyz/v1
- App ID：app-Im8dDaMyg4Av8Y1rfcTPYCO6

#### 4.1.2 API接口

根据Dify的标准API，主要使用以下端点：

1. 创建对话会话：
   ```
   POST /v1/chat-messages
   ```

2. 发送消息并获取回复：
   ```
   POST /v1/chat-messages/{conversation_id}
   ```

#### 4.1.3 请求/响应示例

创建会话请求示例（使用流式输出模式）：
```javascript
fetch(`${API_BASE_URL}/chat-messages`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  },
  body: JSON.stringify({
    inputs: {
      theme: theme.value
    },
    query: `我想进行${theme.value}场景的角色扮演`,
    user: userId.value,
    response_mode: 'streaming'
  })
})
```

发送消息请求示例（使用流式输出模式）：
```javascript
fetch(`${API_BASE_URL}/chat-messages`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  },
  body: JSON.stringify({
    inputs: {
      theme: theme.value
    },
    query: userMessage,
    user: userId.value,
    conversation_id: conversationId.value,
    response_mode: 'streaming'
  })
})
```

### 4.2 流式数据处理

#### 4.2.1 增强的流式响应处理

使用Fetch API和ReadableStream处理流式数据：

```javascript
const processStreamResponse = async (response) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let isJsonResponse = false;
  jsonBuffer.value = null;
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const eventData = line.slice(5).trim();
          try {
            const parsedData = JSON.parse(eventData);
            
            if (parsedData.event === 'message') {
              const answerContent = parsedData.answer || '';
              
              // 检测是否是JSON响应
              if (currentStreamContent.value === '' && answerContent.trim().startsWith('```json')) {
                isJsonResponse = true;
                jsonBuffer.value = { startTag: '```json\n', content: [], endTag: '```' };
              }
              
              // 处理JSON流式输出
              if (isJsonResponse) {
                if (answerContent.includes('{') || answerContent.includes('}') || 
                    answerContent.includes('[') || answerContent.includes(']')) {
                  try {
                    // 尝试累积并解析JSON
                    jsonBuffer.value.content.push(answerContent);
                    const jsonString = jsonBuffer.value.startTag + 
                                       jsonBuffer.value.content.join('') + 
                                       jsonBuffer.value.endTag;
                    currentStreamContent.value = jsonString;
                  } catch (e) {
                    // 解析失败时继续累积内容
                    jsonBuffer.value.content.push(answerContent);
                  }
                }
              } else {
                // 普通文本流式输出
                currentStreamContent.value += answerContent;
              }
            } 
            else if (parsedData.event === 'message_end') {
              // 消息结束
              conversationId.value = parsedData.conversation_id;
              // 将完整消息添加到消息列表
              messages.value.push({
                type: 'dify',
                content: currentStreamContent.value
              });
              isLoading.value = false;
              currentStreamContent.value = '';
              jsonBuffer.value = null;
            }
            else if (parsedData.event === 'error') {
              handleError(parsedData);
            }
          } catch (e) {
            console.error('Failed to parse event data:', eventData, e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Stream processing error:', error);
    isLoading.value = false;
  }
};
```

## 5. 交互增强设计

### 5.1 "请继续"按钮

在第一轮对话完成后，系统会显示一个"请继续"按钮，用户点击后将自动发送"请继续"消息：

```vue
<!-- 第一轮对话结束后的"请继续"按钮 -->
<div v-if="index === 0 && messages.length === 1 && !isLoading" class="continue-button-container">
  <p class="continue-hint">如果你准备好了，请输入：请继续</p>
  <el-button type="primary" @click="sendContinue" class="action-button">
    请继续
  </el-button>
</div>
```

```javascript
// "请继续"按钮处理
const sendContinue = () => {
  inputText.value = '请继续';
  sendMessage();
};
```

### 5.2 剧本结束检测与"好的"按钮

当系统检测到消息中包含"此剧本已结束"文本时，会自动显示一个"好的"按钮，用户点击后将发送"好的"消息：

```vue
<!-- 结束对话的"好的"按钮 -->
<div v-if="hasEndText(message.content)" class="continue-button-container">
  <el-button type="success" @click="sendOk" class="action-button">
    好的
  </el-button>
</div>
```

```javascript
// 用于检测结束语句的常量
const END_TEXT = '此剧本已结束';

// 检查消息是否包含结束文本
const hasEndText = (content) => {
  return content.includes(END_TEXT);
};

// "好的"按钮处理
const sendOk = () => {
  inputText.value = '好的';
  sendMessage();
};
```

### 5.3 回车发送/Ctrl+回车换行

增强输入框操作，回车键直接发送消息，Ctrl+回车插入换行符：

```vue
<el-input
  v-model="inputText"
  type="textarea"
  :rows="3"
  placeholder="请输入您的回复...(回车发送，Ctrl+回车换行)"
  @keydown="handleKeyDown"
  :disabled="isLoading"
/>
```

```javascript
// 键盘事件处理
const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    if (e.ctrlKey) {
      // Ctrl+Enter插入换行
      inputText.value += '\n';
    } else {
      // 回车发送消息
      e.preventDefault();
      if (inputText.value.trim() && !isLoading.value) {
        sendMessage();
      }
    }
  }
};
```

## 6. 动态角色样式系统

### 6.1 角色样式分配

系统设计了一个动态角色样式分配机制，为不同角色自动分配不同的视觉风格：

```javascript
// 为角色自动分配样式
const roleColors = [
  { bg: '#e3f2fd', border: '#1976d2', textColor: '#0d47a1' }, // 蓝色系
  { bg: '#e8f5e9', border: '#2e7d32', textColor: '#1b5e20' }, // 绿色系
  { bg: '#fff3e0', border: '#e65100', textColor: '#bf360c' }, // 橙色系
  { bg: '#f3e5f5', border: '#9c27b0', textColor: '#6a1b9a' }, // 紫色系
  { bg: '#e8eaf6', border: '#3f51b5', textColor: '#283593' }, // 靛蓝系
  { bg: '#fce4ec', border: '#d81b60', textColor: '#880e4f' }, // 粉色系
  { bg: '#e0f7fa', border: '#00acc1', textColor: '#006064' }, // 青色系
  { bg: '#fff8e1', border: '#ffa000', textColor: '#ff6f00' }, // 琥珀色系
];

// 角色样式映射缓存
const roleStyleCache = ref({});

// 获取发言人样式类
const getSpeakerClass = (speaker) => {
  if (speaker === '李医生') {
    return 'doctor-message';
  } else if (speaker === '王护士') {
    return 'nurse-message';
  } else if (speaker === '提示') {
    return 'tip-message';
  } else if (speaker === '旁白') {
    return 'narrator-message';
  } else {
    // 对于其他角色，使用哈希算法分配样式
    if (!roleStyleCache.value[speaker]) {
      // 基于角色名称生成一个简单的哈希值
      const hash = speaker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const colorIndex = hash % roleColors.length;
      roleStyleCache.value[speaker] = `dynamic-role-${colorIndex}`;
    }
    return roleStyleCache.value[speaker];
  }
};
```

### 6.2 CSS样式实现

为每种动态角色创建对应的CSS类：

```css
/* 动态角色样式 */
.dynamic-role-0 {
  background-color: #e3f2fd;
  align-self: flex-start;
  margin-left: 10px;
  border-left: 4px solid #1976d2;
  position: relative;
  color: #0d47a1;
}

.dynamic-role-0::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 14px;
  border-width: 6px;
  border-style: solid;
  border-color: transparent #e3f2fd transparent transparent;
}

/* 其他动态角色样式类似... */

/* 确保动态角色气泡也有悬停效果 */
.dynamic-role-0:hover, .dynamic-role-1:hover, .dynamic-role-2:hover, 
.dynamic-role-3:hover, .dynamic-role-4:hover, .dynamic-role-5:hover, 
.dynamic-role-6:hover, .dynamic-role-7:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}
```

## 7. 响应式设计

系统支持不同尺寸的设备，确保在桌面和平板上都有良好的使用体验。

### 7.1 主要响应式调整

```css
@media (max-width: 768px) {
  .chat-header {
    padding: 10px 16px;
  }
  
  .message-list {
    padding: 16px;
  }
  
  .dify-message, .doctor-message, .nurse-message, .narrator-message, .tip-message, .other-message, .user-message,
  .dynamic-role-0, .dynamic-role-1, .dynamic-role-2, .dynamic-role-3,
  .dynamic-role-4, .dynamic-role-5, .dynamic-role-6, .dynamic-role-7 {
    max-width: 90%;
    padding: 12px 14px;
  }
  
  .message-input {
    padding: 12px 16px;
  }
  
  h1 {
    font-size: 1.8rem;
  }
  
  .description {
    font-size: 1rem;
  }
}
```

## 8. 已知限制与建议

### 8.1 API场景限制

当前Dify API仅支持以下场景：
1. 心肺复苏
2. 静脉输液
3. 儿童留置针（未在前端菜单中）

建议：
- 在前端只提供这三个可用场景选项
- 或向Dify API管理员请求添加其他场景支持

### 8.2 错误处理

针对API调用失败的情况，系统已添加错误处理机制，但仍可进一步增强：

```javascript
if (!response.ok) {
  const errorText = await response.text();
  console.error('API错误响应:', errorText);
  throw new Error(`HTTP error! status: ${response.status}`);
}
```

### 8.3 未来增强点

1. 增加错误反馈界面，而非仅在控制台输出错误
2. 优化同一角色在多轮对话中的视觉连贯性
3. 增加历史对话保存和加载功能
4. 添加模拟评分系统，提供学习反馈
5. 引入音频提示，增强交互体验

## 9. 总结

本设计文档详细描述了护理教学剧本杀系统的前端实现，重点关注提升用户交互体验和视觉呈现效果。系统采用Vue3+Vite技术栈，实现了多角色对话的差异化显示、流式响应的实时更新、以及多种交互增强功能。

已实现的主要功能：
1. 美观现代的UI界面，支持响应式布局
2. 多角色对话气泡的差异化展示
3. Markdown和JSON内容的格式化与流式显示
4. 回车发送/Ctrl+回车换行的输入体验优化
5. "请继续"和"好的"按钮的自动显示
6. 动态角色样式分配系统

通过这些功能的实现，系统为护理教学提供了更加直观、易用的交互界面，有效提升了教学效果和用户体验。 