<template>
<div id="cont">
    <div style="width: 100%; height: 10%; display: flex; margin-top: 1vh;">
        <v-icon style="cursor: pointer;" color="#ffffff" @click="goBack()">mdi-arrow-left</v-icon>
    </div>
    <div class="playerCont">
        <div class="imgcont">
            <div v-if="!showVideo" style="position: absolute; overflow: hidden; height: 100%; aspect-ratio: 1/1; left: 0; border: 0px solid white;">
              <transition name="fade" mode="out-in">
                <v-skeleton-loader v-if="isLoading || !info?.thumbnails?.standard?.url || !info.stats" color="#80808027" type="card"></v-skeleton-loader>
                <img v-else class="thumbnail" :src="info?.thumbnails?.standard?.url" alt="">
              </transition>
            </div>
        </div>
        <div class="infocont">
          <transition name="fade" mode="out-in">
              <v-skeleton-loader  v-if="isLoading || !info?.stats" style="width: 100%" height="90%" color="#80808027" type="article"></v-skeleton-loader>
              <div v-else class="info">
                  <p v-if="info.title" style="width: 25vw; font-weight: bold; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ info?.title}}</p>
                  <div v-for="(artist, index) in info.artist" :key="index">
                    <p v-if="info.artist" :class="artist.id ? 'underline' : ''" style="color: #ffffff; font-size: small;" @click=" artist.id && $router.push(`/artist/${artist.id}`)">{{artist?.name}}</p>
                  </div>
                  <transition name="fade" mode="out-in">
                    <p v-if="info?.stats?.viewCount" style="font-size: small"><v-icon color="#fff" size="small">mdi-calendar-outline</v-icon> {{ new Date(info?.publishedAt).toLocaleDateString() }}</p>
                  </transition>
                  <transition name="fade" mode="out-in">
                    <p v-if="info?.stats?.likeCount" style="font-size: small"><v-icon color="#fff" size="small">mdi-heart-multiple</v-icon> {{ formatNumber(info?.stats?.likeCount) }}</p>
                  </transition>
                  <transition name="fade" mode="out-in">
                    <p v-if="info?.stats?.viewCount" style="font-size: small"><v-icon color="#fff" size="small">mdi-eye</v-icon> {{ formatNumber(info?.stats?.viewCount) }}</p>
                  </transition>
                  <div style="position: absolute; bottom: 0; left: 0;">
                    <v-icon style="cursor: pointer;" color="#ffffff">{{'mdi-heart'}}</v-icon>

                    <v-icon v-if="info.isAudioOnly == false" :title="showVideo? 'Audio Only' : 'Video (if available)'" @click="showVideo = !showVideo" style="cursor: pointer;" color="#ffffff">{{ !showVideo? 'mdi-youtube-tv' : 'mdi-ipod'}}</v-icon>
                  </div>
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
import { useUserStore } from '../stores/user';


export default {
  name: "nowPlaying",
  data() {
    return {
      toast: useToast(),
      info:{},
      isLoading: false,
      player: document.getElementById('player'),
      showVideo: true,
      quality: {
        small: '144p',
        medium: '360p',
        large: '480p',
        hd720: '720p',
        hd1080: '1080p',
        highres: '2160p',
      }
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
    const queueStore = useQueueStore();
    const userStore = useUserStore();
    return { queueStore, userStore };
  },
  methods: {
    async loadInfo(id){
      const queueInfo = this.queue.find((item) => item.id === id) || {};
       if (this.info.id == this.videoId && this.info.stats) {
          return this.info;
        }
        if (this.info.id == this.videoId && queueInfo?.stats){
          this.info = queueInfo;
          return this.info;
        }
      this.isLoading = true;
        if (!id) {
          this.isLoading = false;
          return;
        }
        return fetch(`https://api-dqfspola6q-uc.a.run.app/music/getInfo?id=${id}`).then(async (res) => {
          res = await res.json();
          this.info = res;
          this.queueStore.addStats(this.isPlayingIndex ,res);
          this.isLoading = false;
          EventBus.emit('updateInfo', res);
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
  activated(){
    this.showVideo = !this.info.isAudioOnly;
    this.info = this.queue[this.isPlayingIndex] || {};
  },
  mounted() {
    if (this.videoId){
          if (!this.queue.length){
            EventBus.emit('play_track', { id: this.videoId});
          }
    } else {
        this.toast.error('Track not found');
        this.$router.push({ name: 'home' });
    }
    this.info = this.queue[this.isPlayingIndex] || {};
    this.showVideo = !this.info.isAudioOnly;
    EventBus.on('info', (info) => {
      if (info.id === this.videoId) {
        this.info = info;
        this.showVideo = !info.isAudioOnly;
      }
    });
  },
  watch: {
    videoId(newVal) {
      if (newVal) {
          if (this.info.id !== newVal) {
            this.info = {};
          }
          if (this.info.id !== newVal && this.queue[this.isPlayingIndex]?.id == newVal) {
            this.info = this.queue[this.isPlayingIndex]
          }
          if (this.videoId !== this.queue[this.isPlayingIndex]?.id) {
            EventBus.emit('play_track', { id: newVal});
          }
        }
    },
    showVideo(val){
      EventBus.emit('show_video', val);
    }
  },
};
</script>

<style scoped>
#cont{
    width: 100%;
    height: 43vh;
    border: 0px solid white;
    position: relative;
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
  height: 80%;
  position: relative;
  color: white;
  margin-left: 1%;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: right;
  text-align: left;
  border: 0px solid white;
}

.infocont{
  border: 0px solid white;
  height: 100%;
  width: 50%;
  overflow-y: auto;
  overflow-x: hidden;
}

.imgcont{
  width: 25%;
  height: 100%; 
}

.playerCont{
  border: 0px solid white;
  width: 100%;
  height: 100%;
  display: flex; 
  align-items: start;
  margin-top: 1%;
}

.playerCont>div:nth-child(1){
  width: 50%;
  border: 0px solid white;
  display: flex;
  justify-content: center;
}

.audioVideoToggle{
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
}

.underline{
  text-decoration: underline;
  cursor: pointer;
}

@media (max-width: 675px) {
  #cont{
      width: 100%;
      height: 60vh;
      border: 0px solid white;
      position: relative;
  }
  .playerCont{
    height: 40vh;
  }
  .playerCont>div:nth-child(1){
    width: 65%;
    height: 50%;
    display: flex;
    justify-content: center;
  }
  .playerCont>div:nth-child(2){
    width: 35%;
    height: 50%;
    overflow-x: auto;
    overflow-y: hidden;
  }
}
</style>