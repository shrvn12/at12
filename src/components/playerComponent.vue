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
                
            </div>

        </div>
    </div>
</template>
<script>
  /*global YT*/
import { EventBus } from '@/eventBus';

export default {
    name: "PlayerComponent",
    data: () => {
        return {
            currentTime: 0,
            isPlaying: false,
            isPlayingIndex: 0,
            playerThumb: 0,
            volThumb: 0,
            mute: false,
            volume: 1,
            persistVolHint: false,
            duration: 0,
            queue: [],
            videoId: '',
            playBackTimer: null,
            lastKeyTime: 0,  // Last key press timestamp
            keyDelay: 500
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
                return res;
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
                });
            } else {
                EventBus.emit('updateInfo', [this.queue[this.isPlayingIndex], this.queue[this.isPlayingIndex+1]]);
            }

        },
        toggleMute() {
            if (!this.player || !this.duration) return;
            if (this.mute) {
                this.player.unMute();
                this.player.setVolume(this.volume * 100);
            } else {
                this.player.mute();
            }
            this.mute = !this.mute;
        },

        handleKeyDown(event) {
            if (event.key === 'ArrowRight' && !event.ctrlKey) {
                this.currentTime = Math.min(this.currentTime + 5, this.duration); // Seek forward by 5 seconds
                this.seek(); // Call the seek function
            } else if (event.key === 'ArrowLeft' && !event.ctrlKey) {
                this.currentTime = Math.max(this.currentTime - 5, 0); // Seek backward by 5 seconds
                this.seek(); // Call the seek function
            } else if (event.key === 'ArrowUp' && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                // Only trigger if ArrowUp is pressed without any modifier keys
                if (this.volume < 1) {
                    this.volume = Math.min(this.volume + 0.01, 1); // Increase volume
                }
            } else if (event.key === 'ArrowDown' && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                // Only trigger if ArrowDown is pressed without any modifier keys
                if (this.volume > 0) {
                    this.volume -= 0.01; // Decrease volume
                }
            } else if (event.key === ' ' && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                // Check if the active element is an input or textarea
                const tagName = event.target.tagName.toLowerCase();
                const isEditable = event.target.isContentEditable;
                if (tagName !== 'input' && tagName !== 'textarea' && !isEditable) {
                    this.togglePlayPause();
                }
            } else if (event.key == "ArrowLeft" && event.ctrlKey) {
                this.playPrev();
            } else if (event.key == "ArrowRight" && event.ctrlKey) {
                this.playNext();
            } else if (event.key.toLowerCase() === 'm' && event.ctrlKey) {
                this.toggleMute();
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
                const lastTrackId = this.queue[this.queue.length-1].id;
                if (!lastTrackId) {
                    return;
                }
                fetch(`https://api-dqfspola6q-uc.a.run.app/music/getQueue?videoId=${lastTrackId}`).then(
                    async (res) => {
                        res = await res.json();
                        if (res.length) {
                            this.queue = [...this.queue, ...res];
                        }
                    }
                )
                .catch((err) => {
                    console.log(err);
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
        }
    }
}
</script>

<style scoped>
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
    /* border: 1px solid yellow; */
    display: flex;
    align-items: center;
    justify-content: space-evenly;
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

#cont>div:nth-child(3) {
    justify-content: right;
}

#cont>div:nth-child(3)>div {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
}

#cont>div:nth-child(3)>div:nth-child(1) {
    width: 30%;
}

#cont>div:nth-child(3)>div:nth-child(2) {
    width: 15%;
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