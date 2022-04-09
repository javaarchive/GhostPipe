import 'vuetify/styles'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
});

app.use(vuetify);