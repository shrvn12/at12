<template>
    <div id="cont" :style="{ display: queue.length ? 'flex' : 'none' }">
        <div>
            <div id="player" style="height: 0px; width: 0px;"></div>
        </div>

        <div>
            <div class="buttons">
                <!-- Previous Button -->
                <v-btn @click="playPrev" icon :ripple="true" title="Previous" base-color="transparent">
                    <v-icon size="xx-large" color="#fff">mdi-skip-previous</v-icon>
                </v-btn>
                <!-- Play/Pause Button -->
                <v-btn base-color="transparent" icon :title="isPlaying ? 'Pause' : 'Play'" @click="togglePlayPause">
                    <v-icon :color="'#fff'" size="xx-large">{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
                </v-btn>
                <!-- Next Button -->
                <v-btn @click="playNext" icon :ripple="true" title="Next" base-color="transparent">
                    <v-icon size="xx-large" color="#fff">mdi-skip-next</v-icon>
                </v-btn>
            </div>
            <!-- Progress Bar -->
            <v-slider 
            style="margin:  2px !important;"
            v-model="currentTime"
            :max="duration"
            step="1"
            class="mt-4"
            color="#fc2c55"
            track-color="#fff"
            :label="`${formatTime(currentTime)} / ${formatTime(duration)}`"
            :thumb-size=playerThumb
            :thumb-label="false"
            track-size="2"
            persistent-hint
            @mouseover="() => { playerThumb = 12 }"
            @mouseleave="() => { playerThumb = 0 }"
            @update:modelValue="seek"
            ></v-slider>
        </div>

        <div>
            <div>
                <v-btn icon :ripple="true" :title="mute ? 'Unmute' : 'Mute'" base-color="transparent"
                    @click="toggleMute">
                    <v-icon v-if="mute" color="#fff" size="large">mdi-volume-off</v-icon>
                    <v-icon v-else-if="(volume*100) < 30" color="#fff" size="large">mdi-volume-low</v-icon>
                    <v-icon v-else-if="(volume*100) < 60" color="#fff" size="large">mdi-volume-medium</v-icon>
                    <v-icon v-else color="#fff" size="large">mdi-volume-high</v-icon>
                </v-btn>
                <v-slider ref="volumeControl" style="margin: 0px !important; height:35px;" v-model="volume" :max="1"
                    step="0.01" class="ml-2" track-size="2" :thumb-size="volThumb" track-fill-color="#fff" color="#fc2c55"
                    track-color="#ffff"
                    @update:model-value="adjustVolume" @mouseover="() => { volThumb = 12 }"
                    @mouseleave="() => { volThumb = 0 }"></v-slider>
            </div>

            <div>
                <v-icon title="Queue" color="#fff" size="large" @click="toggleQueue()">{{ isQueueVisible? 'mdi-list-box' : 'mdi-list-box-outline'}}</v-icon>
            </div>

            <div>
                 <v-icon :disabled="!queue[isPlayingIndex]?.lyrics" title="Lyrics" color="#fff" size="large" @click="toggleLyrics()">{{ isLyricsVisible? 'mdi-music-box' : 'mdi-music-box-outline'}}</v-icon>
            </div>

        </div>
    </div>
</template>
<script>
  /*global YT*/
import { EventBus } from '@/eventBus';
import { useToast } from 'vue-toastification';

export default {
    name: "PlayerComponent",
    data: () => {
        return {
            toast: useToast(),
            currentTime: 0,
            isPlaying: false,
            isPlayingIndex: 0,
            playerThumb: 0,
            volThumb: 0,
            mute: false,
            volume: 1,
            duration: 0,
            queue: [],
            videoId: '',
            playBackTimer: null,
            lastKeyTime: 0,  // Last key press timestamp
            keyDelay: 500,
            isQueueVisible: localStorage.getItem('queue') == 'false'? false : true,
            isLyricsVisible: false
        }
    },
    methods: {
        togglePlayPause() {
            if (!this.player) {
                return;
            }
            this.isPlaying ? this.player.pauseVideo() : this.player.playVideo();
            // this.isPlaying = !this.isPlaying
        },

        async loadInfo(id, index){
            if (!id) {
                return;
            }
            return fetch(`https://api-dqfspola6q-uc.a.run.app/music/getInfo?id=${id}`).then(async (res) => {
                res = await res.json();
                this.queue[index].stats = res.stats;
                this.queue[index].artist = res.artist;
                this.queue[index].lyrics = res.lyrics;
                if (!res.lyrics) {
                    this.isLyricsVisible = false;
                }
                return res;
            }).catch((err) => {
                console.log(err);
                this.toast.err('Something went wrong while getting info')
            })
        },

        async play(data) {
            if (!data || !data.id) {
                return;
            }
            this.videoId = data.id;
            !this.player? this.startPlayer(data.id) : this.player.loadVideoById(this.queue[this.isPlayingIndex]?.id)
         

            if (!this.queue[this.isPlayingIndex]?.stats) {
                this.loadInfo(this.queue[this.isPlayingIndex]?.id, this.isPlayingIndex).then(() => {
                    EventBus.emit('updateInfo', [this.queue[this.isPlayingIndex], this.queue[this.isPlayingIndex+1]]);
                }).catch((err) => {
                    console.log(err);
                    this.toast.err('Something went wrong while loading info')
                });
            } else {
                EventBus.emit('updateInfo', [this.queue[this.isPlayingIndex], this.queue[this.isPlayingIndex+1]]);
            }

        },
        toggleMute() {
            if (!this.player || !this.duration) return;
            if (this.mute) {
                this.player.unMute();
            } else {
                this.player.mute();
            }
            this.mute = !this.mute;
        },
        toggleQueue() {
            this.isQueueVisible = !this.isQueueVisible;
            localStorage.setItem('queue', this.isQueueVisible);
            EventBus.emit('toggleQueue', this.isQueueVisible);
        },
        toggleLyrics() {
            this.isLyricsVisible = !this.isLyricsVisible;
            localStorage.setItem('lyrics', this.isQueueVisible);
            EventBus.emit('toggleLyrics', this.isLyricsVisible);
        },
        handleKeyDown(event) {
            // Check if the active element is a form control like input or textarea
            const tagName = event.target.tagName.toLowerCase();
            const isEditable = event.target.isContentEditable;
            const isInputElement = tagName === 'input' || tagName === 'textarea';

            // If the active element is an input field or is editable, do not handle keydown for controls
            if (isInputElement || isEditable) return;

            // Space bar triggers play/pause
            if (event.key === ' ' && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                const isButtonOrLink = tagName === 'button' || tagName === 'a';
                if (isButtonOrLink) {
                    // Apply blur to remove focus from button or link after spacebar press
                    event.target.blur();
                    this.togglePlayPause(); // Trigger play/pause
                    return; // Prevent the default action of button press
                } else {
                    // Trigger play/pause if focus is not on button or link
                    this.togglePlayPause();
                }
            }

            // Seek forward by 5 seconds if arrow right is pressed (except when typing in input)
            if (event.key === 'ArrowRight' && !event.ctrlKey && !isInputElement) {
                this.currentTime = Math.min(this.currentTime + 5, this.duration);
                this.seek();
            }
            // Seek backward by 5 seconds if arrow left is pressed (except when typing in input)
            else if (event.key === 'ArrowLeft' && !event.ctrlKey && !isInputElement) {
                this.currentTime = Math.max(this.currentTime - 5, 0);
                this.seek();
            }
            // Increase volume if arrow up is pressed (except when typing in input)
            else if (event.key === 'ArrowUp' && !event.ctrlKey && !event.shiftKey && !event.altKey && !isInputElement) {
                if (this.volume < 1) {
                    this.volume = Math.min(this.volume + 0.01, 1);
                }
            }
            // Decrease volume if arrow down is pressed (except when typing in input)
            else if (event.key === 'ArrowDown' && !event.ctrlKey && !event.shiftKey && !event.altKey && !isInputElement) {
                if (this.volume > 0) {
                    this.volume -= 0.01;
                }
            }
            // Handle next and previous track controls with ctrl + arrow keys
            else if (event.key == "ArrowLeft" && event.ctrlKey) {
                this.playPrev();
            } else if (event.key == "ArrowRight" && event.ctrlKey) {
                this.playNext();
            }
            // Mute toggle with ctrl + M
            else if (event.key.toLowerCase() === 'm' && event.ctrlKey) {
                this.toggleMute();
            }
            // Mute toggle with ctrl + Q
            else if (event.key.toLowerCase() === 'q' && event.ctrlKey) {
                this.toggleQueue();
            }
        },

        adjustVolume(newVolume) {
            if (!this.player) return;
            this.volume = newVolume;
            if (!this.mute) {
                this.player.setVolume(newVolume * 100);
            }
        },
        seek() {
            this.player.seekTo(this.currentTime, true);
        },
        playNext() {
            const currentTime = new Date().getTime(); // Get the current timestamp
            if (currentTime - this.lastKeyTime < this.keyDelay) {
                return;
            }
            this.lastKeyTime = currentTime;
            this.isPlayingIndex++;
            this.play(this.queue[this.isPlayingIndex]);
            EventBus.emit('clearSearch');
            if (this.queue.length - this.isPlayingIndex < 4) {
                this.toast.info('Adding more songs to queue');
                const lastTrackId = this.queue[this.queue.length-1].id;
                if (!lastTrackId) {
                    return;
                }
                fetch(`https://api-dqfspola6q-uc.a.run.app/music/getQueue?videoId=${lastTrackId}`).then(
                    async (res) => {
                        let data = await res.json();
                        if (data.length) {
                            // Check if the first item in the response matches the last item in the queue
                            if (this.queue.length && data[0].id === this.queue[this.queue.length - 1].id) {
                                data.shift(); // Remove the first item
                            }

                            if (data.length) { // Add remaining items if any
                                if (this.isPlayingIndex >= this.queue.length) {
                                    this.queue = [...this.queue, ...data];
                                    this.play(this.queue[this.isPlayingIndex]);
                                    EventBus.emit('isPlayingIndex', this.isPlayingIndex);
                                } else {
                                    this.queue = [...this.queue, ...data];
                                }
                            }
                        }
                    }
                )
                .catch((err) => {
                    console.log(err);
                    this.toast.err('Something went wrong while adding to queue')
                });
            }
        },
        playPrev() {
            const currentTime = new Date().getTime(); // Get the current timestamp
            if (currentTime - this.lastKeyTime < this.keyDelay) {
                return;
            }
            this.lastKeyTime = currentTime;
            this.isPlayingIndex--;
            this.play(this.queue[this.isPlayingIndex]);
        },
        formatTime(seconds) {
            if (isNaN(seconds)) return '00:00';
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
            return `${minutes}:${secs}`;
        },
        onPlayerReady(){
            this.duration = this.player.getDuration();
            this.player.playVideo();
            if (localStorage.getItem('mute') == 'true') {
                this.toggleMute();
            }
            if (localStorage.getItem('volume')){
                if (+localStorage.getItem('volume')>=0) {
                    this.adjustVolume(+localStorage.getItem('volume'));
                }
            }
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
            if (event.data === YT.PlayerState.PLAYING) {
                EventBus.emit('loading_0');
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
    },
    mounted() {
        document.addEventListener('keydown', this.handleKeyDown);
        EventBus.on('play', (queue) => {
            this.queue = queue;
            this.isPlayingIndex = 0;
            this.play(queue[0]);
        })
        EventBus.on('playIndex', (index) => {
            if (this.queue[index]){
                console.log('eventbus plyerside', index, this.queue[index]);
                this.isPlayingIndex = index;
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
        },
        isPlayingIndex(val) {
            EventBus.emit('isPlayingIndex', val);
        },
        mute(val) {
            localStorage.setItem('mute', val);
        },
        volume(val) {
            localStorage.setItem('volume', val);
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
    display: flex;
    width: 100%;
    /* border: 1px solid #fff; */
    margin: auto;
    bottom: 0px;
    left: 0;
    right: 0;
    background-color: #000;
}

#cont>div:nth-child(1),
#cont>div:nth-child(3) {
    width: 40%;
    display: flex;
    align-items: center;
    justify-content: right;
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