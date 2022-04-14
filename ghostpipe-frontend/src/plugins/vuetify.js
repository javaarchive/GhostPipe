// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'

function determineTheme(){
  if(localStorage.getItem("useDarkTheme")) return "dark"; // persistent localStorage option 
  if((new URLSearchParams(location.search)).get("dark")) return "dark"; // Url parameter to enable dark mode
  return "light";
}

export default createVuetify(
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
  {
    theme:{
      defaultTheme: determineTheme()
    }
  }
)
