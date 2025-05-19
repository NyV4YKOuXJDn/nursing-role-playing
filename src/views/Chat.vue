<template>
  <div class="chat-container">
    <div class="chat-header">
      <div class="back-button">
        <el-button @click="backToHome" :icon="ArrowLeft" plain>返回</el-button>
      </div>
      <h2 class="scene-title">{{ theme }}</h2>
      <div class="reset-button">
        <el-button @click="resetChat" plain>重置对话</el-button>
      </div>
    </div>

    <div class="message-list" ref="messageListRef">
      <div v-for="(message, index) in messages" :key="index" class="message-container">
        <!-- Dify返回内容 - Markdown格式 -->
        <div v-if="message.type === 'dify' && isMarkdown(message.content)" class="dify-message markdown-content">
          <div v-html="renderMarkdown(message.content)"></div>
          
          <!-- 第一轮对话结束后的"请继续"按钮 -->
          <div v-if="index === 0 && messages.length === 1 && !isLoading" class="continue-button-container">
            <p class="continue-hint">如果你准备好了，请输入：请继续</p>
            <el-button type="primary" @click="sendContinue" class="action-button">
              请继续
            </el-button>
          </div>
          
          <!-- 结束对话的"好的"按钮 -->
          <div v-if="hasEndText(message.content)" class="continue-button-container">
            <el-button type="success" @click="sendOk" class="action-button">
              好的
            </el-button>
          </div>
        </div>
        
        <!-- Dify返回内容 - JSON格式（多人对话） -->
        <div v-else-if="message.type === 'dify' && isJson(message.content)" class="multi-speaker-container">
          <div v-for="(speaker, speakerIndex) in parseJson(message.content)" :key="speakerIndex" 
               :class="getSpeakerClass(speaker.发言人)">
            <div class="speaker-name">{{ speaker.发言人 }}</div>
            <div class="speaker-content">{{ speaker.发言内容 }}</div>
          </div>
          
          <!-- 第一轮对话结束后的"请继续"按钮 -->
          <div v-if="index === 0 && messages.length === 1 && !isLoading" class="continue-button-container">
            <p class="continue-hint">如果你准备好了，请输入：请继续</p>
            <el-button type="primary" @click="sendContinue" class="action-button">
              请继续
            </el-button>
          </div>
          
          <!-- 结束对话的"好的"按钮 -->
          <div v-if="hasEndText(message.content)" class="continue-button-container">
            <el-button type="success" @click="sendOk" class="action-button">
              好的
            </el-button>
          </div>
        </div>
        
        <!-- 用户消息 -->
        <div v-else-if="message.type === 'user'" class="user-message">
          <div class="message-content">{{ message.content }}</div>
        </div>
      </div>
      
      <!-- 正在加载的消息 -->
      <div v-if="isLoading" class="message-container">
        <div v-if="isJson(currentStreamContent)" class="multi-speaker-container loading">
          <div v-for="(speaker, speakerIndex) in parseJson(currentStreamContent)" 
               :key="speakerIndex" 
               :class="getSpeakerClass(speaker.发言人)">
            <div class="speaker-name">{{ speaker.发言人 }}</div>
            <div class="speaker-content">{{ speaker.发言内容 }}</div>
          </div>
          <div class="loading-indicator">
            <el-icon class="is-loading"><Loading /></el-icon>
          </div>
        </div>
        <div v-else class="dify-message markdown-content loading">
          <div v-html="renderMarkdown(currentStreamContent)"></div>
          <div class="loading-indicator">
            <el-icon class="is-loading"><Loading /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <div class="message-input">
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="3"
        placeholder="请输入您的回复...(回车发送，Ctrl+回车换行)"
        @keydown="handleKeyDown"
        :disabled="isLoading"
      />
      <div class="input-actions">
        <el-tooltip content="回车发送">
          <el-button 
            type="primary" 
            :disabled="!inputText.trim() || isLoading" 
            @click="sendMessage"
            :loading="isLoading"
            class="send-button"
          >
            发送
          </el-button>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { Loading, ArrowLeft } from '@element-plus/icons-vue';
import { marked } from 'marked';

const route = useRoute();
const router = useRouter();
const theme = ref(route.query.theme || '未知场景');
const messageListRef = ref(null);

// 修改END_TEXT常量
const END_TEXT = '此剧本已结束';

// Dify API相关
const API_KEY = 'app-Im8dDaMyg4Av8Y1rfcTPYCO6'; // 在Dify中，appid就是API_KEY
const API_BASE_URL = 'https://www.hulichatbot.xyz/v1';
const userId = ref(`user-${Date.now()}`);
const conversationId = ref('');

// 检查消息是否包含结束文本
const hasEndText = (content) => {
  return content.includes(END_TEXT);
};

// 消息相关状态
const messages = ref([]);
const inputText = ref('');
const isLoading = ref(false);
const currentStreamContent = ref('');
const jsonBuffer = ref(null); // 用于累积JSON流

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

// "请继续"按钮处理
const sendContinue = () => {
  inputText.value = '请继续';
  sendMessage();
};

// "好的"按钮处理
const sendOk = () => {
  inputText.value = '好的';
  sendMessage();
};

// 内容类型判断函数
const isMarkdown = (content) => {
  return !content.trim().startsWith('```json');
};

const isJson = (content) => {
  try {
    return content.trim().startsWith('```json');
  } catch (e) {
    return false;
  }
};

// 解析JSON数据
const parseJson = (content) => {
  try {
    const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('JSON解析错误:', error);
    return [];
  }
};

// 渲染Markdown
const renderMarkdown = (content) => {
  return marked(content);
};

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

// 滚动到底部函数
const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
  });
};

// 监听消息变化，自动滚动
watch(() => messages.value.length, scrollToBottom);
watch(() => currentStreamContent.value, scrollToBottom);

// 处理流式响应
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
              console.error('Error:', parsedData);
              isLoading.value = false;
              currentStreamContent.value = '出错了: ' + parsedData.message;
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

// 初始化聊天
const initChat = async () => {
  isLoading.value = true;
  currentStreamContent.value = '';
  
  try {
    // 创建会话并发送初始消息
    const response = await fetch(`${API_BASE_URL}/chat-messages`, {
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
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API错误响应:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    await processStreamResponse(response);
    
  } catch (error) {
    console.error('初始化聊天失败:', error);
    isLoading.value = false;
    currentStreamContent.value = '初始化聊天失败，请重试';
  }
};

// 发送消息
const sendMessage = async () => {
  if (!inputText.value.trim() || isLoading.value) return;
  
  const userMessage = inputText.value.trim();
  // 添加用户消息到列表
  messages.value.push({
    type: 'user',
    content: userMessage
  });
  
  inputText.value = ''; // 清空输入框
  isLoading.value = true;
  currentStreamContent.value = '';
  
  try {
    // 发送消息到Dify API
    const response = await fetch(`${API_BASE_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        inputs: {
          theme: theme.value // 确保包含theme参数
        },
        query: userMessage,
        user: userId.value,
        conversation_id: conversationId.value,
        response_mode: 'streaming'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API错误响应:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    await processStreamResponse(response);
    
  } catch (error) {
    console.error('发送消息失败:', error);
    isLoading.value = false;
    messages.value.push({
      type: 'dify',
      content: '发送消息失败，请重试'
    });
  }
};

// 重置聊天
const resetChat = () => {
  messages.value = [];
  conversationId.value = '';
  initChat();
};

// 返回首页
const backToHome = () => {
  router.push('/');
};

// 组件挂载时初始化聊天
onMounted(() => {
  initChat();
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f2f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background-color: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 10;
}

.scene-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
}

.message-list {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #f0f2f5;
  background-image: linear-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.6) 1px, transparent 1px);
  background-size: 20px 20px;
  scroll-behavior: smooth;
}

.message-container {
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dify-message {
  max-width: 85%;
  padding: 14px 18px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  word-break: break-word;
  position: relative;
  transition: all 0.2s ease;
}

.dify-message:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.markdown-content {
  line-height: 1.6;
}

/* Markdown 样式 */
.markdown-content :deep(h1) {
  font-size: 1.8rem;
  margin-top: 0.7em;
  margin-bottom: 0.7em;
  color: #2c3e50;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-content :deep(h2) {
  font-size: 1.5rem;
  margin-top: 0.7em;
  margin-bottom: 0.7em;
  color: #2c3e50;
}

.markdown-content :deep(p) {
  margin: 0.7em 0;
}

.markdown-content :deep(ul), .markdown-content :deep(ol) {
  padding-left: 1.5em;
  margin: 0.7em 0;
}

.markdown-content :deep(li) {
  margin: 0.4em 0;
}

.markdown-content :deep(code) {
  background-color: #f3f4f5;
  padding: 3px 6px;
  border-radius: 4px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.9em;
  color: #476582;
}

.markdown-content :deep(pre) {
  background-color: #f8f8f8;
  padding: 14px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0.7em 0;
  border: 1px solid #eaecef;
}

/* 多人对话样式 */
.multi-speaker-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

.doctor-message, .nurse-message, .tip-message, .narrator-message, .other-message {
  padding: 14px 18px;
  border-radius: 12px;
  max-width: 80%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.doctor-message:hover, .nurse-message:hover, .tip-message:hover, .narrator-message:hover, .other-message:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.doctor-message {
  background-color: #e3f2fd;
  align-self: flex-start;
  margin-left: 10px;
  border-left: 4px solid #1976d2;
  position: relative;
}

.doctor-message::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 14px;
  border-width: 6px;
  border-style: solid;
  border-color: transparent #e3f2fd transparent transparent;
}

.nurse-message {
  background-color: #e8f5e9;
  align-self: flex-start;
  margin-left: 10px;
  border-left: 4px solid #2e7d32;
  position: relative;
}

.nurse-message::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 14px;
  border-width: 6px;
  border-style: solid;
  border-color: transparent #e8f5e9 transparent transparent;
}

/* 提示和旁白样式区分 */
.tip-message {
  background-color: #fff8e1;
  align-self: center;
  width: 90%;
  border: 1px solid #ffe082;
  border-left: 4px solid #ffa000;
  text-align: center;
  font-style: italic;
}

.narrator-message {
  background-color: #f3e5f5;
  align-self: center;
  width: 90%;
  border: 1px solid #e1bee7;
  border-left: 4px solid #9c27b0;
  text-align: center;
  font-weight: 500;
}

.other-message {
  background-color: #efebe9;
  align-self: flex-start;
  margin-left: 10px;
  border-left: 4px solid #6d4c41;
  position: relative;
}

.other-message::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 14px;
  border-width: 6px;
  border-style: solid;
  border-color: transparent #efebe9 transparent transparent;
}

.speaker-name {
  font-weight: 600;
  font-size: 0.9em;
  margin-bottom: 6px;
  color: #424242;
  padding-bottom: 4px;
  border-bottom: 1px dashed rgba(0,0,0,0.1);
}

.speaker-content {
  font-size: 1em;
  line-height: 1.5;
}

.user-message {
  max-width: 80%;
  padding: 14px 18px;
  background-color: #dcf8c6;
  border-radius: 12px 0 12px 12px;
  margin-left: auto;
  text-align: right;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  position: relative;
  transition: all 0.2s ease;
}

.user-message::after {
  content: '';
  position: absolute;
  right: -10px;
  top: 0;
  border-width: 10px;
  border-style: solid;
  border-color: #dcf8c6 transparent transparent transparent;
}

.user-message:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.loading {
  opacity: 0.8;
}

.loading-indicator {
  margin-top: 10px;
  text-align: center;
}

.loading-indicator :deep(.el-icon) {
  font-size: 20px;
  color: #1976d2;
}

.message-input {
  padding: 18px 24px;
  background-color: #ffffff;
  border-top: 1px solid #e8e8e8;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}

.message-input :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  transition: all 0.25s ease;
  padding: 12px;
  font-size: 1rem;
}

.message-input :deep(.el-textarea__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.send-button {
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

/* 继续按钮容器 */
.continue-button-container {
  margin-top: 16px;
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  text-align: center;
  border: 1px dashed #d0d0d0;
}

.continue-hint {
  margin-bottom: 12px;
  font-size: 0.9rem;
  color: #666;
}

.action-button {
  min-width: 120px;
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

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

.dynamic-role-1 {
  background-color: #e8f5e9;
  align-self: flex-start;
  margin-left: 10px;
  border-left: 4px solid #2e7d32;
  position: relative;
  color: #1b5e20;
}

.dynamic-role-1::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 14px;
  border-width: 6px;
  border-style: solid;
  border-color: transparent #e8f5e9 transparent transparent;
}

.dynamic-role-2 {
  background-color: #fff3e0;
  align-self: flex-start;
  margin-left: 10px;
  border-left: 4px solid #e65100;
  position: relative;
  color: #bf360c;
}

.dynamic-role-2::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 14px;
  border-width: 6px;
  border-style: solid;
  border-color: transparent #fff3e0 transparent transparent;
}

.dynamic-role-3 {
  background-color: #f3e5f5;
  align-self: flex-start;
  margin-left: 10px;
  border-left: 4px solid #9c27b0;
  position: relative;
  color: #6a1b9a;
}

.dynamic-role-3::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 14px;
  border-width: 6px;
  border-style: solid;
  border-color: transparent #f3e5f5 transparent transparent;
}

.dynamic-role-4 {
  background-color: #e8eaf6;
  align-self: flex-start;
  margin-left: 10px;
  border-left: 4px solid #3f51b5;
  position: relative;
  color: #283593;
}

.dynamic-role-4::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 14px;
  border-width: 6px;
  border-style: solid;
  border-color: transparent #e8eaf6 transparent transparent;
}

.dynamic-role-5 {
  background-color: #fce4ec;
  align-self: flex-start;
  margin-left: 10px;
  border-left: 4px solid #d81b60;
  position: relative;
  color: #880e4f;
}

.dynamic-role-5::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 14px;
  border-width: 6px;
  border-style: solid;
  border-color: transparent #fce4ec transparent transparent;
}

.dynamic-role-6 {
  background-color: #e0f7fa;
  align-self: flex-start;
  margin-left: 10px;
  border-left: 4px solid #00acc1;
  position: relative;
  color: #006064;
}

.dynamic-role-6::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 14px;
  border-width: 6px;
  border-style: solid;
  border-color: transparent #e0f7fa transparent transparent;
}

.dynamic-role-7 {
  background-color: #fff8e1;
  align-self: flex-start;
  margin-left: 10px;
  border-left: 4px solid #ffa000;
  position: relative;
  color: #ff6f00;
}

.dynamic-role-7::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 14px;
  border-width: 6px;
  border-style: solid;
  border-color: transparent #fff8e1 transparent transparent;
}

/* 确保动态角色气泡也有悬停效果 */
.dynamic-role-0:hover, .dynamic-role-1:hover, .dynamic-role-2:hover, 
.dynamic-role-3:hover, .dynamic-role-4:hover, .dynamic-role-5:hover, 
.dynamic-role-6:hover, .dynamic-role-7:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

/* 适配移动端样式 */
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
}
</style> 