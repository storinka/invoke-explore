import { createApp } from 'vue'
import App from './App.vue'
import SDropdown from '@storinka/dropdown'

const app = createApp(App)

app.use(SDropdown)

app.mount('#app')
