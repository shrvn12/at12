<template>
    <div class="cont">
        <transition name="fade" mode="out-in">
        <div v-if="homePlayList && Object.keys(homePlayList).length" style="border: 0px solid white;">
           <div style="border: 0px solid yellow; overflow: hidden; position: relative; border-radius: 0px 0px 15px 15px;">
                <img :src="homePlayList?.metaData?.items[0]?.snippet?.thumbnails?.maxres?.url"
                    style="width: 100%; display: block; margin: auto;">

                <!-- Netflix-style overlay on left side only -->
               <div
                    style="position: absolute; bottom: 0; right: 0; width: 50%; background: linear-gradient(to left, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.5) 60%, transparent 100%); padding: 4vh 3vw; display: flex; flex-direction: column; justify-content: flex-end; height: 100%; align-items: flex-end;">
                    <!-- Song Title and Artist -->
                    <div style="margin-bottom: 2vh;" v-if="heroSongInfo.title">
                        <h1
                            style="color: white; font-size: 2.5rem; font-weight: bold; margin: 0 0 0.5rem 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); line-height: 1.2; text-align: right;">
                            {{ heroSongInfo.title }}
                        </h1>
                        <p v-if="heroSongInfo.artists"
                            style="text-align: right; color: #e5e5e5; font-size: 1.1rem; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                            {{ heroSongInfo.artists[0]?.name ||
                                homePlayList?.items?.items[0]?.snippet?.videoOwnerChannelTitle || 'Artist Name' }}
                        </p>
                    </div>

                    <!-- Play Button -->
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <button
                            @click="play(homePlayList.items.items[0].snippet.resourceId.videoId, homePlayList.items.items[0].snippet.title, homePlayList.items.items[0].snippet)"
                            style="border: 0px; background-color: white; border-radius: 5px; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.8rem 2rem; cursor: pointer; transition: background-color 0.2s;"
                            @mouseenter="$event.target.style.backgroundColor = '#e5e5e5'"
                            @mouseleave="$event.target.style.backgroundColor = 'white'">
                            <v-icon color="black" size="24">mdi-play</v-icon>
                            <span style="font-weight: bold; color: black; font-size: 1.1rem;">Play</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <v-skeleton-loader v-else type="card" color="#9A9A9A" height="90%"></v-skeleton-loader>
        </transition>

        <transition name="fade" mode="out-in">
        <div v-if="homePlayList && Object.keys(homePlayList).length" style="border: 0px solid white; margin-top: 1vh;">
            <p style="font-weight: bold; color: white; width: fit-content; font-size: xx-large;">Top Songs India</p>
            <div
            class="scroll-wrapper"
            @mouseenter="showArrows = true"
            @mouseleave="showArrows = false"
            >
            <!-- ⬅️ Left Arrow -->
            <v-icon
                v-if="showArrows"
                class="arrow left"
                @click="scrollLeft('scroller')"
            >
                mdi-chevron-left
            </v-icon>

            <!-- ▶️ Scroll Container -->
            <div ref="scroller" class="scroll-container">
                <div
                v-for="(item, index) in homePlayList?.items?.items"
                :key="item?.id"
                :class="{'card': true, 'saturate': cardHoverIndex == index}"
                @mouseenter="cardHoverIndex = index"
                @mouseleave="cardHoverIndex = null"
                >
                <img
                    :src="item?.snippet?.thumbnails?.maxres?.url"
                    draggable="false"
                />
                <div v-if="cardHoverIndex == index" style="width: 100%; position: absolute; border: 0px solid white; bottom: 0; background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 1) 80%);">
                    <div style="border: 0px solid white; width: 95%; margin: auto; margin-bottom: 1vh; display: flex; justify-content: right;">
                        <button @click="play(item?.snippet?.resourceId?.videoId, item?.snippet?.title, item?.snippet)" style="width: 25%; border: 0px; background-color: white; border-radius: 5px; display: flex; align-items: center; justify-content: center; height: 4vh; cursor: pointer;">
                            <v-icon color="black" size="small">mdi-play-outline</v-icon>
                            <p style="font-size: small; color: black;">Play</p>
                        </button>
                    </div>
                    <p style="font-size: small; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: white;">{{ item?.snippet?.title }}</p>
                </div>
                </div>
            </div>

            <!-- ➡️ Right Arrow -->
            <v-icon
                v-if="showArrows"
                class="arrow right"
                @click="scrollRight('scroller')"
            >
                mdi-chevron-right
            </v-icon>
            </div>
        </div>
        </transition>
        <br>
        <br>
    </div>
</template>
<script>
import { useToast } from 'vue-toastification';
import { useQueueStore } from '../stores/queue';
import { EventBus } from '../eventBus';
import { computed } from 'vue';

export default {
    name: "homeComponent",
    setup() {
        const queueStore = useQueueStore();
        const user = computed(() => queueStore.userData);
        return {queueStore, user};
    },
    data(){
        return{
            toast: useToast(),
            genres: ['Romance', 'Workout', 'Feel good', 'Party', 'Relax', 'Energize', 'commute', 'sleep', 'sad', 'Focus'],
            selectedGenre: '',
            songs: [],
            isLoading: false,
            loadingUserInfo: false,
            hoveredIndex: null,
            homePlayList: {},
            heroSongInfo: {},
            showArrows: false,
            showArrowsAlbum: false,
            cardHoverIndex: null,
            bollywood: [],
        }
    },
    beforeMount(){
        this.fetchPlaylist().then(() => {
            EventBus.emit('update-background', this.homePlayList?.metaData?.items[0]?.snippet?.thumbnails?.maxres?.url);
        });
    },
    methods:{
        greetUser(){
            const hour = new Date().getHours();
            if(hour < 12){
                return `Good morning ${this.queueStore.userData.name.split(" ")[0]}`;
            } else if(hour < 18){
                return `Good afternoon ${this.queueStore.userData.name.split(" ")[0]}`;
            } else {
                return `Good evening ${this.queueStore.userData.name.split(" ")[0]}`;
            }
        },
        async fetchPlaylist(){
            try {
                const res = await fetch(`https://api-dqfspola6q-uc.a.run.app/music/playlist/PL4fGSI1pDJn5RgLW0Sb_zECecWdH_4zOX`);
                const data = await res.json();
                this.homePlayList = data;
                const firstSongInfo = await fetch(`https://api-dqfspola6q-uc.a.run.app/music/info?id=${data.items.items[0].snippet.resourceId.videoId}`);
                const firstSongData = await firstSongInfo.json();
                console.log(firstSongData);
                this.heroSongInfo = firstSongData;
            } catch (error) {
                console.error(error);
                this.toast.error('Error fetching playlist');
            }
        },
        async searchPlaylist(query){
            this.isLoading = true;
            try {
                const res = await fetch(`https://api-dqfspola6q-uc.a.run.app/music/search/playlist?q=${query}`);
                const data = await res.json();
                this.isLoading = false;
                return data;
            } catch (error) {
                console.error(error);
                this.isLoading = false;
                this.toast.error('Error fetching playlist');
                return null;
            }
        },
        searchGenreSong(query){
            if (!query || !query.length) {
                query = 'trending in';
            }
            this.isLoading = true;
            fetch(`https://api-dqfspola6q-uc.a.run.app/music/getQueue?query=${query} india`).then(
                async(res) => {
                    this.isLoading = false;
                    res = await res.json();
                    this.songs = res;
                    // console.log(this.songs);
                }
            )
            .catch((err) => {
                console.log(err);
                this.isLoading = false;
                this.toast.error('Something went wrong while getting results')
            });
        },
        play(id, title, snippet){
            if(this.queueStore.queue[this.queueStore.isPlayingIndex]?.id !== id){
                EventBus.emit('play_track', {id, title, snippet});
            }
        },
        togglePlayPause(track){
            if(!this.queueStore.queue.length || this.queueStore.queue[this.queueStore.isPlayingIndex]?.id !== track.id){
                EventBus.emit('play_track', track);
                return;
            }
            if(this.queueStore.isPlaying){
                EventBus.emit('pause');
            } else {
                EventBus.emit('play');
            }
        },
        scrollLeft(scrollerRef){
            this.$refs[scrollerRef].scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        },
        scrollRight(scrollerRef) {
            this.$refs[scrollerRef].scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        }
    },
    mounted(){
        this.searchGenreSong(this.selectedGenre);
        this.searchPlaylist('bollywood').then((res) => {
            if(res){
                res = res.filter(item => item?.thumbnails[1]?.width == item?.thumbnails[1]?.height);
                this.bollywood = res;
            }
        });
    },
    watch: {
        selectedGenre(newVal) {
            this.searchGenreSong(newVal);
        },
    },
}
</script>

<style scoped>
.cont{
    border: 0px solid red;
    height: 100%;
    width: 100%;
    overflow-y: auto;
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 15%);
    -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 15%);
    scrollbar-width: none;      /* hides scrollbar */
    scrollbar-color: transparent transparent;
}

.cont::-webkit-scrollbar {
    height: 0px;
    width: 0px;
    display: none;
}

::-webkit-scrollbar-thumb {
  background: transparent;
  display: none;
}

button{
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
}

button:hover{
    opacity: 0.8;
}

.scroll-wrapper {
  position: relative;
}

.scroll-container {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 0.5rem 0;
}

.scroll-container::-webkit-scrollbar {
  display: none;
}

.card {
  flex: 0 0 auto;
  width: min(70vw, 220px);
  scroll-snap-align: start;
  /* filter: saturate(0.2); */
  cursor: pointer;
  position: relative;
}

.playlistCard {
  flex: 0 0 auto;
  width: min(70vw, 220px);
  scroll-snap-align: start;
  filter: saturate(0.2);
  cursor: pointer;
  position: relative;
}

.playlistCard:hover {
  filter: saturate(1);
  transition: filter 0.2s ease;
}

.playlistCard img {
  width: 100%;
  display: block;
  pointer-events: none;
}

.card img {
  width: 100%;
  display: block;
  pointer-events: none;
}

/* Arrows */
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  padding: 6px;
  cursor: pointer;
  z-index: 10;
  transition: opacity 0.2s ease;
}

.arrow.left {
  left: 5px;
}

.arrow.right {
  right: 5px;
}

.arrow:hover {
  background: rgba(0, 0, 0, 0.85);
}


.thumbnail{
  position: absolute; /* Position the image absolutely */
  top: 50%; /* Align the image to the vertical center */
  left: 50%; /* Align the image to the horizontal center */
  transform: translate(-50%, -50%); /* Center the image properly */
  height: 135%; /* Set the height to fill the div */
  width: 180%; /* Set the width to fill the div */
  object-fit: cover;
  z-index: 1;
}

.fadeGradient{
    mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 20%);
  -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 20%);
}

.saturate{
    filter: saturate(1);
    transition: filter 0.1s ease;
}

.ellipse {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    font-size:70%;
    color: rgba(255, 255, 255, 0.678);
    width: 7vw;
    text-align: center;
    margin: auto;
    border: 0px solid white;
}

.hplay{
    position: absolute;
    height: 5vh;
    width: 5vh;
    right: 0;
    bottom: 0;
    margin-bottom: 3%;
    margin-right: 3%;
    z-index: 1;
}

.hplay:hover{
    transform: scale(1.1);
    transition: all 0.05s;
}

.hbtn:hover{
    background-color: black !important;
}

.fadeFaster-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fadeFaster-leave-to, .fade-enter-from {
  opacity: 0;
}
.fadeFaster-enter-to, .fade-leave-from {
  opacity: 1;
}

.withplayer {
    height: 35vh;
}

.withoutplayer {
    height: 45vh;
}

@media (max-width: 675px) {
    .cont>div:nth-child(2){
        grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
        padding: 2%;
        gap: 3vw;
    }
    .cont>div:nth-child(1)>div{
        padding: 0.3vw 1.3vw;
    }
    .cont>div:nth-child(1){
        height: auto;
    }
    ::-webkit-scrollbar {
        height: 4px;
    }
    .withoutplayer {
        height: 70vh;
    }
    .withplayer {
        height: 60vh;
    }
    .ellipse{
        width: 15vw;
    }
}
</style>