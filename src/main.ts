// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

// Required Vue Flow Stylesheets
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const app = createApp(App)
app.use(router)
app.mount('#app')