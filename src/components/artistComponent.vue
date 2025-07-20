<template>
    <div v-if="!info.name" style="display: flex; justify-content: center; align-items: center; height: 45vh;" >
        <img src="../assets/loading.gif" alt="">
    </div>
    <div v-else class="cont">
      <div style="width: 100%; display: flex;">
          <v-icon style="cursor: pointer;" color="#ffffff" @click="goBack()">mdi-arrow-left</v-icon>
      </div>
      <div style="border: 0px solid green; display: flex;">
        <div class="faded" style="width: 50%;">
          <img style="width: 100%; display: block;" :src="info.channelInfo?.snippet?.thumbnails && info.channelInfo?.snippet?.thumbnails.high.url" alt="">
        </div>
        <div style="width: 50%; margin-left: 5%;">
          <p style=" text-align: left; border: 0px solid white; font-size: 250%; font-weight: bold; color: white;">{{ info.name }}</p>
          <p style=" text-align: left; border: 1px solid #fc2c55; font-size: 100%; font-weight: 300; color: white; width: fit-content; padding: 1% 3%; border-radius: 20px; margin-bottom: 2%;">
            <v-icon color="#fff">mdi-account</v-icon>
          {{ info?.additionalInfo?.followers?.followersText}}</p>
          <p style=" text-align: left; border: 0px solid white; font-size: 100%; font-weight: 300; color: white;">
            <v-icon color="#fff">mdi-youtube</v-icon>
            {{ Number(info?.channelInfo?.statistics?.subscriberCount).toLocaleString() }} subscribers</p>
          <p style=" text-align: left; border: 0px solid white; font-size: 100%; font-weight: 300; color: white;">
            <v-icon color="#fff">mdi-chart-bar</v-icon>
            {{ Number(info?.channelInfo?.statistics?.viewCount).toLocaleString() }} views</p>
          <p v-if="fulldesc" style="color: white; font-size: small; text-align: left;  margin-top: 3%;">{{ info?.additionalInfo?.description}}</p>
          <p v-else style="color: white; font-size: small; text-align: left;  margin-top: 3%;">
            {{ info?.additionalInfo?.description?.substring(0, 200) }}...
          </p>
          <p style="color: #fc2c55; cursor: pointer; text-align: left; width: min-content;  font-size: small;" @click="fulldesc = !fulldesc">{{fulldesc? 'Less' : 'More'}}</p>
        </div>
      </div>
      <div style="border: 0px solid white;">
        <div>
          <div>
            <p style="text-align: left; color: white; font-weight: bold; font-size: larger; margin-top: 2%;">Top Songs</p>
          </div>
          <div>
            <div class="listItem" v-for="(track, index) in info.topSongs" :key="index" style="display: flex; align-items: center; border: 0px solid white; width: 100%; cursor: pointer;" @click="play(track)">
              <p style="color: white; font-weight: bold; margin-left: 1%;">{{ index+1 }}.</p>
                <div class="thumb_cont" style="border: 0px solid white;">
                    <div class="img-cont">
                        <img class="thumbnail" :src="track.thumbnails && track.thumbnails[0].url" alt="">
                    </div>
                </div>
                <div class="info" style="width: 70%; border: 0px solid pink; display: flex; align-items: center;">
                    <div style="text-align: left; max-width: 100%;">
                        <p :class="this.queueStore.queue[this.queueStore.isPlayingIndex]?.id == track.videoId ? 'highlight' : 'info'" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">{{track.name}}</p>
                        <p style="color: grey; font-size: small;">{{ track.album.name }}</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; justify-content: right; width: 15%;">
                    <MusicBar v-if="this.queueStore.queue[this.queueStore.isPlayingIndex]?.id == track.videoId && !this.queueStore.isLoading"></MusicBar>
                    <v-menu>
                        <template v-slot:activator="{ props }">
                            <v-btn
                                v-bind="props"
                                color="white"
                                icon="mdi-dots-vertical"
                                variant="text"
                            ></v-btn>
                        </template>
                        <v-list theme="dark">
                            <v-list-item
                            v-for="(item, index) in ['Add to queue', 'Play next']"
                            size="small"
                            :key="index"
                            :value="index"
                            theme="dark"
                            >
                            <v-list-item-title @click="menuFunction(item, track)">{{ item }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>

                </div>
            </div>
          </div>
        </div>

        <div>
          <div>
            <p style="text-align: left; color: white; font-weight: bold; font-size: larger; margin-top: 2%;">Featured on</p>
          </div>
          <div style="overflow-x: auto; overflow-y: hidden; scrollbar-width: none; width: 100%; display: flex; border: 0px solid white; gap: 10px; padding: 10px;">
            <div
              v-for="(track, index) in playlist"
              :key="index"
              style="flex: 0 0 auto; width: 10vw; aspect-ratio: 1 / 1;"
              @click="$router.push({name: 'playlist', params: {playlistId: track.playlistId}})"
            >
              <div style="position: relative; width: 100%; aspect-ratio: 1/1; overflow: hidden; border-radius: 15px; cursor: pointer;">
                <img
                  class="thumbnail"
                  :src="track.thumbnails && track.thumbnails[0].url"
                  alt=""
                  style="width: 100%; height: 100%; object-fit: cover;"
                >
              </div>
              <p class="ellipse" style="color: white; font-size: small; max-width: 10vw;">{{ (track.name).split("|")[0] }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import { useToast } from 'vue-toastification';
import { EventBus } from '@/eventBus';
import { useQueueStore } from '../stores/queue';
import MusicBar from './musicBar.vue';


export default {
  name: "atristComponent",
  computed: {
    artistId() {
      return this.$route.params.artistId;
    },
  },
  components: {
    MusicBar,
  },
  setup() {
    const queueStore = useQueueStore();
    return { queueStore };
  },
  data() {
    return {
      message: "This is a placeholder for the at12 component.",
      toast: useToast(),
      info: {},
      fulldesc: false,
      playlist: []
    };
  },
  methods: {
    getArtist(id){
      if (!id){
        return;
      }
        fetch(`https://api-dqfspola6q-uc.a.run.app/music/artist/${id}`).then(async (res) => {
            if (!res.ok) {
                this.toast.error("Failed to fetch artist data.");
            }
            this.info = await res.json();
            this,this.getPlaylist(this.info.name)
        }).catch(error => {
            console.error("Error fetching artist data:", error);
            this.toast.error("Failed to fetch artist data.");
            this.$router.replace('/home');
        });
    },
    getPlaylist(q){
      if (!q){
        return;
      }
        fetch(`https://api-dqfspola6q-uc.a.run.app/music/search/playlist?q=${q}`).then(async (res) => {
            if (!res.ok) {
                this.toast.error("Failed to fetch playlist.");
            }
            this.playlist = await res.json();
        }).catch(error => {
            console.error("Error fetching artist data:", error);
            this.toast.error("Failed to fetch playlist.");
            this.$router.replace('/home');
        });
    },
    play(track) {
      track.id = track.videoId;
      track.title = track.name;
      EventBus.emit('play_track', track);
    },
    goBack() {
      if(window.history.state && window.history.state.back){
          this.$router.back();
      } else{
          this.$router.push({ name: 'home' });
      }
    },
    menuFunction(item, track) {
        if (!track) return;
        if (!this.queueStore.queue.length){
            this.toast.warning(`Play a song first to ${item.toLowerCase()}`);
            return;
        }
        track.id = track.videoId; // Ensure track has an id for consistency
        track.title = track.name; // Ensure track has a title for consistency
        if (item === 'Add to queue') {
            this.queueStore.queue.push(track);
            this.toast.success('Added to queue');
        } else if (item === 'Play next') {
          let next = track;
            for (let i = this.queueStore.isPlayingIndex+1; i < this.queueStore.queue.length; i++) {
              let temp = this.queueStore.queue[i];
              this.queueStore.queue[i] = next;
              next = temp;
            }
            this.queueStore.queue.push(next);
            this.toast.success('Added to play next');
        }
    },
  },
  mounted() {
    this.getArtist(this.artistId);
  },
  watch: {
    artistId(newVal, oldVal) {
      if (newVal === oldVal) return;
      if(newVal) {
        this.info = {};
        this.getArtist(newVal);
      }
    }
  }
};
</script>

<style scoped>
.cont{
  border: 0px solid white;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  scrollbar-width: none;
}

.faded{
  mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent); -webkit-mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
}

.thumb_cont{
    width: 10%;
    height:10vh;
    border: 0px solid pink;
    display: flex;
    justify-content: center;
    align-items: center;
}

.img-cont {
    height: 50px;
    width: 50px;
    overflow: hidden;
    position: relative;
    border-radius: 5px;
    margin-left: 10%;
}

.thumbnail{
  position: absolute; /* Position the image absolutely */
  top: 50%; /* Align the image to the vertical center */
  left: 50%; /* Align the image to the horizontal center */
  transform: translate(-50%, -50%); /* Center the image properly */
  height: 135%; /* Set the height to fill the div */
  width: 100%; /* Set the width to fill the div */
  object-fit: contain;
  display: block;
}

.listItem:hover {
  background-color: #d3d3d317;
}

.highlight {
    color: #fc2c55;
}

.info{
    color : white;
}

.ellipse {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    font-size:70%;
    color: rgba(255, 255, 255, 0.678);
    width: 10vw;
    text-align: center;
    margin: auto;
    border: 0px solid white;
}
</style>