<template>
  <div class="gp-downloader">
    <p>Downloader is still wip</p>
    <h1>Test</h1>
    <h6>Video Formats</h6>
    <v-radio-group v-model="chosenVideoFormat">
      <v-radio v-for="format in viddata.video_formats" :key="format.format_id" :value="format.format_id" :label="`${format.dynamic_range?format.dynamic_range:'Audio'} ${format.format_note?format.format_note:'Audio'} ${format.ext} (Format ID: ${format.format_id}, ${$filters.formatFilesize(format.filesize || format.filesize_approx)}, resolution: ${format.resolution?format.resolution:'NA'})`" v-bind:title="`Video: ${format.vcodec} Audio ${format.acodec}`"></v-radio>
    </v-radio-group>
    <h6>Audio Formats</h6>
    <v-radio-group v-model="chosenAudioFormat">
      <v-radio v-for="format in viddata.audio_formats" :key="format.format_id" :value="format.format_id" :label="`${format.dynamic_range?format.dynamic_range:'Audio'} ${format.format_note?format.format_note:'Audio'} ${format.ext} (Format ID: ${format.format_id}, ${$filters.formatFilesize(format.filesize || format.filesize_approx)}, resolution: ${format.resolution?format.resolution:'NA'})`" v-bind:title="`Video: ${format.vcodec} Audio ${format.acodec}`"></v-radio>
    </v-radio-group>
    <p>
    Format Number {{ chosenVideoFormat }} + {{ chosenAudioFormat }}
    </p>
    <v-btn
      color="primary"
      @click="download"
      v-bind:disabled="task && true"
    >Download</v-btn>
    <h6 v-if="task">Progress (may bounce back for both audio AND video download. )</h6>
    <p v-if="task">
      Status <span>{{ task.status }}</span> <span v-if="task.timemark">{{ task.timemark }}</span>
    </p>
    <v-progress-linear v-if="task && task.downloadedDecimal" v-model="downloadedPercent"></v-progress-linear>
    <v-progress-linear v-if="task && task.processedDecimal" v-model="processedPercent"></v-progress-linear>
    <h6 v-if="downloadingChunks">Downloading splits from server</h6>
    <p v-if="downloadingChunks">
      This is the final step, after this the video will be avalible to play offline. 
    </p>
    </div>
    
</template>

<script>

import {dfetch} from "../fetcher/data_fetcher";
import db from "../database/db";

export default {
  name: 'PlatformVideoDownload',

  data: () => {
    return {
      chosenVideoFormat: null,
      chosenAudioFormat: null,
      task: false,
      taskid: null,
      downloadedPercent: 0,
      processedPercent: 0,
      savedPercent: 0,
      downloadingChunks: false
    }
  },
  methods: {
    async download(){
      console.log("Downloading Video...");

      let formatIDs = [];
      if(this.chosenVideoFormat){
        formatIDs.push(this.chosenVideoFormat);
      }
      if(this.chosenAudioFormat){
        formatIDs.push(this.chosenAudioFormat);
      }
      try{
        let resp = await dfetch("/real_api/tasks/submit_task",{
          cache: "no-cache",
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "vid": this.viddata.id,
            "formatID": formatIDs.join("+")
          })
        },true);
        
        this.taskid = await resp.text();
        console.log("Task ID",this.taskid);
        this.startPollingTaskStatus();
      }catch(ex){
        alert("Error: " + ex);
      }
    
    },
    startPollingTaskStatus(){
      this.taskPollInterval = setInterval(async () => {
          try{
              this.task = await dfetch("/real_api/tasks/task_status/" + this.taskid,{
                cache: "no-cache",
                method: "GET"
              });
          }catch(err){
            return; // Make no change
          }
          this.downloadedPercent = this.task.downloadedDecimal * 100;
          this.processedPercent = this.task.processedDecimal * 100;
          if(this.task.status === "finished" || this.task.status == "error"){
            clearInterval(this.taskPollInterval);
           
            this.taskPollInterval = null;
            if(this.task.status == "error"){
              console.warn("Task Error",this.task.error);
              alert("Error: " + this.task.error);
              this.task = false;
              this.taskid = null;
            }else{
              this.saveToDatabase();
            }
          }
      }, 500);
    },
    async saveToDatabase(){
      // TODO: Parellel downloader
      this.downloadingChunks = true;
      let files = Array.from(this.task.segFileList);
      files.push(this.task.videoID + ".m3u8");
      let counter = 0;
      for(let filename of files){
        // TODO: Check offline and stop in case of physical movement instead of spam retrying
        let resp = await dfetch("/real_api/download/" + filename, {
          cache: "no-cache",
          method: "GET",
          refetchOnNetworkDie: true
        }, true);

        let blob = await resp.blob();

        await db.videoSegments.put({
          vid: this.task.videoID,
          time: Date.now(),
          data: blob,
          filename: filename
        });

        counter ++;
        this.savedPercent = (counter / files.length) * 100;
      }
      this.downloadingChunks = false;
      alert("Download Completed!");
    }
  },
  beforeDestroy(){
    console.log("Destroying downloader progress check if needed");
    if(this.taskPollInterval){
      clearInterval(this.taskPollInterval);
      this.taskPollInterval = null;
    }
  },
  props: ["viddata"]
}
</script>
