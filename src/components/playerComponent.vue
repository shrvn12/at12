<template>
    <div id="cont">
        <div v-show="showVideo && this.$route.name == 'nowPlaying'">
            <div id="player" style="height: 30vh; width: 90%;"></div>
        </div>
        <div style="border: 0px solid green; width: 100%; height: min-content; margin-top: -5px;">
            <div style=" z-index: 1;cursor: pointer; border: 0px solid white; position: absolute; width: 100%; margin-top: -1%; height: min-content; display: flex; justify-content: space-between; align-items: center;" @click="() => { $router.push(`/playing/${queue[isPlayingIndex].id}`) }">
                <transition name="fade" mode="out-in">
                    <p v-if="this.$route.name !== 'nowPlaying'" class="ellipse">{{ queue.length? queue[isPlayingIndex]?.title : "" }}</p>
                </transition>
                    <p style="color: white; font-size: small; margin: 0px; text-align: right; margin-left: auto;">{{`${formatTime(currentTime)} / ${formatTime(duration)}`}}</p>
                    <v-icon @click="this.$route.name == 'nowPlaying'? goBack() : $router.push(`/playing/${queue[isPlayingIndex].id}`)" style="margin-left: 1%; transition: 0.25s;" :class="this.$route.name == 'nowPlaying'?'rotate' : ''" color="#fff">mdi-chevron-up</v-icon>
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
            
            <v-btn @click="toggleQueue()" icon :ripple="true" title="Queue" base-color="transparent">
                    <v-icon size="default" color="#fff">{{queueStore.isQueueVisible? "mdi-list-box" : "mdi-list-box-outline"}}</v-icon>
            </v-btn>
            <v-btn icon :ripple="!lyricsDisabled" title="Lyrics" base-color="transparent">
                <v-icon @click="toggleLyrics()" size="default" color="#fff">{{ queueStore.isLyricsVisible? 'mdi-music-box' : 'mdi-music-box-outline'}}</v-icon>
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
            duration: null,
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
            lyricsDisabled: false,
            thumbTimeout: null,
            showVideo: false,
            playerReady: false,
            animationFrame: null,
            pendingVideoId: null,
        }
    },
    methods: {
        goBack() {
            if(window.history.state && window.history.state.back){
                this.$router.back();
            } else{
                this.$router.push({ name: 'home' });
            }
        },
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
        toggleLyrics() {
            this.queueStore.isLyricsVisible = !this.queueStore.isLyricsVisible;
        },
        handleVolumeChange(value) {
            if (this.player) {
                this.player.setVolume(value);
            }
        },
        async play(data) {
            if (data.snippet?.resourceId?.videoId){
                data.id = data.snippet?.resourceId?.videoId
            }
            if (!data || !data.id) return;

            this.videoId = data.id || data.videoId;

            if (!this.player) {
                // First time ever: create the player with startPlayer()
                this.startPlayer(data.id);
            } else if (this.playerReady) {
                this.player.loadVideoById(data.id);
            } else {
                // Player exists but isn’t ready yet → defer
                this.pendingVideoId = data.id;
            }
            if (!this.queueStore.queue[this.queueStore.isPlayingIndex].stats){
                this.queueStore.isLoading = true;
                this.queueStore.fetchInfo(data.id).then((info) => {
                    this.queueStore.isLoading = false;
                    if (this.queueStore.queue[this.queueStore.isPlayingIndex].id == info.id) {
                        this.queueStore.queue[this.queueStore.isPlayingIndex] = info;
                    }
                    EventBus.emit('info', info);
                    this.showVideo = !info.isAudioOnly;
                }).catch((err) => {
                    console.log(err);
                    this.queueStore.isLoading = false;
                    this.toast.error('Something went wrong while getting the track');
                });
            } else {
                EventBus.emit('info', this.queueStore.queue[this.queueStore.isPlayingIndex]);
                this.showVideo = !this.queueStore.queue[this.queueStore.isPlayingIndex].isAudioOnly;
            }
            
        },
        seek() {
            this.player.seekTo(this.currentTime, true);
            EventBus.emit('updateCurrentTime', this.currentTime);
        },
        seekToTime(time) {
            if (this.player && time >= 0 && time <= this.duration) {
                this.player.seekTo(time, true);
                this.currentTime = this.player.getCurrentTime();
            }
        },
        playNext() {
            if (!this.playerReady) return;
            this.currentTime = 0;
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
                if (this.queueStore.playlist && this.queueStore.isPlayingIndex == (this.queueStore.queue.length-1)){
                    this.queueStore.isPlayingIndex = 0;
                    this.play(this.queue[this.queueStore.isPlayingIndex]);
                    if (this.$router.currentRoute?._value?.name == 'nowPlaying') {
                        this.$router.replace(`/playing/${this.queue[this.queueStore.isPlayingIndex].id}`);
                    }
                    return;
                }
                if ((this.queueStore.isPlayingIndex+1) >= this.queue.length) {
                    const lastItemId = this.queue[this.queue.length - 1]?.id;
                    if (lastItemId) {
                        return this.fetchQueue(lastItemId).then((data) => {
                            if (data.length) {
                                this.queueStore.queue = [...this.queueStore.queue, ...data];
                                this.queueStore.isPlayingIndex++;
                                this.play(this.queue[this.queueStore.isPlayingIndex]);
                                if (this.$router.currentRoute?._value?.name == 'nowPlaying') {
                                    this.$router.replace(`/playing/${this.queue[this.queueStore.isPlayingIndex].id || this.queue[this.queueStore.isPlayingIndex].id}`);
                                }
                                EventBus.emit('scrollToCurrentSong');
                            }
                        });
                    }
                    this.queueStore.isPlayingIndex = 0; // Loop back to the first track
                } else{
                    this.queueStore.isPlayingIndex++;
                    this.play(this.queue[this.queueStore.isPlayingIndex]);
                    if (this.$router.currentRoute?._value?.name == 'nowPlaying') {
                        this.$router.replace(`/playing/${this.queue[this.queueStore.isPlayingIndex].id}`);
                    }
                }
        },
        playPrev() {
            if (!this.playerReady) return;
            this.currentTime = 0;
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
            this.playerReady = true;
            this.duration = this.player.getDuration();
            // If someone queued up a pendingVideoId during init, load it now:
            if (this.pendingVideoId) {
                this.player.loadVideoById(this.pendingVideoId);
                this.pendingVideoId = null;
            } else {
                // Otherwise, just start playing whatever was in the constructor’s videoId
                this.player.playVideo();
            }
        },
        updateCurrentTime() {
            if (this.player && this.player.getCurrentTime) {
                this.currentTime = this.player.getCurrentTime();
            }
            if (this.isPlaying) {
                this.animationFrame = requestAnimationFrame(this.updateCurrentTime);
            }
        },
        cancelAnimationFrameLoop() {
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
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
                this.isPlaying = true;
                this.updateCurrentTime(); // ⬅ Start the animation loop

            }
            else {
                this.isPlaying = false;
                this.cancelAnimationFrameLoop();
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
            const initializePlayer = () => {
                this.player = new YT.Player("player", {
                height: "360",
                width: "640",
                videoId: videoId,
                playerVars: {
                    enablejsapi: 1,                        // ⬅️ explicitly enable JS API
                    origin: window.location.origin,        // ⬅️ tell YouTube which origin you’re on
                    rel: 0,
                    controls: 0,
                    modestbranding: 1,
                    disablekb: 1,
                    fs: 0,
                    iv_load_policy: 3,
                    cc_load_policy: 0,
                    autohide: 1,
                },
                events: {
                    onReady: this.onPlayerReady,
                    onStateChange: this.onPlayerStateChange,
                },
                });
            };

            // Wait for YT to be available
            if (window.YT && window.YT.Player) {
                initializePlayer();
            } else {
                window.onYouTubeIframeAPIReady = () => {
                    initializePlayer();
                };
            }
        },
        async fetchQueue(trackId) {
            return await fetch(`https://api-dqfspola6q-uc.a.run.app/music/getUpNexts/${trackId}`).then(
                async (res) => {
                    res = await res.json();
                    res = res.map((item) => {
                        item.id = item.videoId;
                        return item;
                    });
                    return res;
                }
            )
            .catch((err) => {
                console.log(err);
                this.toast.error('Something went wrong while adding to queue')
            });
        }
    },
    mounted() {
        document.addEventListener('keydown', this.handleKeyDown);
        EventBus.on('play_track', (track) => {
            track = JSON.parse(JSON.stringify(track));
            this.queueStore.isPlayingIndex = 0;
            this.queueStore.queue = [track];
            this.queueStore.playlist = null;
            this.play(track);
        });
        EventBus.on('play_playlist', (args) => {
            args = JSON.parse(JSON.stringify(args));
            this.queueStore.isPlayingIndex = args[1];
            this.queueStore.queue = args[2];
            this.queueStore.playlist = args[3];
            this.play(args[0]);
        });
        EventBus.on('onlyPlay', (track) => {
            track = JSON.parse(JSON.stringify(track));
            if (!track.id){
                track.id = track.videoId;
            }
            this.play(track);
        });
        EventBus.on('pause', () => {
            if (this.player && this.isPlaying) {
                this.togglePlayPause();
            }
        });
        EventBus.on('play', () => {
            if (this.player && !this.isPlaying) {
                this.togglePlayPause();
            }
        });
        EventBus.on('deleteFromQueue', (index) => {
            this.queue.splice(index, 1);
        })
        EventBus.on('show_video', (val) => {
            this.showVideo = val;
        })
        EventBus.on('jumpToTime', (time) => {
            this.seekToTime(time);
        });
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
        duration() {
            this.queueStore.queue[this.queueStore.isPlayingIndex].duration = this.duration;
        },
        currentTime(val){
            EventBus.emit('updateCurrentTime', val);
        }
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
    margin: auto;
    bottom: 0px;
    left: 0;
    right: 0;
    background-color: #010101;
    border: 0px solid red;
    height: 10vh;
    z-index: 1;
}

#cont>div:nth-child(1){
    position: absolute;
    width: 50%;
    top: -38vh;
    border: 0px solid red;
}

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
    width: 70%;
    text-align: left;
    font-size: small;
    color: white;
}

.rotate {
    transform: rotate(180deg);
}

@media (max-width: 675px) {
    #cont{
        width: 100%;
    }
    #cont>div:nth-child(1){
    position: absolute;
    width: 65%;
    top: -45vh;
    border: 0px solid red;
}
}
</style>