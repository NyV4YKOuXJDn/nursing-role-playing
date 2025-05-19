<script setup lang="ts">
// 移除不需要的组件导入
</script>

<template>
  <router-view />
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --primary-color: #1976d2;
  --secondary-color: #2c3e50;
  --text-color: #333;
  --light-bg: #f0f2f5;
  --border-radius: 8px;
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  --transition: all 0.3s ease;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  font-size: 16px;
  background-color: var(--light-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

#app {
  width: 100%;
  height: 100vh;
}

/* 按钮全局样式优化 */
.el-button {
  border-radius: var(--border-radius);
  transition: var(--transition);
  font-weight: 500;
}

.el-button--primary {
  background-color: var(--primary-color);
}

.el-button--primary:hover {
  background-color: #1565c0;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(21, 101, 192, 0.3);
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 简单动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.5s ease;
}
</style>
