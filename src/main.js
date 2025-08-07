import '../node_modules/flowbite-vue/dist/index.css'
import './assets/tailwind.css'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import pinia from './stores'

const app = createApp(App)

app.use(pinia);
app.use(router);
app.mount('#app');
