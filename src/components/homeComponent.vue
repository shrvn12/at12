<template>
    <div class="cont">
        <transition name="fade" mode="out-in">
        <div v-if="homePlayList && Object.keys(homePlayList).length" class="hero-section">
           <div class="hero-image-container">
                <img :src="homePlayList?.metaData?.items[0]?.snippet?.thumbnails?.maxres?.url"
                    class="hero-image">

                <!-- Netflix-style overlay on left side only -->
               <div class="hero-overlay">
                    <!-- Song Title and Artist -->
                    <div class="hero-content" v-if="heroSongInfo.title">
                        <h1 class="hero-title">
                            {{ heroSongInfo.title }}
                        </h1>
                        <p v-if="heroSongInfo.artists" class="hero-artist">
                            {{ heroSongInfo.artists[0]?.name ||
                                homePlayList?.items?.items[0]?.snippet?.videoOwnerChannelTitle || 'Artist Name' }}
                        </p>
                    </div>

                    <!-- Play Button -->
                    <div class="hero-buttons">
                        <button
                            @click="play(homePlayList.items.items[0].snippet.resourceId.videoId, homePlayList.items.items[0].snippet.title, homePlayList.items.items[0].snippet)"
                            class="play-button"
                            @mouseenter="$event.target.style.backgroundColor = '#e5e5e5'"
                            @mouseleave="$event.target.style.backgroundColor = 'white'">
                            <v-icon color="black" size="24">mdi-play</v-icon>
                            <span class="play-text">Play</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <v-skeleton-loader v-else type="card" color="#9A9A9A" height="90%"></v-skeleton-loader>
        </transition>

        <transition name="fade" mode="out-in">
        <div v-if="homePlayList && Object.keys(homePlayList).length" class="playlist-section">
            <p class="playlist-title">Top Songs India</p>
            <div
            class="scroll-wrapper"
            @mouseenter="showArrows = true"
            @mouseleave="showArrows = false"
            >
            <!-- Left Arrow -->
            <v-icon
                v-if="showArrows"
                class="arrow left"
                @click="scrollLeft('scroller')"
            >
                mdi-chevron-left
            </v-icon>

            <!-- Scroll Container -->
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
                <div v-if="cardHoverIndex == index" class="card-overlay">
                    <div class="card-button-container">
                        <button @click="play(item?.snippet?.resourceId?.videoId, item?.snippet?.title, item?.snippet)" class="card-play-button">
                            <v-icon color="black" size="small">mdi-play-outline</v-icon>
                            <p class="card-play-text">Play</p>
                        </button>
                    </div>
                    <p class="card-title">{{ item?.snippet?.title }}</p>
                </div>
                </div>
            </div>

            <!-- Right Arrow -->
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
.cont {
    height: 100%;
    width: 100%;
    overflow-y: auto;
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 15%);
    -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 15%);
    scrollbar-width: none;
    scrollbar-color: transparent transparent;
}

.cont::-webkit-scrollbar {
    display: none;
}

/* Hero Section */
.hero-section {
    overflow: hidden;
    position: relative;
    border-radius: 0 0 15px 15px;
}

.hero-image-container {
    position: relative;
}

.hero-image {
    width: 100%;
    display: block;
    margin: auto;
}

.hero-overlay {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 50%;
    background: linear-gradient(to left, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.5) 60%, transparent 100%);
    padding: 4vh 3vw;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    height: 100%;
    align-items: flex-end;
}

.hero-content {
    margin-bottom: 2vh;
}

.hero-title {
    color: white;
    font-size: 2.5rem;
    font-weight: bold;
    margin: 0 0 0.5rem 0;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    line-height: 1.2;
    text-align: right;
}

.hero-artist {
    text-align: right;
    color: #e5e5e5;
    font-size: 1.1rem;
    margin: 0;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}

.hero-buttons {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.play-button {
    border: 0;
    background-color: white;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.8rem 2rem;
    cursor: pointer;
    transition: background-color 0.2s;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
}

.play-button:hover {
    opacity: 0.8;
}

.play-text {
    font-weight: bold;
    color: black;
    font-size: 1.1rem;
}

/* Playlist Section */
.playlist-section {
    margin-top: 1vh;
}

.playlist-title {
    font-weight: bold;
    color: white;
    width: fit-content;
    font-size: xx-large;
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
    scrollbar-width: none;
}

.scroll-container::-webkit-scrollbar {
    display: none;
}

.card {
    flex: 0 0 auto;
    width: min(70vw, 220px);
    scroll-snap-align: start;
    cursor: pointer;
    position: relative;
}

.card img {
    width: 100%;
    display: block;
    pointer-events: none;
}

.card-overlay {
    width: 100%;
    position: absolute;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 1) 80%);
}

.card-button-container {
    width: 95%;
    margin: auto;
    margin-bottom: 1vh;
    display: flex;
    justify-content: right;
}

.card-play-button {
    width: 25%;
    min-width: 60px;
    border: 0;
    background-color: white;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 4vh;
    min-height: 30px;
    cursor: pointer;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
}

.card-play-button:hover {
    opacity: 0.8;
}

.card-play-text {
    font-size: small;
    color: black;
    margin: 0;
}

.card-title {
    font-size: small;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: white;
    padding: 0 0.5rem 0.5rem;
    margin: 0;
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

.saturate {
    filter: saturate(1);
    transition: filter 0.1s ease;
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-leave-to, .fade-enter-from {
    opacity: 0;
}

.fade-enter-to, .fade-leave-from {
    opacity: 1;
}

/* Tablet (768px and below) */
@media only screen and (max-width: 768px) {
    .hero-overlay {
        width: 60%;
        padding: 3vh 4vw;
    }

    .hero-title {
        font-size: 2rem;
    }

    .hero-artist {
        font-size: 1rem;
    }

    .play-button {
        padding: 0.7rem 1.5rem;
    }

    .play-text {
        font-size: 1rem;
    }

    .playlist-title {
        font-size: x-large;
    }

    .card {
        width: min(60vw, 200px);
    }
}

/* Mobile (480px and below) */
@media only screen and (max-width: 480px) {
    .hero-overlay {
        width: 100%;
        background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%);
        padding: 2vh 5vw;
        align-items: center;
        height: auto;
        bottom: 0;
    }

    .hero-content {
        margin-bottom: 1.5vh;
        width: 100%;
    }

    .hero-title {
        font-size: 1.5rem;
        text-align: center;
    }

    .hero-artist {
        font-size: 0.9rem;
        text-align: center;
    }

    .hero-buttons {
        width: 100%;
        justify-content: center;
    }

    .play-button {
        padding: 0.6rem 1.2rem;
        width: auto;
    }

    .play-text {
        font-size: 0.9rem;
    }

    .playlist-title {
        font-size: large;
        padding: 0 0.5rem;
    }

    .card {
        width: min(50vw, 150px);
    }

    .card-play-button {
        width: 35%;
        min-width: 50px;
    }

    .card-play-text {
        font-size: x-small;
    }

    .arrow {
        padding: 4px;
    }

    .arrow.left {
        left: 2px;
    }

    .arrow.right {
        right: 2px;
    }
}

/* Small Mobile (360px and below) */
@media only screen and (max-width: 360px) {
    .hero-title {
        font-size: 1.2rem;
    }

    .hero-artist {
        font-size: 0.8rem;
    }

    .play-button {
        padding: 0.5rem 1rem;
    }

    .play-text {
        font-size: 0.85rem;
    }

    .playlist-title {
        font-size: medium;
    }

    .card {
        width: min(45vw, 130px);
    }
}

/* Landscape Mobile */
@media only screen and (max-height: 500px) and (orientation: landscape) {
    .hero-overlay {
        padding: 2vh 3vw;
    }

    .hero-title {
        font-size: 1.3rem;
    }

    .hero-artist {
        font-size: 0.85rem;
    }

    .hero-content {
        margin-bottom: 1vh;
    }

    .play-button {
        padding: 0.5rem 1rem;
    }
}
</style>