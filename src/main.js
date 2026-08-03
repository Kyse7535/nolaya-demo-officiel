import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Toast, {
  position: 'top-right',
  timeout: 10000,
  maxToasts: 4,
  newestOnTop: true,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  closeButton: 'button',
  icon: false,
  transition: 'Vue-Toastification__fade',
  toastClassName: 'demo-toast',
  bodyClassName: 'demo-toast__body',
})

app.mount('#app')
