// main.js
import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import { createPinia } from 'pinia'

// Patch global addEventListener cho các sự kiện "wheel" và "mousewheel" để tự động thêm { passive: true }
const originalAddEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(type, listener, options) {
  if (type === 'wheel' || type === 'mousewheel') {
    if (options === undefined) {
      options = { passive: true };
    } else if (typeof options === 'boolean') {
      options = { capture: options, passive: true };
    } else if (typeof options === 'object') {
      options.passive = true;
    }
  }
  return originalAddEventListener.call(this, type, listener, options);
};

const app = createApp(App)
const pinia = createPinia()

app.use(ElementPlus)
app.use(router)
app.use(pinia)
app.mount('#app')
