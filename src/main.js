import { createApp } from 'vue';
import App from './App.vue';
import { createVuetify } from 'vuetify';
import Toast from 'vue-toastification';
import router from './router';
import { createPinia } from 'pinia';
import 'vue-toastification/dist/index.css';
import 'vuetify/styles';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';
// require('dotenv').config();

// Create Vue app with Vuetify and Toast plugins
const app = createApp(App);
const pinia = createPinia();
const vuetify = createVuetify({
  components,
  directives,
  icons: { defaultSet: 'mdi' },
});

app.use(vuetify);
app.use(pinia);
app.use(router);
app.use(Toast, {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  transition: "Vue-Toastification__fade", 
});
app.mount('#app');
