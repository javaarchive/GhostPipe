<template>
  <v-container fluid>
    <div class="gp-change-api-url">
      <h1>Change API URL</h1>
      <p>
        Doing this wrong may break the app. 
      </p>
      <v-text-field v-model="inputURL" label="api url" ></v-text-field>
      <v-btn @click="setURL">Set and go to Homepage</v-btn>
    </div>
  </v-container>
</template>

<script>

export default {
  name: 'ChangeAPI',

  data: () => {
    return {
      inputURL: ""
    }
  },
  methods: {
    setURL(){
      localStorage.setItem("apiURL",this.inputURL);
      this.$router.push('/');
      // alert("api url set!");
    }
  },
  mounted(){
    this.inputURL = this.$route.params.prefill_url;
    
  }
}
</script>
