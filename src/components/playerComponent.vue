<template>
    <div id="cont">
        <div>
            <div id="player" style="height: 0px; width: 0px;"></div>
        </div>
        <div style="border: 0px solid green; width: 100%; height: min-content; margin-top: -5px;">
            <div style=" z-index: 1;cursor: pointer; border: 0px solid white; position: absolute; width: 100%; margin-top: -1%; height: min-content; display: flex; justify-content: space-between; align-items: center;" @click="() => { $router.push(`/playing/${queue[isPlayingIndex].id}`) }">
                <transition name="fade" mode="out-in">
                    <p v-if="this.$route.name !== 'nowPlaying'" class="ellipse">{{ queue.length? queue[isPlayingIndex]?.title : "" }}</p>
                </transition>
                    <p style="color: white; font-size: small; margin: 0px; text-align: right; margin-left: auto;">{{`${formatTime(currentTime)} / ${formatTime(duration)}`}}</p>
                </div>                

            <v-slider 
                style="margin:  2px !important; height: 22px;"
                v-model="currentTime"
                :max="duration"
                step="1"
                class="mt-4"
                color="#fc2c55"
                track-color="#fff"
                :thumb-size=playerThumb
                :thumb-label="false"
                track-size="2"
                persistent-hint
                @mouseover="() => { playerThumb = 12 }"
                @mouseleave="() => { playerThumb = 0 }"
                @update:modelValue="seek"
            ></v-slider>
        </div>
        <div style="border: 0px solid white; display: flex; justify-content: space-between; overflow: hidden; height: 6vh;">
            <v-btn @click="playPrev" icon :ripple="true" title="Previous" base-color="transparent">
                    <v-icon size="large" color="#fff">mdi-skip-previous-outline</v-icon>
            </v-btn>
            <v-btn base-color="transparent" icon :title="isPlaying ? 'Pause' : 'Play'" @click="togglePlayPause">
                <v-icon :color="'#fff'" size="large">{{ isPlaying ? 'mdi-pause-box-outline' : 'mdi-play-outline' }}</v-icon>
            </v-btn>
            <v-btn @click="playNext" icon :ripple="true" title="Next" base-color="transparent">
                <v-icon size="large" color="#fff">mdi-skip-next-outline</v-icon>
            </v-btn>
            <v-btn icon :ripple="true" title="repeat" base-color="transparent" @click="toggleRepeat">
                <v-icon v-if="repeat && !repeatOnce" size="default" color="#fff">mdi-repeat</v-icon>
                <v-icon v-if="repeatOnce && !repeat" size="default" color="#fff">mdi-repeat-once</v-icon>
                <v-icon v-if="!repeat && !repeatOnce" size="default" color="#fff">mdi-repeat-off</v-icon>
            </v-btn>
            <v-btn icon :ripple="!shuffleDisabled" title="shuffle" base-color="transparent" :style="{cursor: shuffleDisabled ? 'not-allowed' : 'pointer'}">
                <v-icon :disabled="shuffleDisabled" size="default" color="#fff">mdi-shuffle</v-icon>
            </v-btn>

            <div style="border: 0px solid; width: 12%; margin-top: 1vw;">
                <v-slider
                ref="volumeSlider"
                v-model="volume"
                :max="100"
                step="1"
                class="mt-4"
                color="#fc2c55"
                track-color="#fff"
                :thumb-label="false"
                track-size="2"
                :thumb-size=10
                @update:modelValue="handleVolumeChange"
                ></v-slider>
            </div>
            
            <v-btn @click="toggleQueue()" icon :ripple="true" title="repeat" base-color="transparent">
                    <v-icon size="default" color="#fff">{{queueStore.isQueueVisible? "mdi-list-box" : "mdi-list-box-outline"}}</v-icon>
            </v-btn>
            <v-btn icon :ripple="!lyricsDisabled" title="repeat" base-color="transparent" :style="{cursor: shuffleDisabled ? 'not-allowed' : 'pointer'}">
                    <v-icon @click="toggleLyrics()" :disabled="lyricsDisabled" size="default" color="#fff">{{ lyricsStore.isLyricsVisible? 'mdi-music-box' : 'mdi-music-box-outline'}}</v-icon>
            </v-btn>
        </div>
    </div>
</template>
<script>
  /*global YT*/
import { useQueueStore } from '../stores/queue';
import { EventBus } from '@/eventBus';
import { useToast } from 'vue-toastification';
import { useLyricsStore} from '../stores/lyrics';

export default {
    name: "PlayerComponent",
    computed: {
        queue() {
            return useQueueStore().queue;
        },
        isPlayingIndex(){
            return useQueueStore().isPlayingIndex;
        },
        isQueueVisible(){
            return useQueueStore().isQueueVisible;
        },
        route(){
            return this.$route.name;
        },
    },
    setup(){
        const queueStore = useQueueStore();
        const lyricsStore = useLyricsStore();
        return { queueStore, lyricsStore };
    },
    data: () => {
        return {
            toast: useToast(),
            currentTime: 0,
            isPlaying: false,
            playerThumb: 0,
            volThumb: 0,
            volLabel: false,
            mute: false,
            volume: 100,
            duration: 100,
            videoId: '',
            playBackTimer: null,
            lastKeyTime: 0,
            keyDelay: 500,
            // isQueueVisible: localStorage.getItem('queue') == 'false'? false : true,
            isLyricsVisible: false,
            volumeBar: false,
            playerLoading: false,
            repeat: false,
            repeatOnce: false,
            shuffleDisabled: true,
            lyricsDisabled: true,
            thumbTimeout: null,
        }
    },
    methods: {
        togglePlayPause() {
            if (!this.player) {
                return;
            }
            this.isPlaying ? this.player.pauseVideo() : this.player.playVideo();
            this.isPlaying = !this.isPlaying
            this.queueStore.isPaused = !this.isPlaying;
            this.queueStore.isPlaying = this.isPlaying;
        },
        toggleRepeat() {
            if (!this.repeat && !this.repeatOnce) {
                this.repeat = true;
                this.repeatOnce = false;
            } else if (this.repeat && !this.repeatOnce) {
                this.repeat = false;
                this.repeatOnce = true;
            } else {
                this.repeat = false;
                this.repeatOnce = false;
            }
        },
         toggleQueue() {
            this.queueStore.isQueueVisible = !this.queueStore.isQueueVisible;
        },
        handleVolumeChange(value) {
            if (this.player) {
                this.player.setVolume(value);
            }
        },
        async play(data) {
            if (!data || !data.id) {
                return;
            }
            this.videoId = data.id;
            !this.player? this.startPlayer(data.id) : this.player.loadVideoById(data.id);
        },
        seek() {
            this.player.seekTo(this.currentTime, true);
        },
        playNext() {
            if (this.repeat){
                this.player.seekTo(0, true);
                this.player.playVideo();
                return;
            }
            if (this.repeatOnce){
                this.player.seekTo(0, true);
                this.player.playVideo();
                this.repeatOnce = false;
                return;
            }
                const currentTime = new Date().getTime(); // Get the current timestamp
                if (currentTime - this.lastKeyTime < this.keyDelay) {
                    return;
                }
                this.lastKeyTime = currentTime;
                if ((this.queueStore.isPlayingIndex+1) >= this.queue.length) {
                    const lastItemId = this.queue[this.queue.length - 1]?.id;
                    if (lastItemId) {
                        return this.fetchQueue(lastItemId).then((data) => {
                            if (data.length) {
                                this.queueStore.queue = [...this.queueStore.queue, ...data.slice(1)];
                                this.queueStore.isPlayingIndex++;
                                this.play(this.queue[this.queueStore.isPlayingIndex]);
                                if (this.$router.currentRoute?._value?.name == 'nowPlaying') {
                                    this.$router.replace(`/playing/${this.queue[this.queueStore.isPlayingIndex].id}`);
                                }
                            }
                        });
                    }
                    this.queueStore.isPlayingIndex = 0; // Loop back to the first track
                } else{
                    this.queueStore.isPlayingIndex++;
                    if (this.$router.currentRoute?._value?.name == 'nowPlaying') {
                        this.$router.replace(`/playing/${this.queue[this.queueStore.isPlayingIndex].id}`);
                    }
                    this.play(this.queue[this.queueStore.isPlayingIndex]);
                }
        },
        playPrev() {
            const currentTime = new Date().getTime(); // Get the current timestamp
            if (currentTime - this.lastKeyTime < this.keyDelay) {
                return;
            }
            this.lastKeyTime = currentTime;
            this,this.queueStore.isPlayingIndex = Math.max(0, this.queueStore.isPlayingIndex - 1);
            this.play(this.queue[this.queueStore.isPlayingIndex]);
            this.$router.push(`/playing/${this.queue[this.queueStore.isPlayingIndex].id}`);
        },
        formatTime(seconds) {
            if (isNaN(seconds)) return '00:00';
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
            return `${minutes}:${secs}`;
        },
        onPlayerReady(){
            // this.queueStore.player(this.player);
            this.duration = this.player.getDuration();
            this.player.playVideo();
        },
        updateCurrentTime() {
            if (!this.isPlaying) {
                this.playBackTimer = null;
            }
            else if (this.player && this.player.getCurrentTime) {
                this.currentTime = this.player.getCurrentTime();
            }
        },
        onPlayerStateChange(event) {
            this.duration = this.player.getDuration();
            if (event.data !== YT.PlayerState.BUFFERING) {
                EventBus.emit('loading_0');
                this.playerLoading = false;
            }
            if (event.data === YT.PlayerState.PLAYING) {
                EventBus.emit('loading_0');
                this.playerLoading = false;
                if (!this.isPlaying) {
                    this.isPlaying = true;
                }
                this.playBackTimer = setInterval(() => this.updateCurrentTime(), 1000);
            }
            else {
                this.isPlaying = false;
            }
            if (event.data === YT.PlayerState.ENDED) {
                this.playNext();
            }
            if (event.data === YT.PlayerState.BUFFERING) {
                EventBus.emit('loading_1');
                this.playerLoading = true;
            }
        },
        startPlayer(videoId) {
            try {
                this.player = new YT.Player("player", {
                    height: "360",
                    width: "640",
                    videoId: videoId, // Replace with your YouTube video ID
                    playerVars: {
                        rel: 0, // Disable related videos
                        controls: 0, // Hide player controls
                        modestbranding: 1, // Minimize YouTube branding
                        disablekb: 1, // Disable keyboard controls
                        fs: 0, // Disable fullscreen option
                    },
                    events: {
                        onReady: this.onPlayerReady,
                        onStateChange: this.onPlayerStateChange,
                    },
                });
            } catch (error) {
                console.log('error while creating player');
                console.log(error);
            }
        },
        async fetchQueue(trackId) {
            return await fetch(`https://api-dqfspola6q-uc.a.run.app/music/getQueue?videoId=${trackId}`).then(
                async (res) => {
                    res = await res.json();
                    return res;
                }
            )
            .catch((err) => {
                console.log(err);
                this.toast.err('Something went wrong while adding to queue')
            });
        }
    },
    mounted() {
        document.addEventListener('keydown', this.handleKeyDown);
        EventBus.on('play_track', (track) => {
            this.play(track);
            this.queueStore.isPlayingIndex = 0;
            this.queueStore.queue = [track];
        });
        EventBus.on('onlyPlay', (track) => {
            this.play(track);
        });
        EventBus.on('playIndex', (index) => {
            if (this.queue[index]){
                console.log('eventbus plyerside', index, this.queue[index]);
                this.queueStore.isPlayingIndex = index;
                this.play(this.queue[index]);
            }
        })
        EventBus.on('deleteFromQueue', (index) => {
            this.queue.splice(index, 1);
        })
        if (!window.YT) {
            const script = document.createElement("script");
            script.src = "https://www.youtube.com/iframe_api";
            script.onload = () => {
            };
            document.head.appendChild(script);
        }
    },
    watch: {
        queue(val) {
            EventBus.emit('queue', val);
        },
        isPlaying(val) {
            EventBus.emit('isPlaying', val);
            val ? this.queueStore.isPlaying = true : this.queueStore.isPlaying = false;
        },
        isPlayingIndex(val) {
            EventBus.emit('isPlayingIndex', val);
            this.queueStore.isPlayingIndex = val;
        },
        mute(val) {
            localStorage.setItem('mute', val);
        },
    }
}
</script>

<style scoped>
html{
  overflow: hidden;
}
#cont {
    position: absolute;
    width: 50%;
    /* border: 1px solid #fff; */
    margin: auto;
    bottom: 0px;
    left: 0;
    right: 0;
    background-color: #010101;
    border: 0px solid red;
    height: 10vh;
}

#cont>div:nth-child(1){
    width: 0px !important;
    height: 0px !important;
}

/* #cont>div:nth-child(1),
#cont>div:nth-child(3) {
    width: 40%;
    display: flex;
    align-items: center;
    justify-content: right;
} */

#cont>div:nth-child(2) {
    width: 60%;
}

.buttons {
    width: 25%;
    margin: 0px auto 0px auto;
    display: flex;
    justify-content: space-evenly
}

.mt-4,
.ml-2 {
    color: #fff
}

#cont>div:nth-child(3)>div {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
}

#cont>div:nth-child(3)>div:nth-child(1) {
    width: 30%;
    padding: 2%;
}

#cont>div:nth-child(3)>div:nth-child(2) {
    width: 10%;
}

#cont>div:nth-child(3)>div:nth-child(3) {
    width: 10%;
}

.slideup-enter-active, .slideup-leave-active {
  transition: transform 1s ease;
}
.slideup-enter-from {
  transform: translateY(300%);
}
.slideup-leave-to{
  transform: translateY(300%);
}

.ellipse {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    text-align: left;
    font-size: small;
    color: white;
    width: 20vw;
}

@media (max-width: 600px) {

    #cont>div:nth-child(1),
    #cont>div:nth-child(3) {
        display: none;
    }

    #cont>div:nth-child(2) {
        width: 95%;
        margin: auto;
    }
}
</style>