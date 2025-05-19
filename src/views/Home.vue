<template>
  <div class="home-container">
    <div class="home-content">
      <div class="logo-container">
        <div class="nurse-logo"></div>
      </div>
      <h1>护理教学剧本杀</h1>
      <p class="description">选择一个护理教学场景，开始角色扮演和应急处理训练</p>
      <div class="scene-selector">
        <el-select v-model="selectedTheme" placeholder="选择场景" class="theme-select">
          <el-option
            v-for="theme in themes"
            :key="theme.value"
            :label="theme.label"
            :value="theme.value"
          />
        </el-select>
      </div>
      <el-button type="primary" @click="startChat" :disabled="!selectedTheme" class="start-button">
        开始模拟训练
      </el-button>
    </div>
    <div class="footer">
      由 Dify AI 提供技术支持
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const selectedTheme = ref('');

// 预设的场景主题
const themes = [
  { label: '心肺复苏', value: '心肺复苏' },
  { label: '静脉输液', value: '静脉输液' },
  { label: '伤口护理', value: '伤口护理' },
  { label: '糖尿病患者护理', value: '糖尿病患者护理' },
  { label: '老年患者护理', value: '老年患者护理' }
];

const startChat = () => {
  if (selectedTheme.value) {
    router.push({
      name: 'Chat',
      query: { theme: selectedTheme.value }
    });
  }
};
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #f0f2f5 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.home-content {
  max-width: 500px;
  width: 90%;
  padding: 40px;
  text-align: center;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  animation: fadeInUp 0.8s ease;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.logo-container {
  margin-bottom: 20px;
}

.nurse-logo {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='90' fill='%23e3f2fd'/%3E%3Crect x='85' y='50' width='30' height='100' rx='6' fill='%23f44336'/%3E%3Crect x='50' y='85' width='100' height='30' rx='6' fill='%23f44336'/%3E%3Cpath d='M70 55 Q100 35 130 55 L125 70 Q100 55 75 70 Z' fill='%23ffffff' stroke='%232196f3' stroke-width='3'/%3E%3Ccircle cx='100' cy='100' r='90' fill='none' stroke='%231976d2' stroke-width='4'/%3E%3C/svg%3E");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

h1 {
  color: #2c3e50;
  font-size: 2.2rem;
  margin-bottom: 16px;
  font-weight: 600;
}

.description {
  color: #5c6b7a;
  font-size: 1.1rem;
  margin-bottom: 30px;
  line-height: 1.6;
}

.scene-selector {
  margin: 20px 0 30px;
}

.theme-select {
  width: 100%;
}

.theme-select :deep(.el-input__wrapper) {
  padding: 8px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.25s ease;
}

.theme-select :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.start-button {
  width: 100%;
  height: 46px;
  font-size: 1.1rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.start-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(64, 158, 255, 0.3);
}

.footer {
  margin-top: 40px;
  color: #8c9bab;
  font-size: 0.9rem;
  text-align: center;
}

@media (max-width: 768px) {
  .home-content {
    padding: 30px 20px;
  }
  
  h1 {
    font-size: 1.8rem;
  }
  
  .description {
    font-size: 1rem;
  }
}
</style> 