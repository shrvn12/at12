<template>
    <div class="cont">
      <div style="width: 100%; display: flex;">
          <v-icon style="cursor: pointer;" color="#ffffff" @click="goBack()">mdi-arrow-left</v-icon>
      </div>
      <div v-if="loading" style="display: flex; justify-content: center; align-items: center; min-height: 52vh; margin-top: 2vh;" >
        <v-skeleton-loader color="#9a9a9a25" type="table-heading, article, article" width="100%" height="100%"></v-skeleton-loader>
    </div>
      <div v-else>
        <h1 style="color: white;">{{ tagline[genre] }}</h1>
        <div style="display: flex; flex-wrap: wrap; justify-content: space-evenly;">
          <div class="glass" v-for="(song) in songs" :key="song.videoId" style="width: 47%; height: 8vh; border: 1px solid transparent; display: flex; margin-top: 2vh; border-radius: 7px; overflow: hidden; justify-content: left; align-items: center; cursor: pointer;" @click="play(song)">
            <img loading="lazy" :src="song?.thumbnails[0]?.url" style="height: 100%; aspect-ratio: 1/1;" alt="">
            <div style="width: 68%; margin-left: 3%; border: 0px solid red;">
              <p :class="(this.queue.queue[this.queue.isPlayingIndex]?.id == song.videoId && !this.queueStore.isLoading) ? 'nowPlaying' : 'white'" style="overflow: hidden; text-overflow: ellipsis; width: 100%; font-size: small; text-align: left; text-transform: capitalize; white-space: nowrap; font-weight: bold;">{{ song.name?.length<40? song.name?.toLowerCase() : song.name?.substring(0,40)?.toLowerCase()+'...' }}</p>
              <p style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden; width: 100%; font-size: x-small; color: #ffffff97; text-align: left; text-transform: capitalize;">{{ song.type?.toUpperCase() + ' • ' +song.artist?.name?.toLowerCase() }}</p>
            </div>
            <div style="height: 5vh; padding-top: 4%;">
                <MusicBar v-if="this.queue.queue[this.queue.isPlayingIndex]?.id == song.videoId && !this.queueStore.isLoading"></MusicBar>
            </div>
          </div>
        </div>

        <h1 style="color: white; margin-top: 4%;">Playlists</h1>
          <div style="display: flex; flex-wrap: wrap; justify-content: space-evenly;">
          <div class="glass" v-for="(list) in playlists" :key="list.playlistId" style="width: 30%; min-height: 8vh; border: 1px solid transparent; display: block; margin-top: 2vh; border-radius: 7px; overflow: hidden; justify-content: left; align-items: center; cursor: pointer;">
            <img loading="lazy" :src="list?.thumbnails[2]?.url" style="width: 100%; aspect-ratio: 1/1;" alt="">
            <div style="width: 80%; margin-left: 3%">
              <p style="overflow: hidden; text-overflow: ellipsis; width: 80%; font-size: small; color: white; text-align: left; text-transform: capitalize;">{{ list.name?.length<30? list.name?.toLowerCase() : list.name.split("|")[0]?.substring(0,30)?.toLowerCase()+'...' }}</p>
              <p style="font-size: x-small; color: #ffffff97; text-align: left; text-transform: capitalize;">{{ list.type?.toUpperCase() + ' • ' + list.artist?.name?.toLowerCase() }}</p>
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
  name: "genrePage",
  setup() {
    const queueStore = useQueueStore();
    return { queueStore };
  },
  computed: {
    genre (){
      return this.$route.params.genre;
    },
    queue() {
      return useQueueStore();
    },
  },
  components: {
    MusicBar,
  },
  data() {
    return {
      toast: useToast(),
      prodUrl: process.env.VUE_APP_PROD_URL,
      loading: false,
      tagline: {
        Romance: 'Feel the Love',
        Commute: 'On the Move',
        Sleep: 'Drift Away',
        'Work-out': 'Push Hard',
        Focus: 'Stay Locked In',
        Party: 'Turn It Up',
        Energise: 'Power Up',
        Sad: 'In Your Feels',
        'Feel-good': 'Good Vibes',
        Relax: 'Unwind'
      },
      songs: [],
      playlists: []
    };
  },
  methods: {
    goBack() {
      if(window.history.state && window.history.state.back){
          this.$router.back();
      } else{
          this.$router.push({ name: 'home' });
      }
    },

    getSongs(){
      this.loading = true;
      fetch(`${this.prodUrl}/music/g/${this.genre}`).then(async (res) => {
        this.loading = false;
        res = await res.json();
        this.songs = res.songs || [];
        this.playlists = res.playlists.slice(0,18) || [];
      }).catch((err) => {
        this.loading = false;
        console.log(err);
      })
    },

    play(track){
      track.id = track.videoId; // Ensure track has an id for consistency
      track.title = track.name; // Ensure track has a title for consistency
      this.queue.emptyQueue();
      this.queue.play();
      this.queue.isPlayingIndex = 0;
      EventBus.emit('play_track', track);
    },
  },
  mounted() {
    this.getSongs()
  },
  watch: {
    genre() {
      this.getSongs()
    }
  }
};
</script>

<style scoped>
  .cont{
    /* border: 1px solid white; */
    overflow-y: scroll;
    padding: 1%;
    height: 100%;
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 15%);
    -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 15%);
  }
  h1{
    text-align: left;
    /* color: #ffffff97; */
  }
  .nowPlaying {
    color: #fc2c55;
  }
  .white{
    color: white;
  }
</style>