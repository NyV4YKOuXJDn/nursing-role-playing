import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// 创建Vue应用
const app = createApp(App);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 使用ElementPlus
app.use(ElementPlus);

// 使用Pinia状态管理
app.use(createPinia());

// 使用Vue Router
app.use(router);

// 挂载应用
app.mount('#app'); 