import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import apolloProvider from './apollo';

createApp(App).use(router).use(apolloProvider).mount('#app');