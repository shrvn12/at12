<template>
<div id="cont">
    <div style=" width: 100%; height: 10%; display: flex;">
        <v-icon style="cursor: pointer;" color="#ffffff" @click="goBack()">mdi-arrow-left</v-icon>
    </div>
    <div style="border: 0px solid white; width: 100%; margin-top: 5%; display: flex; align-items: start;">
        <div style="width: 25%; border: 0px solid white; display: flex; align-items: center; justify-content: right;">
            <div style="margin-right: 3%; position: relative; overflow: hidden; height: 150px; width: 150px; border: 0px solid white; border-radius: 15px;">
              <transition name="fade" mode="out-in">
                <v-skeleton-loader v-if="isLoading || !info?.thumbnails?.standard?.url" color="#80808027" type="card"></v-skeleton-loader>
                <img v-else class="thumbnail" :src="info?.thumbnails?.standard?.url" alt="">
              </transition>
            </div>
        </div>
        <div style="width: 50%; border: 0px solid white; height: 100%; ">
          <transition name="fade" mode="out-in">
              <v-skeleton-loader  v-if="isLoading || !info?.title" style="width: 50%" height="150px" color="#80808027" type="article"></v-skeleton-loader>
              <div v-else class="info">
                  <p v-if="info.title" style="width: 25vw; font-weight: bold; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ info?.title}}</p>
                  <p v-if="info.artist" style="color: #ffffff; font-size: small;">{{info?.artist}}</p>
                  <p v-if="info?.stats?.viewCount" style="font-size: small"><v-icon color="#fff" size="small">mdi-calendar-outline</v-icon> {{ new Date(info?.publishedAt).toLocaleDateString() }}</p>
                  <p v-if="info?.stats?.likeCount" style="font-size: small"><v-icon color="#fff" size="small">mdi-heart-multiple</v-icon> {{ formatNumber(info?.stats?.likeCount) }}</p>
                  <p v-if="info?.stats?.viewCount" style="font-size: small"><v-icon color="#fff" size="small">mdi-eye</v-icon> {{ formatNumber(info?.stats?.viewCount) }}</p>
              </div>            
          </transition>
        </div>
    </div>
</div>
</template>
<script>
import { useToast } from 'vue-toastification';
import { useQueueStore } from '../stores/queue';
import { EventBus } from '../eventBus';


export default {
  name: "nowPlaying",
  data() {
    return {
      toast: useToast(),
      info:{},
      isLoading: false,
    }
  },
  computed: {
    queue() {
        return useQueueStore().queue;
    },
    isPlayingIndex(){
        return useQueueStore().isPlayingIndex;
    },
    isPlaying(){
        return useQueueStore().isPlaying;
    },
    videoId() {
        return this.$route.params.videoId;
    },
  },
  setup() {
  },
  methods: {
    async loadInfo(id){
       if (this.info.id == id) {
          return this.info;
        }
      this.isLoading = true;
        if (!id) {
          this.isLoading = false;
            return;
        }
        return fetch(`https://api-dqfspola6q-uc.a.run.app/music/getInfo?id=${id}`).then(async (res) => {
          res = await res.json();
          if (this.info.id != res.id) {
            this.info = res;
          }
          // this.queue[this.isPlayingIndex ||] = res;
          this.isLoading = false;
          return res;
        }).catch((err) => {
            this.isLoading = false;
            console.log(err);
            this.toast.error('Something went wrong while getting the track')
        })
    },
    formatNumber(num) {
      if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
      } else if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
      } else if (num >= 1_000) {
        return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
      } else {
        return num.toString();
      }
    },
    goBack() {
        if(window.history.state && window.history.state.back){
            this.$router.back();
        } else{
            this.$router.push({ name: 'home' });
        }
    },
  },
  mounted() {
    if (this.videoId){
        this.loadInfo(this.videoId).then((info) => {
          if (!this.queue.length){
            EventBus.emit('play_track', info);
          }
        }).catch((err) => {
            console.log(err);
            this.toast.error('Something went wrong while getting the track')
        });
    } else {
        this.toast.error('Track not found');
        this.$router.push({ name: 'home' });
    }
  },
  watch: {
    videoId(newVal) {
      if (newVal) {
        this.loadInfo(newVal).then((info) => {
          console.log(this.videoId, this.queue[this.isPlayingIndex], this.isPlayingIndex);
          if (this.videoId !== this.queue[this.isPlayingIndex]?.id) {
            EventBus.emit('play_track', info);
          }
          }).catch((err) => {
              console.log(err);
              this.toast.error('Something went wrong while getting the track')
          });
        }
    },
  },
};
</script>

<style scoped>
#cont{
    width: 100%;
    height: 43vh;
    border: 0px solid white;
}

.thumbnail{
  position: absolute; /* Position the image absolutely */
  top: 50%; /* Align the image to the vertical center */
  left: 50%; /* Align the image to the horizontal center */
  transform: translate(-50%, -50%); /* Center the image properly */
  height: 135%; /* Set the height to fill the div */
  width: 100%; /* Set the width to fill the div */
  object-fit: cover;
  z-index: 1;
}

.info {
    color: white;
    margin-left: 1%;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: right;
    text-align: left;
}
</style>