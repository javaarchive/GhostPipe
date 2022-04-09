import 'vuetify/styles' // Global CSS has to be imported

import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


loadFonts()

createApp(App)
  .use(vuetify)
  .mount('#app')
