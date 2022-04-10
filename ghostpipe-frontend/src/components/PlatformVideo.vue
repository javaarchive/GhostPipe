<template>
  <div>
    <h1 v-bind:title="title"> {{fulltitle}} </h1>
    <p v-if="isErrored">Video could not be loaded either due to network error or unavalibility. Please note that age restricted videos are unable to be loaded through the platform.</p>
    <p v-bind:title="vid">Description:<br />{{description}} </p>
  </div>
</template>

<script>

import {dfetch} from '../fetcher/data_fetcher'

export default {
  name: 'PlatformVideo',
  mounted () {
    console.log('Mounted a platform video');
    // Fetch details
    this.fetchVideoDetails();
  },
  data () {
    return {
      title: "Loading...",
      isLoading: true,
      isErrored: false,
      description: "A description slowly loads...",
      fullData: null
    }
  },
  props: ["minimal","vid"],
  methods: {
    async fetchVideoDetails(){
      console.log('Fetching video details');
      this.title = "Loading Metadata...";
      this.isLoading = true;
      try{
        let loadedData = await dfetch("/real_api/videos/video/" + this.vid);
        console.log("resolved title to",loadedData.title);
        this.title = loadedData.title;
        this.fulltitle = loadedData.fulltitle;
        this.description = loadedData.description;
        this.fullData = loadedData;
      }catch(ex){
        this.title = "VIDEO LOAD ERROR";
        this.description = "Video Load Fail";
        this.isErrored = true;
      }
    }
  }
}
</script>
