import 'vuetify/styles' // Global CSS has to be imported

import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from "./router/index";
import { loadFonts } from './plugins/webfontloader'

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


loadFonts()

let app = createApp(App)
  .use(vuetify)
  .use(router)
  ;


app.config.errorHandler = (err) => {
  alert("Error Encounter: " + err);
}

app.mount('#app');

