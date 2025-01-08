import { createApp } from 'vue';
import App from './App.vue';
import { createVuetify } from 'vuetify';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import 'vuetify/styles';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';

// Create Vue app with Vuetify and Toast plugins
const app = createApp(App);
const vuetify = createVuetify({
  components,
  directives,
  icons: { defaultSet: 'mdi' },
});

app.use(vuetify);
app.use(Toast, {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
});
app.mount('#app');
