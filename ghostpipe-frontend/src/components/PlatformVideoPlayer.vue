<template>
  <div class="gp-player" @click="synchronize">
      <vue-plyr :options="options">
        <video controls playsinline v-bind:data-poster="viddata.hugest_jpg_thumbnail.url" ref="video">
            <source v-bind:src="viddata.requested_video_format.url" v-bind:type="viddata.requested_video_format.mimetype" v-bind:size="viddata.requested_video_format.width">
        </video>
      </vue-plyr>
      <audio v-bind:src="viddata.requested_audio_format.url" autoplay ref="audio" controls></audio>
  </div>
</template>

<script>

export default {
  name: 'PlatformVideoPlayer',
  data: () => {
    return {
        options:{

        }
    };
  },
  props: [
      "viddata"
  ],
  methods:{
      synchronize(){
          if(!this.$refs["audio"]){
              console.warn("Audio ref not initalized");
          }
          this.$refs["audio"].currentTime = this.$refs["video"].currentTime;
          this.$refs["audio"].muted = this.$refs["video"].muted;
          this.$refs["audio"].volume = this.$refs["video"].volume;
          if(this.$refs["audio"].paused != this.$refs["video"].paused){
              if(this.$refs["video"].paused){
                    this.$refs["audio"].pause();
              }else{
                    this.$refs["audio"].play();
              }
          }
      }
  }
}
</script>
