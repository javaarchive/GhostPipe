<template>
  <div>
    <h1 v-bind:title="title"> {{fulltitle}} </h1>
    <p v-if="isErrored">Video could not be loaded either due to network error or unavalibility. Please note that age restricted videos are unable to be loaded through the platform.</p>
    <PlatformVideoPlayer v-if="hasLoadedMetadata" v-bind:viddata="fullData"></PlatformVideoPlayer>
    <p v-bind:title="vid" class="gp-description">Description:<br />{{description}} </p>
  </div>
</template>

<script>

import {dfetch} from '../fetcher/data_fetcher'

import {processVideoData} from '../utils'

import PlatformVideoPlayer from './PlatformVideoPlayer.vue'

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
      hasLoadedMetadata: false,
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
        let loadedData = processVideoData(await dfetch("/real_api/videos/video/" + this.vid));
        console.log("resolved title to",loadedData.title);
        this.title = loadedData.title;
        this.fulltitle = loadedData.fulltitle;
        this.description = loadedData.description;
        this.fullData = loadedData;
        this.hasLoadedMetadata = true;
      }catch(ex){
        console.log("Video Load Error",ex);
        this.title = "VIDEO LOAD ERROR";
        this.description = "Video Load Fail";
        this.isErrored = true;
      }
    }
  },components:{
    PlatformVideoPlayer
  }
}
</script>
